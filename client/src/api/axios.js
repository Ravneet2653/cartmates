import axios from "axios";

// One shared axios instance — every page imports THIS, never creates its own
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Runs before every request. Reads the token from localStorage (where
// AuthContext saves it on login) and attaches it automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
