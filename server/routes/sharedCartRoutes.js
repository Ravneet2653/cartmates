import express from "express";
import {
  createSharedCart,
  joinSharedCart,
  getSharedCart,
  addToSharedCart,
  removeFromSharedCart,
} from "../controllers/sharedCartController.js";
import { getMessages } from "../controllers/messageController.js";
import { getReactions } from "../controllers/reactionController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route below requires a logged-in user
router.use(protect);

// Core shared cart
router.post("/create", createSharedCart);
router.post("/join", joinSharedCart);
router.get("/:roomCode", getSharedCart);
router.post("/:roomCode/add", addToSharedCart);
router.delete("/:roomCode/remove/:productId", removeFromSharedCart);

// History endpoints — used when a user joins and needs to load what
// already happened before they connected (Socket.IO only delivers NEW events)
router.get("/:roomCode/messages", getMessages);
router.get("/:roomCode/reactions", getReactions);

export default router;
