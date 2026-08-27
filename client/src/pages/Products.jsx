import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data.products))
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (e, productId) => {
    e.stopPropagation(); // don't let the click bubble up and trigger the card's navigate
    await api.post("/cart/add", { productId, quantity: 1 });
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2>Products</h2>
      {products.length === 0 && <p className="empty-state">No products yet — add some via the API.</p>}

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
