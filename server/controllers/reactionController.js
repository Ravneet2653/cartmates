import Reaction from "../models/Reaction.js";
import SharedCart from "../models/SharedCart.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getReactions = asyncHandler(async (req, res) => {
  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  const reactions = await Reaction.find({ roomCode: req.params.roomCode })
    .populate("user", "name")
    .populate("product", "name");
  res.json(reactions);
});
