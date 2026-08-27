import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Browsing stays public — anyone can view products without an account
router.get("/", getProducts);
router.get("/:id", getProductById);

// Writing requires login — previously anyone, logged in or not, could
// create/edit/delete products
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
