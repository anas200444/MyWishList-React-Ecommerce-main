import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";

// Displaying and managing items in a shopping cart
export const CartItem = (props) => {
  // Destructure data from props
  const { id, productName, price, productImage } = props.data;
  // Access shopping cart context using useContext
  const { cartItems, addToCart, removeFromCart, updateCartItemCount } = useContext(ShopContext);

  // Handle input change for quantity and ensure it's a valid number
  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateCartItemCount(newQuantity, id);
    }
  };

  return (
    <div className="cartItem">
      <img src={productImage} alt={productName} />
      <div className="description">
        <p><b>{productName}</b></p>
        <p>Price: {price} JD</p>
        <div className="countHandler">
          {/* Button to decrease quantity */}
          <button onClick={() => removeFromCart(id)}> - </button>
          {/* Input for quantity with validation */}
          <input
            type="number"
            value={cartItems[id]}
            onChange={handleQuantityChange}
            min="0"
          />
          {/* Button to increase quantity */}
          <button onClick={() => addToCart(id)}> + </button>
        </div>
      </div>
    </div>
  );
};