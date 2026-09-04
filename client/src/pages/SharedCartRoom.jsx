import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import socket from "../api/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

const EMOJIS = ["❤️", "👍", "👎", "😂", "😍"];
const VOTE_OPTIONS = ["BUY", "SKIP", "MAYBE"];
const initials = (name) => name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const decisionClass = (decision) =>
  decision === "BUY" ? "decision-buy" : decision === "SKIP" ? "decision-skip" : "decision-maybe";

export default function SharedCartRoom() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [votes, setVotes] = useState([]); // raw vote docs, aggregated on render
  const [newMessage, setNewMessage] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    api.get(`/shared-cart/${roomCode}`).then((res) => setCart(res.data)).catch(() => setError("Could not load this room — check the code or your membership"));
    api.get(`/shared-cart/${roomCode}/messages`).then((res) => setMessages(res.data));
    api.get(`/shared-cart/${roomCode}/reactions`).then((res) => setReactions(res.data));
    api.get(`/shared-cart/${roomCode}/votes`).then((res) => setVotes(res.data));
    api.get("/products").then((res) => setAllProducts(res.data.products));
  }, [roomCode]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", roomCode);

    socket.on("cartUpdated", (updatedCart) => setCart(updatedCart));
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      setTypingUser(null); // a real message arriving clears any stale "typing" state
    });
    socket.on("reactionUpdated", (reaction) => setReactions((prev) => [...prev, reaction]));

    socket.on("voteUpdated", ({ productId, voterId, vote }) => {
      // Replace this voter's previous vote on this product with their new one
      setVotes((prev) => [
        ...prev.filter((v) => !(v.product === productId || v.product?._id === productId) || (v.user?._id || v.user) !== voterId),
        { product: productId, user: { _id: voterId }, vote },
      ]);
    });

    socket.on("presenceUpdate", (members) => setOnlineMembers(members));

    socket.on("userTyping", ({ name }) => {
      setTypingUser(name);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
    });

    return () => {
      socket.off("cartUpdated");
      socket.off("receiveMessage");
      socket.off("reactionUpdated");
      socket.off("voteUpdated");
      socket.off("presenceUpdate");
      socket.off("userTyping");
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", roomCode);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", { roomCode, text: newMessage });
    setNewMessage("");
  };

  const sendReaction = (productId, emoji) => {
    socket.emit("addReaction", { roomCode, productId, emoji });
  };

  const castVote = (productId, vote) => {
    socket.emit("castVote", { roomCode, productId, vote });
  };

  const getSuggestion = async (productId) => {
    try {
      const res = await api.post("/ai/suggestion", { roomCode, productId });
      setSuggestions((prev) => ({ ...prev, [productId]: res.data }));
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not get an AI suggestion right now");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/shared-cart/${roomCode}/leave`);
      navigate("/shared-cart");
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not leave the room");
    }
  };

  const reactionsFor = (productId) => reactions.filter((r) => r.product?._id === productId || r.product === productId);

  const voteTallyFor = (productId) => {
    const relevant = votes.filter((v) => (v.product?._id || v.product) === productId);
    const tally = { BUY: 0, SKIP: 0, MAYBE: 0 };
    let myVote = null;
    relevant.forEach((v) => {
      tally[v.vote]++;
      if ((v.user?._id || v.user) === user.id) myVote = v.vote;
    });
    return { tally, myVote };
  };

  if (error) return <p className="error-text">{error}</p>;
  if (!cart) return <p>Loading room...</p>;

  const validItems = cart.items.filter((item) => item.product);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <span className="room-code">{cart.roomCode}</span>
        <div className="member-list">
          {onlineMembers.map((m) => (
            <span className="member-chip" key={m.userId}>
              <span className="avatar">{initials(m.name)}</span> {m.name}
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--buy)", display: "inline-block", marginLeft: 4 }} title="Online" />
            </span>
          ))}
        </div>
        <button className="btn btn-small btn-ghost" onClick={handleLeaveRoom} style={{ marginLeft: "auto" }}>
          Leave Room
        </button>
      </div>

      {actionError && <p className="error-text">{actionError}</p>}

      <div className="room-columns">
        <div>
          <h3>Cart Items</h3>
          {validItems.length === 0 && <p className="empty-state">No items yet — add one below.</p>}

          {validItems.length > 0 && (
            <div className="summary-card" style={{ marginBottom: 24 }}>
              {validItems.map((item) => {
                const { tally, myVote } = voteTallyFor(item.product._id);
                return (
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

                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      {VOTE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          className={`decision ${decisionClass(opt)}`}
                          style={{
                            cursor: "pointer",
                            border: myVote === opt ? "2px solid currentColor" : "2px solid transparent",
                          }}
                          onClick={() => castVote(item.product._id, opt)}
                        >
                          {opt} ({tally[opt]})
                        </button>
                      ))}
                    </div>

                    <button className="btn btn-small" onClick={() => getSuggestion(item.product._id)}>
                      ✨ Get AI Suggestion
                    </button>

                    {suggestions[item.product._id] && (
                      <div style={{ marginTop: 10 }}>
                        <span className={`decision ${decisionClass(suggestions[item.product._id].decision)}`}>
                          AI: {suggestions[item.product._id].decision}
                        </span>
                        <p className="decision-reason">{suggestions[item.product._id].reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Add a product</h3>
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
          <div style={{ height: 18, fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: 4 }}>
            {typingUser && `${typingUser} is typing...`}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              className="field"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message"
            />
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
