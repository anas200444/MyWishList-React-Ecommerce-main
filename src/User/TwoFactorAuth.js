//Towfactor

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Cookies from "js-cookie";
import axios from "axios";

const TwoFactorAuth = ({ onVerificationComplete }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Access Firebase Auth to get current user
  const auth = getAuth();
  const user = auth.currentUser;

  // Check if user is logged in, otherwise redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const email = user ? user.email : ""; // Get email from Firebase auth

  const sendVerificationCode = async () => {
    setLoading(true);
    setError("");
    try {
      const csrfToken = Cookies.get("csrfToken");
      const response = await axios.post("http://localhost:3001/send-code", {
        email,
        csrfToken,
      });

      if (response.data.success) {
        setIsCodeSent(true);
      } else {
        setError("Failed to send verification code: Server did not confirm success.");
      }
    } catch (error) {
      if (error.response) {
        setError(`Failed to send verification code: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        setError("Failed to send verification code: No response from server.");
      } else {
        setError(`Failed to send verification code: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");
    try {
      const csrfToken = Cookies.get("csrfToken");
      const response = await axios.post("http://localhost:3001/verify-code", {
        email,
        code,
        csrfToken,
      });
  
      if (response.data.success) {
        // Call the onVerificationComplete function passed as a prop
        if (onVerificationComplete) {
          onVerificationComplete(true); // Verification successful
          navigate("/");  // Redirect to root after successful verification
        }
      } else {
        setError("Invalid verification code.");
      }
    } catch (error) {
      setError("Verification failed: " + (error.response?.data.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container">
      <div className="login-box">
        <h2 className="login-text">Two-Factor Authentication</h2>
        {error && <p className="error">{error}</p>}

        {/* Email field pre-filled and read-only */}
        <div className="input-group">
          <input
            type="email"
            value={email}
            readOnly // Make the email field non-editable
            placeholder="Your Email"
          />
        </div>

        {!isCodeSent ? (
          <button
            onClick={sendVerificationCode}
            className="login-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        ) : (
          <div className="input-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
            <button
              onClick={verifyCode}
              className="login-button"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;