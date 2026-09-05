import express from "express";
import { signup, login, getMe, verifyOtp, resendOtp } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.get("/me", protect, getMe);

export default router;
