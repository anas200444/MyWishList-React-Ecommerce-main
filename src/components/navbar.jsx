import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import { ShopContext } from "../context/shop-context";
import "./navbar.css";

export const Navbar = () => {
  const { wallet } = useContext(ShopContext);

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
    </div>
  );
};
