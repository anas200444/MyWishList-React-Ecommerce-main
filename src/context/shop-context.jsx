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

  // Fetch user's cart and wallet from Firestore or local storage when currentUser changes
  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    const storedWallet = localStorage.getItem("wallet");
  
    if (!currentUser) {
      // If no user is logged in, load from localStorage
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
      if (storedWallet) {
        setWallet(parseFloat(storedWallet));
      }
    } else {
      // If user is logged in, fetch from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setWallet(userData.wallet || 0);
          setCartItems(userData.cartItems || getDefaultCart()); // Default to an empty cart if not available
        } else {
          // If no user data exists, initialize with default values
          setWallet(0);
          setCartItems(getDefaultCart()); // Set default cart if no cart data in Firestore
        }
      });
    }
  }, [currentUser]);  // Dependency on currentUser to refresh data when user changes
  

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
    if (!currentUser) {
      localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save cart to localStorage
    } else {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { cartItems: updatedCart }); // Save cart to Firestore
    }
  };

  // Remove from Cart Function
  const removeFromCart = (itemId) => {
    if (cartItems[itemId] > 0) {
      const updatedCart = { ...cartItems, [itemId]: cartItems[itemId] - 1 };
      setCartItems(updatedCart);
      if (!currentUser) {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save cart to localStorage
      } else {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { cartItems: updatedCart }); // Save cart to Firestore
      }
    }
  };

  // Update Cart Item Count Function
  const updateCartItemCount = (newAmount, itemId) => {
    if (newAmount >= 0) {
      const updatedCart = { ...cartItems, [itemId]: newAmount };
      setCartItems(updatedCart);
      if (!currentUser) {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save cart to localStorage
      } else {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { cartItems: updatedCart }); // Save cart to Firestore
      }
    }
  };

  // Checkout Function
  const checkout = () => {
    setCartItems(getDefaultCart());
    if (!currentUser) {
      localStorage.setItem("cartItems", JSON.stringify(getDefaultCart())); // Reset cart in localStorage
    } else {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { cartItems: getDefaultCart() }); // Reset cart in Firestore
    }
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
    localStorage.setItem("wallet", wallet); // Save wallet to localStorage as well
  }, [cartItems, wallet]);

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
