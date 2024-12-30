import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase/firebase";
import { applyActionCode } from "firebase/auth";

const VerifyEmailHandler = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const oobCode = urlParams.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("Email verified successfully! Redirecting...");
          setTimeout(() => navigate("/shop"), 3000); // Redirect to /shop
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          setStatus("Failed to verify email. Please try again.");
        });
    } else {
      setStatus("Invalid verification link.");
    }
  }, [navigate]);

  return <div>{status}</div>;
};

export default VerifyEmailHandler;