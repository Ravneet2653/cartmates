import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendOTPEmail } from "../services/emailService.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body; // role never read from req.body — see below

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  await User.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
    otp,
    otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  await sendOTPEmail(email, otp);

  // No token issued yet — the account isn't usable until the code is verified.
  res.status(201).json({ message: "Verification code sent", email });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account found for this email" });
  if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

  if (!user.otp || user.otp !== otp) {
    return res.status(400).json({ message: "Incorrect code" });
  }
  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Code expired — request a new one" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account found for this email" });
  if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendOTPEmail(email, otp);

  res.json({ message: "A new code has been sent" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email first", email: user.email, needsVerification: true });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Same "vague on purpose" principle as login — always respond the same
  // way whether the email exists or not, so this endpoint can't be used
  // to check which emails are registered.
  if (!user) return res.json({ message: "If that email exists, a reset code has been sent" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendOTPEmail(email, otp);

  res.json({ message: "If that email exists, a reset code has been sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid or expired code" });

  if (!user.otp || user.otp !== otp) {
    return res.status(400).json({ message: "Incorrect code" });
  }
  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Code expired — request a new one" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: "Password reset — you can log in now" });
});
