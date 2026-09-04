import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: String, enum: ["BUY", "SKIP", "MAYBE"], required: true },
  },
  { timestamps: true }
);

// One vote per user per product per room — casting a new vote replaces
// the old one (enforced via findOneAndUpdate + upsert in the socket handler,
// not by rejecting duplicates).
voteSchema.index({ roomCode: 1, product: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
