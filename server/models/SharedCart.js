import mongoose from "mongoose";

const sharedCartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

const sharedCartSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    items: [sharedCartItemSchema],
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("SharedCart", sharedCartSchema);
