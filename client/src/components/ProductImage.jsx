import { useState } from "react";
import ProductIcon from "./ProductIcon.jsx";

// Shows the product's real image. If it's missing or fails to load,
// falls back to the generic bag icon instead of a broken-image icon.
export default function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);

  if (!product.image || failed) return <ProductIcon bare />;

  return <img src={product.image} alt={product.name} onError={() => setFailed(true)} />;
}
