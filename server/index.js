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
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
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

// Socket authentication middleware — runs once, when a client first connects.
// The client sends its JWT via socket.handshake.auth.token (set in the
// frontend before calling socket.connect()). We verify it here, the same
// way authMiddleware.js verifies REST requests, and attach the confirmed
// user id to the socket itself. Every event handler below trusts
// socket.userId — never a value sent in the event payload — so nobody can
// impersonate another user by editing what their client sends.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Not authorized, no token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Not authorized, invalid token"));
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.userId);

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
  });

  socket.on("sendMessage", async ({ roomCode, text }) => {
    try {
      const message = await Message.create({ roomCode, sender: socket.userId, text });
      const populated = await message.populate("sender", "name");
      io.to(roomCode).emit("receiveMessage", populated);
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  });

  socket.on("addReaction", async ({ roomCode, productId, emoji }) => {
    if (!roomCode || !productId || !emoji) {
      console.error("addReaction: ignored malformed event", { roomCode, productId, emoji });
      return;
    }
    try {
      // Dedup: a user reacting again on the same product replaces their
      // previous reaction instead of stacking duplicates (#13)
      await Reaction.deleteMany({ roomCode, product: productId, user: socket.userId });
      const reaction = await Reaction.create({ roomCode, product: productId, user: socket.userId, emoji });
      const populated = await reaction.populate("user", "name");
      io.to(roomCode).emit("reactionUpdated", populated);
    } catch (err) {
      console.error("addReaction error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
