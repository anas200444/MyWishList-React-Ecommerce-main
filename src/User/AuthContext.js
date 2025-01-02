// Updated AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
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
  sendEmailVerification
} from "firebase/auth";
import bcrypt from "bcryptjs";
import {
  setAuthTokens,
  clearAuthTokens,
  setSessionCookie,
  validateSession,
  getCookie
} from "../utlis/cookie-utils";
import { getCSRFToken, validateCSRFToken } from "../utlis/csrf";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(0);
  const [role, setRole] = useState("user");
  const [error, setError] = useState(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [email, setEmail] = useState("");

  const saveCSRFTokenToDatabase = async (userId, token) => {
    const csrfDocRef = doc(db, "csrfTokens", userId);
    await setDoc(csrfDocRef, { token });
  };



  async function signup(email, password) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const csrfToken = getCSRFToken();
      await saveCSRFTokenToDatabase(user.uid, csrfToken);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        wallet: 0,
        cartItems: {},
        name: user.displayName || null,
        dateOfBirth: null,
        profilePicture: user.photoURL || null,
        role: "user",
        hashedPassword: hashedPassword,
        requires2FA: false,
        emailVerified: false
      });

      setCurrentUser(user);
      setError(null);
    } catch (error) {
      setError("Failed to sign up: " + error.message);
    }
  }

  async function login(email, password, csrfToken) {
    try {
      validateCSRFToken(csrfToken);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        throw new Error("Please verify your email before logging in. Verification email sent.");
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().requires2FA) {
        setEmail(email);
        setRequires2FA(true);
        return { requires2FA: true, user };
      } else {
        const idToken = await user.getIdToken();
        const refreshToken = await user.getIdToken(true);

        setAuthTokens(idToken, refreshToken);
        setSessionCookie(idToken);

        setCurrentUser(user);
        setError(null);

        return { requires2FA: false, user };
      }
    } catch (error) {
      setError(error.message);
      throw new Error(error.message);
    }
  }

  async function verify2FA(code) {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || userDoc.data().twoFactorCode !== code) {
        throw new Error("Invalid 2FA code.");
      }

      await updateDoc(userDocRef, { twoFactorCode: null });
      setRequires2FA(false);
      return true;
    } catch (error) {
      setError("2FA verification failed: " + error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      clearAuthTokens();
      await signOut(auth);
      setCurrentUser(null);
      setRequires2FA(false);
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        throw new Error("Please verify your email before logging in.");
      }

      const idToken = await user.getIdToken();
      const refreshToken = await user.getIdToken(true);

      setAuthTokens(idToken, refreshToken);
      setSessionCookie(idToken);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "Unnamed",
          email: user.email,
          dateOfBirth: null,
          profilePicture: user.photoURL || "https://example.com/default-profile-picture.png",
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

      const csrfToken = getCSRFToken();
      await saveCSRFTokenToDatabase(user.uid, csrfToken);

      setCurrentUser(user);
      return user;
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
      throw error;
    }
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);

      if (user) {
        const isValidSession = validateSession();
        if (!isValidSession) {
          clearAuthTokens();
          setCurrentUser(null);
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setCurrentUser(user);
          const userData = userDoc.data();
          setWallet(userData.wallet || 0);
          setRole(userData.role || "user");
          setRequires2FA(userData.requires2FA || false);
        } else {
          setCurrentUser(null);
        }
      } else {
        const sessionToken = getCookie("session");
        const accessToken = getCookie("accessToken");

        if (sessionToken && accessToken) {
          setCurrentUser(user);
        } else {
          clearAuthTokens();
          setCurrentUser(null);
        }
      }
    });

    return unsubscribe;
  }, []);
  

  const updateWallet = async (amount) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { wallet: amount });
      setWallet(amount);
    }
  };
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
      }
    }
  }
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError("Failed to reset password: " + error.message);
    }
  }

  async function reauthenticate(password) {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      setError("Error reauthenticating: " + error.message);
    }
  }




  const value = {
    currentUser,
    wallet,
    role,
    error,
    requires2FA,
    email,
    setEmail,
    signup,
    login,
    verify2FA,
    logout,
    updateWallet,
    loginWithGoogle,
    changeEmail,
    resetPassword

  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
