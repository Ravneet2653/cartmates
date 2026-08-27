// One-off script to populate the database with a real clothing catalog.
// Run with: npm run seed  (from inside server/)
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

// placehold.co generates a reliable, always-available placeholder image —
// colored tile with the product name — so nothing ever shows a broken image icon,
// unlike pulling from a live third-party photo API that can go down or rate-limit.
const img = (text, bg, color) =>
  `https://placehold.co/500x500/${bg}/${color}?text=${encodeURIComponent(text)}&font=poppins`;

const products = [
  {
    name: "Classic White T-Shirt",
    description: "100% cotton crew neck, everyday essential.",
    price: 599,
    category: "Clothing",
    rating: 4.3,
    image: img("White Tee", "f5f5f6", "282c3f"),
  },
  {
    name: "Denim Jacket",
    description: "Mid-wash trucker jacket with button front.",
    price: 2499,
    category: "Clothing",
    rating: 4.5,
    image: img("Denim Jacket", "3b5c7e", "ffffff"),
  },
  {
    name: "Slim Fit Jeans",
    description: "Stretch denim, slim fit through hip and thigh.",
    price: 1799,
    category: "Clothing",
    rating: 4.2,
    image: img("Slim Jeans", "1c2b3a", "ffffff"),
  },
  {
    name: "Floral Summer Dress",
    description: "Lightweight rayon, tiered midi hem.",
    price: 1999,
    category: "Clothing",
    rating: 4.6,
    image: img("Summer Dress", "ffe4ea", "ff3366"),
  },
  {
    name: "Wool Blend Sweater",
    description: "Ribbed crew neck, soft wool-acrylic blend.",
    price: 2199,
    category: "Clothing",
    rating: 4.4,
    image: img("Sweater", "8a6d5b", "ffffff"),
  },
  {
    name: "Running Sneakers",
    description: "Lightweight mesh upper, cushioned sole.",
    price: 3499,
    category: "Footwear",
    rating: 4.7,
    image: img("Sneakers", "ff9f1a", "ffffff"),
  },
  {
    name: "Leather Belt",
    description: "Genuine leather, brushed metal buckle.",
    price: 899,
    category: "Accessories",
    rating: 4.1,
    image: img("Belt", "5c3a2e", "ffffff"),
  },
  {
    name: "Graphic Hoodie",
    description: "Heavyweight fleece, oversized fit.",
    price: 1699,
    category: "Clothing",
    rating: 4.5,
    image: img("Hoodie", "282c3f", "ffffff"),
  },
  {
    name: "Formal Blazer",
    description: "Tailored fit, notch lapel, fully lined.",
    price: 4299,
    category: "Clothing",
    rating: 4.6,
    image: img("Blazer", "1c1c1c", "ffffff"),
  },
  {
    name: "Cotton Chinos",
    description: "Straight fit, mid-rise, stretch cotton twill.",
    price: 1499,
    category: "Clothing",
    rating: 4.3,
    image: img("Chinos", "c9b79c", "282c3f"),
  },
];

const run = async () => {
  await connectDB();
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
