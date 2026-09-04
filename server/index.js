import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import sharedCartRoutes from "./routes/sharedCartRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import Message from "./models/Message.js";
import Reaction from "./models/Reaction.js";
import Vote from "./models/Vote.js";
import User from "./models/User.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY", "PORT"];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Check your .env file — see .env.example for the expected keys.");
  process.exit(1);
}

connectDB();

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, try again later" },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/shared-cart", sharedCartRoutes);
app.use("/api/ai", aiRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigin },
});

// Socket authentication — verifies the JWT once at connection time, and
// also fetches the user's name here so presence/typing events can display
// it without a database round-trip on every single event.
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Not authorized, no token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name");
    if (!user) return next(new Error("Not authorized, user not found"));

    socket.userId = decoded.id;
    socket.userName = user.name;
    next();
  } catch (err) {
    next(new Error("Not authorized, invalid token"));
  }
});

app.set("io", io);

// In-memory presence map: roomCode -> Map(socketId -> { userId, name }).
// Deliberately not persisted to MongoDB — presence is inherently transient
// (only true while a socket connection is open), so a database round-trip
// on every connect/disconnect would be unnecessary overhead for data that's
// wrong the instant someone closes their laptop anyway.
const roomPresence = {};

const broadcastPresence = (roomCode) => {
  const members = roomPresence[roomCode] ? Array.from(roomPresence[roomCode].values()) : [];
  // Dedupe by userId — the same person open in two tabs shouldn't show twice
  const unique = Array.from(new Map(members.map((m) => [m.userId, m])).values());
  io.to(roomCode).emit("presenceUpdate", unique);
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.userId);

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    if (!roomPresence[roomCode]) roomPresence[roomCode] = new Map();
    roomPresence[roomCode].set(socket.id, { userId: socket.userId, name: socket.userName });
    broadcastPresence(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
  });

  socket.on("sendMessage", async ({ roomCode, text }) => {
    if (!roomCode || !text) return;
    try {
      const message = await Message.create({ roomCode, sender: socket.userId, text });
      const populated = await message.populate("sender", "name");
      io.to(roomCode).emit("receiveMessage", populated);
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  });

  // Typing indicator — deliberately NOT persisted anywhere, and uses
  // socket.to() instead of io.to() so the sender doesn't receive their own
  // "is typing" event back.
  socket.on("typing", (roomCode) => {
    if (!roomCode) return;
    socket.to(roomCode).emit("userTyping", { userId: socket.userId, name: socket.userName });
  });

  socket.on("addReaction", async ({ roomCode, productId, emoji }) => {
    if (!roomCode || !productId || !emoji) {
      console.error("addReaction: ignored malformed event", { roomCode, productId, emoji });
      return;
    }
    try {
      await Reaction.deleteMany({ roomCode, product: productId, user: socket.userId });
      const reaction = await Reaction.create({ roomCode, product: productId, user: socket.userId, emoji });
      const populated = await reaction.populate("user", "name");
      io.to(roomCode).emit("reactionUpdated", populated);
    } catch (err) {
      console.error("addReaction error:", err);
    }
  });

  // Casting a vote replaces any previous vote by this user on this product
  // in this room (upsert on the compound unique index), then broadcasts the
  // updated tally so every member's UI stays in sync without a page reload.
  socket.on("castVote", async ({ roomCode, productId, vote }) => {
    if (!roomCode || !productId || !["BUY", "SKIP", "MAYBE"].includes(vote)) {
      console.error("castVote: ignored malformed event", { roomCode, productId, vote });
      return;
    }
    try {
      await Vote.findOneAndUpdate(
        { roomCode, product: productId, user: socket.userId },
        { vote },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const allVotes = await Vote.find({ roomCode, product: productId });
      const tally = { BUY: 0, SKIP: 0, MAYBE: 0 };
      allVotes.forEach((v) => tally[v.vote]++);

      io.to(roomCode).emit("voteUpdated", { productId, tally, voterId: socket.userId, vote });
    } catch (err) {
      console.error("castVote error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // socket.rooms was cleared by the time this fires in some socket.io
    // versions, so we scan our own presence map instead of relying on it.
    for (const roomCode of Object.keys(roomPresence)) {
      if (roomPresence[roomCode].has(socket.id)) {
        roomPresence[roomCode].delete(socket.id);
        broadcastPresence(roomCode);
      }
    }
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
