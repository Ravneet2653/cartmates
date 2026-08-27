import Message from "../models/Message.js";
import SharedCart from "../models/SharedCart.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getMessages = asyncHandler(async (req, res) => {
  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  const messages = await Message.find({ roomCode: req.params.roomCode })
    .populate("sender", "name")
    .sort({ createdAt: 1 });
  res.json(messages);
});
