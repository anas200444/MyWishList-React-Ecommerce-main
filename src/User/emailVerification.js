emailverification.js
import { sendEmailVerification } from 'firebase/auth';

export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log("Verification email sent.");
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};