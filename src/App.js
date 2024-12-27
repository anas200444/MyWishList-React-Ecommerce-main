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
import { AdminPanel } from "./Admin/AdminPanel"; // Correct path to AdminPanel
import { AdminRoute } from "./Routes/AdminRoute"; // Correct path to AdminRoute

function App() {
  return (
    <div className="App">
      <ShopContextProvider> {/* Wrap only ShopContextProvider */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/gameplay" element={<GamePlay />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
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
