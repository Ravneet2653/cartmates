import Vote from "../models/Vote.js";
import SharedCart from "../models/SharedCart.js";
import asyncHandler from "../middleware/asyncHandler.js";

// GET /api/shared-cart/:roomCode/votes — loads existing votes for a user
// who just joined, same reasoning as getMessages/getReactions: sockets only
// deliver events that happen AFTER you connect.
export const getVotes = asyncHandler(async (req, res) => {
  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  const votes = await Vote.find({ roomCode: req.params.roomCode }).populate("user", "name");
  res.json(votes);
});
