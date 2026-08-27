import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import socket from "../api/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

const EMOJIS = ["❤️", "👍", "👎", "😂", "😍"];
const initials = (name) => name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const decisionClass = (decision) =>
  decision === "BUY" ? "decision-buy" : decision === "SKIP" ? "decision-skip" : "decision-maybe";

export default function SharedCartRoom() {
  const { roomCode } = useParams();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    api.get(`/shared-cart/${roomCode}`).then((res) => setCart(res.data)).catch(() => setError("Could not load this room — check the code or your membership"));
    api.get(`/shared-cart/${roomCode}/messages`).then((res) => setMessages(res.data));
    api.get(`/shared-cart/${roomCode}/reactions`).then((res) => setReactions(res.data));
    api.get("/products").then((res) => setAllProducts(res.data.products));
  }, [roomCode]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", roomCode);

    socket.on("cartUpdated", (updatedCart) => setCart(updatedCart));
    socket.on("receiveMessage", (message) => setMessages((prev) => [...prev, message]));
    socket.on("reactionUpdated", (reaction) => setReactions((prev) => [...prev, reaction]));

    return () => {
      socket.off("cartUpdated");
      socket.off("receiveMessage");
      socket.off("reactionUpdated");
      socket.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addProductToCart = async (productId) => {
    try {
      await api.post(`/shared-cart/${roomCode}/add`, { productId, quantity: 1 });
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not add that item");
    }
  };

  const removeProductFromCart = async (productId) => {
    try {
      await api.delete(`/shared-cart/${roomCode}/remove/${productId}`);
      const res = await api.get(`/shared-cart/${roomCode}`);
      setCart(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not remove that item");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // No senderId sent — the server verifies identity from the socket's
    // own JWT (set in socket.js), not from anything the client claims.
    socket.emit("sendMessage", { roomCode, text: newMessage });
    setNewMessage("");
  };

  const sendReaction = (productId, emoji) => {
    socket.emit("addReaction", { roomCode, productId, emoji });
  };

  const getSuggestion = async (productId) => {
    try {
      const res = await api.post("/ai/suggestion", { roomCode, productId });
      setSuggestions((prev) => ({ ...prev, [productId]: res.data }));
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not get an AI suggestion right now");
    }
  };

  const reactionsFor = (productId) => reactions.filter((r) => r.product?._id === productId || r.product === productId);

  if (error) return <p className="error-text">{error}</p>;
  if (!cart) return <p>Loading room...</p>;

  // Same defensive filter as the personal cart — protects against
  // orphaned references if a product was deleted after being added here.
  const validItems = cart.items.filter((item) => item.product);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <span className="room-code">{cart.roomCode}</span>
        <div className="member-list">
          {cart.members.map((m) => (
            <span className="member-chip" key={m._id}>
              <span className="avatar">{initials(m.name)}</span> {m.name}
            </span>
          ))}
        </div>
      </div>

      {actionError && <p className="error-text">{actionError}</p>}

      <div className="room-columns">
        <div>
          <h3>Cart Items</h3>
          {validItems.length === 0 && <p className="empty-state">No items yet — add one below.</p>}

          {validItems.length > 0 && (
            <div className="summary-card" style={{ marginBottom: 24 }}>
              {validItems.map((item) => (
                <div key={item.product._id} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="summary-row" style={{ padding: 0, border: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="thumb"><ProductImage product={item.product} /></div>
                      <div>
                        <div className="item-name">{item.product.name}</div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          ₹{item.product.price} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-small btn-ghost" onClick={() => removeProductFromCart(item.product._id)}>
                      Remove
                    </button>
                  </div>

                  <div className="reaction-row">
                    {EMOJIS.map((emoji) => (
                      <button key={emoji} onClick={() => sendReaction(item.product._id, emoji)}>
                        {emoji}
                      </button>
                    ))}
                    <span className="reaction-display">
                      {reactionsFor(item.product._id).map((r) => r.emoji).join(" ")}
                    </span>
                  </div>

                  <button className="btn btn-small" onClick={() => getSuggestion(item.product._id)}>
                    ✨ Get AI Suggestion
                  </button>

                  {suggestions[item.product._id] && (
                    <div style={{ marginTop: 10 }}>
                      <span className={`decision ${decisionClass(suggestions[item.product._id].decision)}`}>
                        {suggestions[item.product._id].decision}
                      </span>
                      <p className="decision-reason">{suggestions[item.product._id].reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <h3>Add a product</h3>
          <div className="product-grid">
            {allProducts.map((p) => (
              <div className="product-card" key={p._id}>
                <div className="image-area"><ProductImage product={p} /></div>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="price">₹{p.price}</div>
                  <button className="btn btn-small" onClick={() => addProductToCart(p._id)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>Group Chat</h3>
          <div className="chat-window">
            {messages.filter((m) => m.sender).map((m) => (
              <div className="chat-message" key={m._id}>
                <span className="avatar">{initials(m.sender.name)}</span>
                <span className="bubble">
                  <span className="sender-name">{m.sender.name}</span>
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              className="field"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
