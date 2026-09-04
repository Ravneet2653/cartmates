import Product from "../models/Product.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  const filter = {};
  if (search) {
    // Case-insensitive partial match on name — e.g. ?search=shirt matches "Classic White T-Shirt"
    filter.name = { $regex: search, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter);
  res.json({ products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json(newProduct);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.status(204).send();
});
