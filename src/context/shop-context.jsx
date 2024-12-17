import { createContext, useState, useEffect } from "react";
import { PRODUCTS } from "../products";
import { db } from "../Firebase/firebase"; // Ensure correct path
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../User/AuthContext"; // Import the useAuth hook

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
  const { currentUser } = useAuth(); // Use currentUser from AuthContext
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wallet, setWallet] = useState(0);

  // Fetch user's wallet from Firestore or local storage when currentUser changes
  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet"); // Retrieve wallet from localStorage
    if (storedWallet) {
      setWallet(Number(storedWallet)); // Set wallet if it's in localStorage
    }

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setWallet(userData.wallet || 0); // Set wallet from Firestore
        }
      });
    }
  }, [currentUser]);

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
    const newBalance = wallet + amount;
    setWallet(newBalance); // Update local state
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { wallet: newBalance }); // Update wallet in Firestore
    }
    localStorage.setItem("wallet", newBalance); // Store the new wallet balance in localStorage
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
  }, [cartItems]);

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
