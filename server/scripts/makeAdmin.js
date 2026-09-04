// Promotes a user to admin by email. Admin status is deliberately never
// self-service (see authController.js signup) — this script is the only
// way to grant it, which mirrors how real systems provision admins
// out-of-band rather than letting anyone request the role themselves.
//
// Usage: node scripts/makeAdmin.js someone@example.com
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/makeAdmin.js <email>");
  process.exit(1);
}

const run = async () => {
  await connectDB();

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`${user.name} (${user.email}) is now an admin.`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("makeAdmin failed:", err);
  process.exit(1);
});
