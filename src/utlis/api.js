//api.js

import { db } from "../Firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export const sendVerificationCode = async (email) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const timeStamp = Date.now();
    
    // Store code in Firestore
    await setDoc(doc(db, "2fa_codes", email), {
      code,
      expires: timeStamp + 300000, // 5 minutes
    });
    
    return code;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw new Error("Failed to send verification code");
  }
};