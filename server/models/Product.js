import mongoose from "mongoose";

// Defines the shape every Product document should have.
// required: true means Mongoose blocks saving if that field is missing.
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  rating: Number,
});

// mongoose.model() turns the schema into something you can actually query:
// Product.find(), Product.create(), Product.findById(), etc.
export default mongoose.model("Product", productSchema);
