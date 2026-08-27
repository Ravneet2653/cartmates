// Deleting a product doesn't clean up carts that still reference its _id —
// MongoDB has no foreign-key constraints to catch this automatically.
// This script removes any cart item (personal or shared) whose product
// no longer exists in the database.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Cart from "../models/Cart.js";
import SharedCart from "../models/SharedCart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  await connectDB();

  const validProductIds = new Set((await Product.find().select("_id")).map((p) => p._id.toString()));

  const carts = await Cart.find();
  let cartsFixed = 0;
  for (const cart of carts) {
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => validProductIds.has(item.product.toString()));
    if (cart.items.length !== before) {
      await cart.save();
      cartsFixed++;
    }
  }

  const sharedCarts = await SharedCart.find();
  let sharedFixed = 0;
  for (const sc of sharedCarts) {
    const before = sc.items.length;
    sc.items = sc.items.filter((item) => validProductIds.has(item.product.toString()));
    if (sc.items.length !== before) {
      await sc.save();
      sharedFixed++;
    }
  }

  console.log(`Fixed ${cartsFixed} personal cart(s) and ${sharedFixed} shared cart(s).`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Fix failed:", err);
  process.exit(1);
});
