import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import { ShopContext } from "../context/shop-context";
import { useAuth } from "../User/AuthContext"; // Import useAuth to access AuthContext
import "./navbar.css";

export const Navbar = () => {
  const { wallet } = useContext(ShopContext);
  const { logout, currentUser } = useAuth(); // Get logout function and current user

  const handleLogout = async () => {
    try {
      await logout();
      alert("You have been logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="navbar">
      <div className="links">
        <Link to="/">Shop</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/cart">
          <ShoppingCart size={32} />
        </Link>
        <Link to="/gameplay">Game</Link> {/* Add link to GamePlay */}
      </div>
      <div className="wallet">
        <p>Wallet: {wallet} JD</p> {/* Display wallet balance */}
      </div>
      {currentUser && ( // Show logout button only if a user is logged in
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
};
