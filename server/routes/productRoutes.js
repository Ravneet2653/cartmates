import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Browsing stays public — anyone can view products without an account
router.get("/", getProducts);
router.get("/:id", getProductById);

// Writing now requires BOTH login AND the admin role — previously any
// logged-in user (not just admins) could create, edit, or delete any
// product in the catalog.
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
