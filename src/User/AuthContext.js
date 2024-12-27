import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [wallet, setWallet] = useState(0);
  const [role, setRole] = useState("user");  // New state for storing user role
  const [error, setError] = useState(null);  // New state for error messages

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
        role: "user",  // Default role is user
      });
  
      setCurrentUser(user);
      setError(null);  // Clear any previous error state
    } catch (error) {
      setError("Failed to sign up: " + error.message);  // Set the error message
      console.error("Failed to sign up:", error);
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Check if the user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        throw new Error("No account found for this user.");
      }
  
      setCurrentUser(user);
      setError(null); // Clear any previous error state
    } catch (error) {
      console.error("Failed to log in:", error);
      throw new Error(error.message); // Re-throw the error for handleSubmit to catch
    }
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
          role: "user",  // Default role is user
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
      setError(null);  // Clear any previous error state
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);  // Set the error message
      console.error('Failed to sign in with Google', error);
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError("Failed to reset password: " + error.message);  // Set the error message
    }
  }

  async function reauthenticate(password) {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      setError("Error reauthenticating: " + error.message);  // Set the error message
      console.error("Error reauthenticating:", error);
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
        setError(null);  // Clear any previous error state
      } catch (error) {
        setError("Error updating email: " + error.message);  // Set the error message
        console.error("Error updating email:", error);
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
  
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          setCurrentUser(user);
          const userData = userDoc.data();
          setWallet(userData.wallet || 0);
          setRole(userData.role || "user");
        } else {
          console.warn("User logged in but does not have a valid Firestore account.");
          setCurrentUser(null); // Set current user to null if Firestore entry is invalid
        }
      } else {
        setCurrentUser(null); // No user is logged in
      }
    });
  
    return unsubscribe;
  }, []);
  

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
    role,  // Provide the role in the context value
    error,  // Include error in the context value
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    changeEmail,
    updateWallet,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
