//app.js
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom"; // Import useNavigate
import { Navbar } from "./components/navbar";
import { Shop } from "./pages/shop/shop";
import { Contact } from "./pages/contact";
import { Cart } from "./pages/cart/cart";
import { GamePlay } from "./pages/gameplay/gameplay";
import { ShopContextProvider } from "./context/shop-context";
import Login from "./User/Login";
import SignUp from "./User/SignUp";
import ForgotPassword from "./User/Forgotpassword";
import Profile from "./User/Profile";
import TwoFactorAuth from "./User/TwoFactorAuth";
import { AdminPanel } from "./Admin/AdminPanel";
import { AdminRoute } from "./Routes/AdminRoute";
import ProtectedRoute from "./Routes/ProtectedRoute";
import { useState, useEffect } from "react";

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate(); // Use the useNavigate hook

  useEffect(() => {
    const storedVerificationStatus = localStorage.getItem("isVerified");
    if (storedVerificationStatus === "true") {
      setIsVerified(true);
    }
  }, []);

  const handleVerificationComplete = (verified) => {
    if (verified) {
      console.log("Verification successful");
      localStorage.setItem("isVerified", "true");
      setIsVerified(true);
    } else {
      console.log("Verification failed");
      localStorage.removeItem("isVerified");
      setIsVerified(false);
    }
  };

  const handleLogout = () => {
    setIsVerified(false);
    localStorage.removeItem("isVerified");
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <div className="App">
      <ShopContextProvider>
        {isVerified && <Navbar isVerified={isVerified} onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route
            path="/2fa"
            element={<TwoFactorAuth onVerificationComplete={handleVerificationComplete} />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute isVerified={isVerified}>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute isVerified={isVerified}>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute isVerified={isVerified}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gameplay"
            element={
              <ProtectedRoute isVerified={isVerified}>
                <GamePlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isVerified={isVerified}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Routes>
      </ShopContextProvider>
    </div>
  );
}

export default App;