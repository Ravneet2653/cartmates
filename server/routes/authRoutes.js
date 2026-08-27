import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// "protect" sits between the path and the controller — this route only runs
// if the middleware calls next(), meaning the JWT was valid.
router.get("/me", protect, getMe);

export default router;
