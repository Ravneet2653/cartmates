import mongoose from "mongoose";

// Connects to MongoDB Atlas using the connection string in .env
// Called once, when the server starts (see index.js)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Fail loudly and immediately rather than running with every route
    // silently broken — a dead DB connection should stop the server, not
    // let it start and confuse every request that touches the database.
    process.exit(1);
  }
};

export default connectDB;
