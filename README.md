# CartMates 🛒

**A real-time collaborative shopping platform.** Create a shared cart, invite friends or family with a room code, discuss products over live chat, react with emojis, and get an AI-powered Buy / Skip / Maybe recommendation based on the group's conversation.

Built end-to-end as a full-stack MERN project — React frontend, Node/Express backend, MongoDB database, Socket.IO for real-time sync, JWT authentication, and Gemini API for AI recommendations.

---

## Features

- **Authentication** — signup/login with JWT, passwords hashed with bcrypt
- **Product catalog** — browse products, view details, add to a personal cart
- **Shared carts** — create a room, get a unique code, invite others to join
- **Real-time sync** — cart updates, chat messages, and reactions appear instantly for everyone in the room via Socket.IO, no refresh needed
- **Group chat** — live messaging scoped to each shared cart room, persisted in MongoDB
- **Emoji reactions** — react to products in real time
- **AI recommendation** — sends product info, chat, and reactions to the Gemini API, returns a Buy / Skip / Maybe decision with a short reason
- **Security** — rate limiting on auth routes, NoSQL injection sanitization, CORS locked to the frontend origin, security headers via Helmet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios, Socket.IO client, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| Auth | JWT, bcrypt |
| AI | Google Gemini API |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Architecture

```
React Frontend
      ↓  REST API (Axios) + WebSocket (Socket.IO)
Express Backend
      ↓
MongoDB Atlas          Gemini API
(persistent data)      (AI recommendations)
```

The frontend never talks to MongoDB or the Gemini API directly — every request goes through the Express backend, which holds all secrets (API keys, JWT secret, database credentials) server-side only.

---

## Project Structure

```
cartmates/
├── server/
│   ├── config/          # Database connection
│   ├── models/          # Mongoose schemas (User, Product, Cart, SharedCart, Message, Reaction)
│   ├── controllers/     # Route logic
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, error handling, async wrapper
│   ├── services/        # Gemini AI integration
│   ├── scripts/         # Seed/cleanup/maintenance scripts
│   └── index.js         # Server entry point + Socket.IO setup
│
└── client/
    ├── src/
    │   ├── api/          # Axios instance + Socket.IO client
    │   ├── context/      # Auth state (React Context)
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Route-level pages
    │   └── styles/       # Global stylesheet
    └── index.html
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB Atlas account (free tier works)
- A Gemini API key ([ai.google.dev](https://ai.google.dev))

### Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-random-secret-string
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
```

```bash
npm start
```

Optional — seed a sample product catalog:

```bash
npm run seed
npm run update-images
```

### Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` with:

```
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

```bash
npm run dev
```

The app will be running at `http://localhost:5173`, with the API at `http://localhost:5000`.

---

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user *(protected)* |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product details |
| POST/PUT/DELETE | `/api/products` | Manage products *(protected)* |
| GET/POST/PUT/DELETE | `/api/cart` | Personal cart *(protected)* |
| POST | `/api/shared-cart/create` | Create a shared cart |
| POST | `/api/shared-cart/join` | Join by room code |
| GET | `/api/shared-cart/:roomCode` | View a shared cart *(members only)* |
| POST | `/api/ai/suggestion` | Get an AI Buy/Skip/Maybe recommendation |

### Socket.IO events

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | client → server | Join a shared cart's real-time room |
| `cartUpdated` | server → client | Broadcast when the shared cart changes |
| `sendMessage` / `receiveMessage` | both | Real-time chat |
| `addReaction` / `reactionUpdated` | both | Real-time emoji reactions |

Socket connections are authenticated via JWT (sent in the connection handshake) — the server never trusts a client-claimed user identity for chat or reactions.

---

## Deployment

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

Live app: **https://cartmates-seven.vercel.app**

---

## Author

Built by Ravneet as a full-stack learning project — covering REST APIs, real-time systems, authentication, and AI integration from the ground up.
