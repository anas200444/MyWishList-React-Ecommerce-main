import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";

// Functional component. Accepts a single prop, props, an object containing data about the product.
export const Product = (props) => {
  const { id, productName, price, productImage } = props.data;    // Destructures the props.data object
  const { addToCart, cartItems } = useContext(ShopContext);     // Uses the useContext hook to access the shopping cart context

  const cartItemCount = cartItems[id];

  // The component returns JSX to render the product image, name, and price.
  // It also renders a button that calls the addToCart function when clicked.
  return (
    <div className="product">
      {/* Update alt attribute to describe the content without redundancy */}
      <img src={productImage} alt={productName} /> 
      <div className="description">
        <p>
          <b>{productName}</b>
        </p>
        <p> {price} JD </p>
      </div>
      {/* When the button is clicked, it calls the addToCart function with the product's id as an argument. */}
      <button className="addToCartBttn" onClick={() => addToCart(id)}>
        Add To Cart {cartItemCount > 0 && <> ({cartItemCount}) </>} {/* Displays the number of items in the cart for the specific product */}
      </button>
    </div>
  );
};
