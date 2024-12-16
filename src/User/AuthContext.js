
import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../Firebase/firebase"; // Adjusted path after moving firebase.js
import { doc, getDoc, setDoc } from "firebase/firestore"; // Adjust if necessary
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
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
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          dateOfBirth: null,
          profilePicture: user.photoURL || null,
        });
      }

      setCurrentUser(user);
      return result;
    } catch (error) {
      console.error("Failed to sign in with Google", error);
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
        await verifyBeforeUpdateEmail(currentUser, newEmail);
        alert(
          "A verification email has been sent to your new email address. Please verify it to complete the email update."
        );
      } catch (error) {
        console.error("Error updating email:", error);
        throw error;
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    changeEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
