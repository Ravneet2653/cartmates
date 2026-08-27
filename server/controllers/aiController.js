import Product from "../models/Product.js";
import Message from "../models/Message.js";
import Reaction from "../models/Reaction.js";
import { getAIRecommendation } from "../services/aiService.js";

// This one keeps its own try/catch (instead of relying only on asyncHandler)
// because a failed AI call should still return a usable fallback shape,
// not a generic 500 — the UI needs *something* to render either way.
export const getSuggestion = async (req, res) => {
  const { roomCode, productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const messages = await Message.find({ roomCode }).populate("sender", "name");
    const reactions = await Reaction.find({ roomCode, product: productId }).populate("user", "name");

    const result = await getAIRecommendation(product, messages, reactions);
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
