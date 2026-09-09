# CartMates 🛒

**A real-time collaborative shopping platform.** Create a shared cart, invite friends or family with a room code (or a direct link), discuss products over live chat, react with emojis, vote Buy/Skip/Maybe as a group, and get an AI-powered recommendation based on the conversation.

Built end-to-end as a full-stack MERN project — React frontend, Node/Express backend, MongoDB database, Socket.IO for real-time sync, JWT authentication with email OTP verification, and Google's Gemini API for AI recommendations.

🔗 **Live Demo:** [cartmates-seven.vercel.app](https://cartmates-seven.vercel.app)
📦 **Source:** [github.com/Ravneet2653/cartmates](https://github.com/Ravneet2653/cartmates)

---

## Features

- **Secure authentication** — signup with email OTP verification, JWT sessions, bcrypt password hashing, forgot/reset password flow
- **Role-based access control** — admin-only product management, separate from regular shopper accounts
- **Product catalog** — browse, search, and filter by category; full product detail pages
- **Personal cart** — add, update, and remove items
- **Shared cart rooms** — create a room, get a unique code, invite others to join
- **Shareable invite links** — `/join?roomCode=...` links that auto-join a logged-in user, or carry a new user through signup/OTP straight into the room
- **Real-time sync** — cart updates, chat, reactions, and votes appear instantly for everyone in the room via Socket.IO
- **Group chat** — live messaging with a typing indicator, persisted in MongoDB
- **Emoji reactions** — react to products in real time (one active reaction per user per product)
- **Group voting** — members cast their own Buy/Skip/Maybe vote alongside the AI's recommendation
- **Online presence** — see who's currently active in a shared cart room
- **AI recommendation** — Gemini analyzes the product, chat, and reactions; adapts its reasoning for solo shoppers vs. groups, and explicitly flags conflicting signals instead of guessing
- **My Rooms** — rejoin any shared cart you're a member of without re-entering the code
- **Security** — rate limiting on auth routes, NoSQL injection sanitization, CORS restricted to the frontend origin, Helmet security headers, JWT-authenticated Socket.IO connections
- **Fully responsive** — usable on mobile, tablet, and desktop
- **Automated tests** — Jest + Supertest covering authentication and authorization, run against an in-memory MongoDB instance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios, Socket.IO client, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO (JWT-authenticated) |
| Auth | JWT, bcrypt, email OTP verification |
| Email | EmailJS (OTP delivery, password reset) |
| AI | Google Gemini API |
| Testing | Jest, Supertest, mongodb-memory-server |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Architecture

```
React Frontend
      ↓  REST API (Axios) + JWT-authenticated WebSocket (Socket.IO)
Express Backend
      ↓
MongoDB Atlas          EmailJS              Gemini API
(persistent data)      (OTP delivery)       (AI recommendations)
```

The frontend never talks to MongoDB, EmailJS, or Gemini directly — every request goes through the Express backend, which holds all secrets (API keys, JWT secret, database credentials) server-side only.

---

## Project Structure

```
cartmates/
├── server/
│   ├── config/          # Database connection
│   ├── models/          # User, Product, Cart, SharedCart, Message, Reaction, Vote
│   ├── controllers/     # Route logic
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, admin-only, error handling, async wrapper
│   ├── services/        # Gemini AI and EmailJS integrations
│   ├── scripts/         # Seed/cleanup/admin-promotion scripts
│   ├── tests/           # Jest + Supertest test suite
│   └── index.js         # Server entry point + Socket.IO setup
│
└── client/
    ├── src/
    │   ├── api/          # Axios instance + Socket.IO client
    │   ├── context/      # Auth state (React Context)
    │   ├── components/   # Reusable UI components, ErrorBoundary
    │   ├── pages/         # Route-level pages
    │   └── styles/       # Global stylesheet
    └── index.html
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB Atlas account (free tier works)
- A Gemini API key ([ai.google.dev](https://ai.google.dev))
- An EmailJS account ([emailjs.com](https://emailjs.com)) with a connected email service and a template

### Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-random-secret-string
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
EMAILJS_SERVICE_ID=your-emailjs-service-id
EMAILJS_TEMPLATE_ID=your-emailjs-template-id
EMAILJS_PUBLIC_KEY=your-emailjs-public-key
EMAILJS_PRIVATE_KEY=your-emailjs-private-key
```

```bash
npm start
```

Optional — seed a sample product catalog:

```bash
npm run seed
npm run update-images
```

Promote an account to admin:

```bash
npm run make-admin your-email@example.com
```

Run the test suite:

```bash
npm test
```

### Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`, with the API at `http://localhost:5000`.

---

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account (triggers OTP email) |
| POST | `/api/auth/verify-otp` | Verify email, receive JWT |
| POST | `/api/auth/resend-otp` | Resend verification code |
| POST | `/api/auth/login` | Log in (blocked if unverified) |
| POST | `/api/auth/forgot-password` | Request a password reset code |
| POST | `/api/auth/reset-password` | Reset password with code |
| GET | `/api/auth/me` | Get current user *(protected)* |
| GET | `/api/products` | List products, supports `?search=` and `?category=` |
| GET | `/api/products/:id` | Product details |
| POST/PUT/DELETE | `/api/products` | Manage products *(admin only)* |
| GET/POST/PUT/DELETE | `/api/cart` | Personal cart *(protected)* |
| GET | `/api/shared-cart/mine` | List rooms the user is a member of |
| POST | `/api/shared-cart/create` | Create a shared cart |
| POST | `/api/shared-cart/join` | Join by room code |
| GET | `/api/shared-cart/:roomCode` | View a shared cart *(members only)* |
| POST | `/api/shared-cart/:roomCode/leave` | Leave a room |
| POST | `/api/ai/suggestion` | Get an AI Buy/Skip/Maybe recommendation |

### Socket.IO events

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | client → server | Join a shared cart's real-time room |
| `cartUpdated` | server → client | Broadcast when the shared cart changes |
| `sendMessage` / `receiveMessage` | both | Real-time chat |
| `typing` / `userTyping` | both | Typing indicator |
| `addReaction` / `reactionUpdated` | both | Real-time emoji reactions |
| `castVote` / `voteUpdated` | both | Real-time group voting |
| `presenceUpdate` | server → client | Who's currently online in the room |

Socket connections are authenticated via JWT sent in the connection handshake — the server verifies identity once at connection time and never trusts a client-claimed user ID in any event payload.

---

## Deployment

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

Live app: **https://cartmates-seven.vercel.app**

---

## Author

Built by Ravneet Kaur as a full-stack learning project — covering REST APIs, real-time systems, authentication, role-based access control, and AI integration from the ground up.
