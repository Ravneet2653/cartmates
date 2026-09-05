import Product from "../models/Product.js";
import Message from "../models/Message.js";
import Reaction from "../models/Reaction.js";
import SharedCart from "../models/SharedCart.js";
import { getAIRecommendation } from "../services/aiService.js";

export const getSuggestion = async (req, res) => {
  const { roomCode, productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cart = await SharedCart.findOne({ roomCode });
    const memberCount = cart ? cart.members.length : 1;

    // Sorted chronologically — the prompt now explicitly reasons about
    // "most recent" signals, so send order actually matters here.
    const messages = await Message.find({ roomCode })
      .populate("sender", "name")
      .sort({ createdAt: 1 });
    const reactions = await Reaction.find({ roomCode, product: productId }).populate("user", "name");

    const result = await getAIRecommendation(product, messages, reactions, memberCount);
    res.json(result);
  } catch (err) {
    console.error("AI suggestion error:", err);
    res.status(500).json({
      message: "AI recommendation failed",
      decision: "MAYBE",
      reason: "Could not reach AI service.",
    });
  }
};
