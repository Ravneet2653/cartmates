import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Signup no longer logs the user in directly — it just triggers the OTP
  // email. Returns the response so the Signup page can navigate to the
  // verification screen with the email already known.
  const signup = async (name, email, password) => {
    const res = await api.post("/auth/signup", { name, email, password });
    return res.data; // { message, email } — no token yet
  };

  // Called from the verify-otp page once the user enters the correct code.
  // This is the actual point where the session starts, same shape as login.
  const verifyOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const resendOtp = async (email) => {
    await api.post("/auth/resend-otp", { email });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
