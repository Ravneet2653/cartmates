// Runs when no route matches the request at all
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Catches every error passed via next(err) from anywhere in the app.
// Must be defined with 4 params (err, req, res, next) — that's how Express
// recognizes this as error-handling middleware specifically.
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose throws this when a route param isn't a valid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Mongoose schema validation failures (missing required fields, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // MongoDB duplicate-key error — happens when a unique field (email,
  // roomCode) collides. Rare in normal use, but two near-simultaneous
  // requests (e.g. a signup race) can both pass earlier checks before
  // either write completes.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return res.status(400).json({ message: `That ${field} is already in use` });
  }

  res.status(500).json({ message: "Something went wrong on the server" });
};
