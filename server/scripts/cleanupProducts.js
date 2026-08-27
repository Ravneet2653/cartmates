// One-off cleanup — removes specific products by name.
// Edit namesToRemove and re-run anytime you need to delete test/mistaken entries.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

const namesToRemove = ["Mouse", "Cotton Chinos"];

const run = async () => {
  await connectDB();

  const result = await Product.deleteMany({ name: { $in: namesToRemove } });
  console.log(`Deleted ${result.deletedCount} product(s) matching: ${namesToRemove.join(", ")}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
