import "./App.css";
import { Routes, Route } from "react-router-dom";
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
import { AdminPanel } from "./Admin/AdminPanel"; 
import { AdminRoute } from "./Routes/AdminRoute"; 
import ProtectedRoute from "./Routes/ProtectedRoute"; 

function App() {
  return (
    <div className="App">
      <ShopContextProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gameplay"
            element={
              <ProtectedRoute>
                <GamePlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
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
