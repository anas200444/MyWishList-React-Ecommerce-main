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
} from "firebase/auth";
import bcrypt from "bcryptjs"; // Import bcrypt for hashing
import {
  setAuthTokens,
  clearAuthTokens,
  setSessionCookie,
  validateSession,
  getCookie
  // makeAuthenticatedRequest,
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

  const saveCSRFTokenToDatabase = async (userId, token) => {
    const csrfDocRef = doc(db, "csrfTokens", userId);
    await setDoc(csrfDocRef, { token });
  };

  const fetchCSRFTokenFromDatabase = async (userId) => {
    const csrfDocRef = doc(db, "csrfTokens", userId);
    const csrfDoc = await getDoc(csrfDocRef);
    return csrfDoc.exists() ? csrfDoc.data().token : null;
  };

  async function signup(email, password) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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

      const idToken = await user.getIdToken();
      const refreshToken = await user.getIdToken(true);

      setAuthTokens(idToken, refreshToken);
      setSessionCookie(idToken);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("No account found for this user.");
      }

      setCurrentUser(user);
      setError(null);

      return user;
    } catch (error) {
      setError(error.message);
      throw new Error(error.message);
    }
  }

  async function logout() {
    try {
      clearAuthTokens();
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();
      const refreshToken = await user.getIdToken(true);

      setAuthTokens(idToken, refreshToken);
      setSessionCookie(idToken);

      const userDocRef = doc(db, "users", user.uid);
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

      // Generate and save CSRF token for Google login user
      const csrfToken = getCSRFToken();
      await saveCSRFTokenToDatabase(user.uid, csrfToken);

      setCurrentUser(user);
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
      console.error('Failed to sign in with Google', error);
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
        setError(null);
      } catch (error) {
        setError("Error updating email: " + error.message);
        console.error("Error updating email:", error);
      }
    }
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
  
      if (user) {
        // Check if the session and token are valid
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
        } else {
          console.warn("User logged in but does not have a valid Firestore account.");
          setCurrentUser(null);
        }
      } else {
        // Check for valid session cookies in case user refreshes page
        const sessionToken = getCookie('session');
        const accessToken = getCookie('accessToken');
        
        if (sessionToken && accessToken) {
          // Token is valid, restore the session
          setCurrentUser(user); // You may want to revalidate the user's Firestore info here
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
