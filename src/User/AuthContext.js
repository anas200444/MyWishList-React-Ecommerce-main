import React, { createContext, useState, useEffect, useContext } from "react";  // Added 'useContext' import
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
import bcrypt from "bcryptjs";  // Import bcrypt for hashing

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);  // Now using the context correctly
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(0);
  const [role, setRole] = useState("user");
  const [error, setError] = useState(null);

  // Signup function with manual password hashing
  async function signup(email, password) {
    try {
      // Hash password using bcrypt
      const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt rounds
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize wallet and cart with default values for the new user
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        wallet: 0,
        cartItems: {},
        name: user.displayName || null,
        dateOfBirth: null,
        profilePicture: user.photoURL || null,
        role: "user",
        hashedPassword: hashedPassword, // Store the hashed password in Firestore
      });

      setCurrentUser(user);
      setError(null);
    } catch (error) {
      setError("Failed to sign up: " + error.message);
      console.error("Failed to sign up:", error);
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch the user from Firestore
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

  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Google login function
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
    
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
    
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          dateOfBirth: null,
          profilePicture: user.photoURL || null,
          role: "user",
        });
      } else {
        const userData = userDoc.data();
        const updatedData = {
          name: user.displayName || userData.name,
          email: user.email || userData.email,
          profilePicture: user.photoURL || userData.profilePicture,
        };
    
        await updateDoc(userDocRef, updatedData);
      }
  
      return user;
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
      console.error('Failed to sign in with Google', error);
    }
  }

  // Reset password function
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError("Failed to reset password: " + error.message);
    }
  }

  // Re-authenticate function
  async function reauthenticate(password) {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      setError("Error reauthenticating: " + error.message);
      console.error("Error reauthenticating:", error);
    }
  }

  // Change email function
  async function changeEmail(newEmail, password) {
    if (currentUser) {
      try {
        await reauthenticate(password);
        await updateDoc(doc(db, "users", currentUser.uid), {
          email: newEmail,
        });
        alert("Email updated successfully");
        setError(null);
      } catch (error) {
        setError("Error updating email: " + error.message);
        console.error("Error updating email:", error);
      }
    }
  }

  // Monitor user state change
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
          setCurrentUser(null); 
        }
      } else {
        setCurrentUser(null);
      }
    });
  
    return unsubscribe;
  }, []);

  // Function to update wallet balance in Firestore
  const updateWallet = async (amount) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { wallet: amount });
      setWallet(amount);
    }
  };

  const value = {
    currentUser,
    wallet,
    role,
    error,
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
