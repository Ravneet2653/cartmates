import jwt from "jsonwebtoken";

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

export default protect;
