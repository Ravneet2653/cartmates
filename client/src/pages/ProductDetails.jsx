import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    await api.post("/cart/add", { productId: product._id, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <button className="btn btn-small btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        <div className="image-area" style={{ width: 340, height: 340, borderRadius: 6 }}>
          <ProductImage product={product} />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          {product.category && (
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              {product.category}
            </span>
          )}
          <h2 style={{ marginTop: 6 }}>{product.name}</h2>
          <div className="price" style={{ fontSize: "1.4rem", marginBottom: 12 }}>₹{product.price}</div>

          {product.rating && (
            <div style={{ color: "var(--maybe)", fontWeight: 600, marginBottom: 16 }}>
              ★ {product.rating} / 5
            </div>
          )}

          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 480 }}>
            {product.description || "No description available for this product."}
          </p>

          {user && (
            <button className="btn btn-primary" onClick={addToCart} style={{ marginTop: 20 }}>
              {added ? "Added ✓" : "Add to Bag"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
