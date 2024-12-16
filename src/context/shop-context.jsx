import { createContext, useState, useEffect } from "react";
import { PRODUCTS } from "../products";

// Context Initialization
export const ShopContext = createContext(null);

// Default Cart Creation
const getDefaultCart = () => {
  let cart = {};
  for (let i = 1; i <= PRODUCTS.length; i++) {
    cart[i] = 0;
  }
  return cart;
};

// Context Provider Component
export const ShopContextProvider = (props) => {
  // Retrieve cart and wallet data from localStorage if available
  const savedCart = localStorage.getItem("cartItems");
  const savedWallet = localStorage.getItem("wallet");

  const [cartItems, setCartItems] = useState(
    savedCart ? JSON.parse(savedCart) : getDefaultCart()
  );
  const [wallet, setWallet] = useState(savedWallet ? JSON.parse(savedWallet) : 100);

  // Total Cart Amount Calculation
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = PRODUCTS.find((product) => product.id === Number(item));
        totalAmount += cartItems[item] * itemInfo.price;
      }
    }
    return totalAmount;
  };

  // Add to Cart Function
  const addToCart = (itemId) => {
    const updatedCart = { ...cartItems, [itemId]: cartItems[itemId] + 1 };
    setCartItems(updatedCart);
  };

  // Remove from Cart Function
  const removeFromCart = (itemId) => {
    if (cartItems[itemId] > 0) {
      const updatedCart = { ...cartItems, [itemId]: cartItems[itemId] - 1 };
      setCartItems(updatedCart);
    }
  };

  // Update Cart Item Count Function
  const updateCartItemCount = (newAmount, itemId) => {
    if (newAmount >= 0) {
      const updatedCart = { ...cartItems, [itemId]: newAmount };
      setCartItems(updatedCart);
    }
  };

  // Checkout Function
  const checkout = () => {
    setCartItems(getDefaultCart());
  };

  // Add to Wallet
  const addToWallet = (amount) => {
    const newWalletBalance = wallet + amount;
    setWallet(newWalletBalance);
  };

  const contextValue = {
    cartItems,
    wallet,
    addToCart,
    removeFromCart,
    updateCartItemCount,
    getTotalCartAmount,
    checkout,
    addToWallet,
  };

  useEffect(() => {
    // Ensure cart and wallet are saved in localStorage whenever they change
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("wallet", JSON.stringify(wallet));
  }, [cartItems, wallet]);

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
