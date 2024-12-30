import React, { useState, useEffect } from "react";
import { useAuth } from "../User/AuthContext";
import { sendEmailVerification, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function TwoFactorAuth() {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  // Function to send the verification email
  const sendVerificationEmail = async () => {
    try {
      const auth = getAuth();
      await sendEmailVerification(currentUser, {
        url: "http://localhost:3000/shop", // Change this to your production URL
      });
      setIsSent(true); // Indicate that the email was sent
    } catch (err) {
      setError("Failed to send verification email. Please try again later.");
    }
  };

  // Automatically send the email when the component is loaded
  useEffect(() => {
    if (currentUser) {
      sendVerificationEmail();
    } else {
      navigate("/shop"); // Redirect to login if no user is logged in
    }
  }, [currentUser, navigate]);

  return (
    <div className="container">
      <h2>Email Verification</h2>
      {error && <p className="error">{error}</p>}
      {!isSent ? (
        <p>Sending verification link to your email...</p>
      ) : (
        <div>
          <p>A verification link has been sent to your email address.</p>
          <p>Please check your inbox and verify your email to continue.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}