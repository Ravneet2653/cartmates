import mongoose from "mongoose";

// unique: true means MongoDB will reject a second user with the same email.
// timestamps: true auto-adds createdAt / updatedAt fields.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // always the HASHED password, never plain text
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
