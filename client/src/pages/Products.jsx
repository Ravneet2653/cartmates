import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

const CATEGORIES = ["All", "Clothing", "Footwear", "Accessories"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);

    api
      .get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data.products))
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, [search, category]);

  const addToCart = async (e, productId) => {
    e.stopPropagation();
    await api.post("/cart/add", { productId, quantity: 1 });
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div>
      <h2>Products</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="field"
          style={{ marginBottom: 0, maxWidth: 260 }}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field"
          style={{ marginBottom: 0, maxWidth: 180 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="empty-state">No products match your search.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product._id}
            onClick={() => navigate(`/products/${product._id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="image-area">
              <ProductImage product={product} />
            </div>
            <div className="info">
              <div className="name">{product.name}</div>
              <div className="price">₹{product.price}</div>
              {user && (
                <button className="btn btn-small" onClick={(e) => addToCart(e, product._id)}>
                  {addedId === product._id ? "Added ✓" : "Add to Bag"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
