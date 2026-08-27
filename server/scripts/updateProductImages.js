// Updates real image URLs on existing products, matched by name.
// Add more entries to imageMap as you find photos — run this again anytime,
// it only touches products whose name matches a key below.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

const imageMap = {
  "Classic White T-Shirt": "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Denim Jacket": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Slim Fit Jeans": "https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Floral Summer Dress": "https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmxvcmFsJTIwc3VtbWVyJTIwZHJlc3N8ZW58MHx8MHx8fDA%3D",
  "Wool Blend Sweater": "https://images.unsplash.com/photo-1670603917227-3fd6882dbf97?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Running Sneakers": "https://images.unsplash.com/photo-1637437757614-6491c8e915b5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJ1bm5pbmclMjBzbmVha2Vyc3xlbnwwfHwwfHx8MA%3D%3D",
  "Leather Belt": "https://images.unsplash.com/photo-1752386223406-b3d94092d790?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww",
  "Graphic Hoodie": "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG9vZGllfGVufDB8fDB8fHww",
  "Formal Blazer": "https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJsYXplcnxlbnwwfHwwfHx8MA%3D%3D",

  // Cotton Chinos: still needs a real URL — the one used before was actually the denim jacket
};

const run = async () => {
  await connectDB();

  for (const [name, image] of Object.entries(imageMap)) {
    const result = await Product.updateOne({ name }, { $set: { image } });
    if (result.matchedCount === 0) {
      console.log(`No product found named "${name}" — skipped`);
    } else {
      console.log(`Updated image for "${name}"`);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
