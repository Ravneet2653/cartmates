import { useState, useEffect } from "react";
import api from "../api/axios.js";
import ProductImage from "../components/ProductImage.jsx";

// Local text state, separate from the actual quantity — lets you clear the
// field and type freely (e.g. "12" -> "" -> "5") without the API being
// called on every keystroke, and without min="1" fighting you mid-type.
// Only commits (and calls the API) on blur or Enter.
function QuantityInput({ value, onCommit }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const num = parseInt(text, 10);
    if (!Number.isNaN(num) && num >= 1) {
      if (num !== value) onCommit(num);
    } else {
      setText(String(value)); // invalid/empty — revert instead of sending a bad value
    }
  };

  return (
    <input
      className="quantity-input"
      type="number"
      min="1"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur(); // Enter commits, same as clicking away
      }}
    />
  );
}

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadCart = () => {
    api
      .get("/cart")
      .then((res) => setCart(res.data))
      .catch(() => setError("Could not load cart"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await api.put("/cart/update", { productId, quantity });
      loadCart();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      loadCart();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not remove item");
    }
  };

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="error-text">{error}</p>;

  // Defensive filter: if a product was deleted after being added to someone's
  // cart, item.product comes back null from populate(). Skip those rather
  // than crash the whole page trying to read .price off null.
  const validItems = cart.items.filter((item) => item.product);

  const total = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div>
      <h2>My Bag</h2>
      {actionError && <p className="error-text">{actionError}</p>}
      {validItems.length === 0 && <p className="empty-state">Your bag is empty — go add something.</p>}

      {validItems.length > 0 && (
        <div className="summary-card">
          {validItems.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="thumb"><ProductImage product={item.product} /></div>
                <span className="item-name">{item.product.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="item-price">₹{item.product.price}</span>
                <QuantityInput
                  value={item.quantity}
                  onCommit={(quantity) => updateQuantity(item.product._id, quantity)}
                />
                <button className="btn btn-small btn-ghost" onClick={() => removeItem(item.product._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="summary-row">
            <strong>Total</strong>
            <span className="item-price" style={{ fontSize: "1.1rem" }}>₹{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
