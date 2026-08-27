import { io } from "socket.io-client";

// autoConnect: false — we connect manually once a user enters a shared cart room.
// auth is set fresh (not baked in at creation) since the token can change
// between logins/logouts during the same browser session.
const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

export default socket;
