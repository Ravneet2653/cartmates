import express from "express";
import { getSuggestion } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/suggestion", protect, getSuggestion);

export default router;
