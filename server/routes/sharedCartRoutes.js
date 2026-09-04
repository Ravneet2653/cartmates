import express from "express";
import {
  createSharedCart,
  joinSharedCart,
  getSharedCart,
  addToSharedCart,
  removeFromSharedCart,
  leaveSharedCart,
} from "../controllers/sharedCartController.js";
import { getMessages } from "../controllers/messageController.js";
import { getReactions } from "../controllers/reactionController.js";
import { getVotes } from "../controllers/voteController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Core shared cart
router.post("/create", createSharedCart);
router.post("/join", joinSharedCart);
router.get("/:roomCode", getSharedCart);
router.post("/:roomCode/add", addToSharedCart);
router.delete("/:roomCode/remove/:productId", removeFromSharedCart);
router.post("/:roomCode/leave", leaveSharedCart);

// History endpoints — loaded once on joining, live updates come via Socket.IO after
router.get("/:roomCode/messages", getMessages);
router.get("/:roomCode/reactions", getReactions);
router.get("/:roomCode/votes", getVotes);

export default router;
