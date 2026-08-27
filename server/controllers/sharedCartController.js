import SharedCart from "../models/SharedCart.js";
import asyncHandler from "../middleware/asyncHandler.js";

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const createSharedCart = asyncHandler(async (req, res) => {
  // Extremely unlikely to collide (36^6 possibilities), but retrying costs
  // nothing and turns a rare hard failure into an invisible non-issue.
  let cart;
  for (let attempts = 0; attempts < 5; attempts++) {
    try {
      const roomCode = generateRoomCode();
      cart = await SharedCart.create({
        roomCode,
        createdBy: req.user.id,
        members: [req.user.id],
        items: [],
      });
      break;
    } catch (err) {
      if (err.code === 11000 && attempts < 4) continue; // roomCode collision — try again
      throw err;
    }
  }
  res.status(201).json(cart);
});

export const joinSharedCart = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;
  const cart = await SharedCart.findOne({ roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const alreadyMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!alreadyMember) cart.members.push(req.user.id);

  await cart.save();
  res.json(cart);
});

export const getSharedCart = asyncHandler(async (req, res) => {
  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode })
    .populate("items.product")
    .populate("members", "name email");
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((m) => m._id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  res.json(cart);
});

export const addToSharedCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be a positive whole number" });
  }

  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  const io = req.app.get("io");
  io.to(req.params.roomCode).emit("cartUpdated", cart);

  res.status(201).json(cart);
});

export const removeFromSharedCart = asyncHandler(async (req, res) => {
  const cart = await SharedCart.findOne({ roomCode: req.params.roomCode });
  if (!cart) return res.status(404).json({ message: "Room not found" });

  const isMember = cart.members.some((id) => id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ message: "Not a member of this cart" });

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});
