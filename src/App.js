import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Shop } from "./pages/shop/shop";
import { Contact } from "./pages/contact";
import { Cart } from "./pages/cart/cart";
import { GamePlay } from "./pages/gameplay/gameplay";
import { ShopContextProvider } from "./context/shop-context";
import { AuthProvider } from "./User/AuthContext"; // Use AuthProvider
import Login from "./User/Login";
import SignUp from "./User/SignUp";
import ForgotPassword from "./User/Forgotpassword";
import Profile from "./User/Profile";
// import Profile from "./User/Profile";

function App() {
  return (
    <div className="App">
      <AuthProvider> {/* AuthProvider should wrap the ShopContextProvider */}
        <ShopContextProvider>
          <Router>
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
            </Routes>
          </Router>
        </ShopContextProvider>
      </AuthProvider>
    </div>
  );
}


export default App;
