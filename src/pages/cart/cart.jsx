import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import { PRODUCTS } from "../../products"; 
import { CartItem } from "./cart-item";
import { useNavigate } from "react-router-dom";
import "./cart.css";

export const Cart = () => {
  const { cartItems, getTotalCartAmount, checkout, wallet, addToWallet } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (wallet >= totalAmount) {
      addToWallet(-totalAmount);
      checkout();
      navigate("/checkout");
    } else {
      alert(`Insufficient wallet balance. Please add funds to your wallet. Current Balance: ${wallet} JD`);
    }
  };

  return (
    <div className="cart">
      <div>
        <h1>Your Cart Items</h1>
      </div>

      <div className="cart-items">
        {PRODUCTS.filter((product) => cartItems[product.id] > 0).map((product) => (
          <CartItem key={product.id} data={product} />
        ))}
      </div>

      {totalAmount > 0 ? (
        <div className="checkout">
          <p>Subtotal: {totalAmount} JD</p>
          <p>Wallet Balance: {wallet} JD</p>
          <button onClick={() => navigate("/")}>Continue Shopping</button>
          <button onClick={handleCheckout}>Checkout with Wallet</button>
        </div>
      ) : (
        <h1>Your Shopping Cart is Empty</h1>
      )}
    </div>
  );
};