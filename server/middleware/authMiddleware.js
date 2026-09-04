import jwt from "jsonwebtoken";
import User from "../models/User.js";

// This function runs BEFORE any route it's attached to.
// It checks for a valid JWT and either lets the request through (next())
// or stops it here with a 401.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization; // expects: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1]; // grab just the token part

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // attach the user's id for the rest of the request
    next(); // pass control to the actual route handler
  } catch (err) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Runs AFTER protect. Looks up the user's CURRENT role from the database
// rather than trusting anything baked into the JWT — deliberately, so
// revoking someone's admin access takes effect immediately, without
// waiting for their existing token to expire.
const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("role");
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export default protect;
export { adminOnly };
