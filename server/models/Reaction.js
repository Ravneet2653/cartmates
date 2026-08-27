import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Reaction", reactionSchema);
