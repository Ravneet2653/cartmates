import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import SharedCartHome from "./pages/SharedCartHome.jsx";
import SharedCartRoom from "./pages/SharedCartRoom.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Navbar />
        <div className="page">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shared-cart"
              element={
                <ProtectedRoute>
                  <SharedCartHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shared-cart/:roomCode"
              element={
                <ProtectedRoute>
                  <SharedCartRoom />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Products />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
