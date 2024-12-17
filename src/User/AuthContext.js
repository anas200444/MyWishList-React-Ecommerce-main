import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { auth, db } from "../Firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize wallet and cart with default values for the new user
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        wallet: 0,  // Initialize wallet to 0
        cartItems: {}, // Initialize an empty cart
        name: user.displayName || null,
        dateOfBirth: null,
        profilePicture: user.photoURL || null,
      });
  
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to sign up:", error);
      throw error;
    }
  }
  

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user exists in the Firestore database
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      // If the user does not exist in Firestore, create a new document
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          dateOfBirth: null,
          profilePicture: user.photoURL || null,
        });
      } else {
        // If the user exists, ensure the profile is up-to-date
        const userData = userDoc.data();
        const updatedData = {
          name: user.displayName || userData.name,
          email: user.email || userData.email,
          profilePicture: user.photoURL || userData.profilePicture,
        };
  
        // Update profile fields if any information is missing or outdated
        await updateDoc(userDocRef, updatedData);
      }
  
      setCurrentUser(user);
      return result;
    } catch (error) {
      console.error('Failed to sign in with Google', error);
      throw error;
    }
  }
  


  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  async function reauthenticate(password) {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      console.error("Error reauthenticating:", error);
      throw error;
    }
  }

  async function changeEmail(newEmail, password) {
    if (currentUser) {
      try {
        await reauthenticate(password);
        await updateDoc(doc(db, "users", currentUser.uid), {
          email: newEmail,
        });
        alert("Email updated successfully");
      } catch (error) {
        console.error("Error updating email:", error);
        throw error;
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Retrieve wallet for the user from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Store wallet amount in state if available
          setWallet(userData.wallet || 0);
        }
      }
    });

    return unsubscribe;
  }, []);

  const [wallet, setWallet] = useState(0);

  // Function to update wallet balance in Firestore
  const updateWallet = async (amount) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { wallet: amount });
      setWallet(amount); // Update local state as well
    }
  };

  const value = {
    currentUser,
    wallet,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    changeEmail,
    updateWallet,  // Add this to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}