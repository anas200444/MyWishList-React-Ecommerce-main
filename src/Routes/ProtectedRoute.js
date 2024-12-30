import React, { useEffect, useState } from "react";
import { useAuth } from "../User/AuthContext";
import { useNavigate } from "react-router-dom";
import { validateSession, clearAuthTokens } from "../utlis/cookie-utils";

const ProtectedRoute = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        const isValidSession = validateSession();
        if (!isValidSession) {
          navigate("/login");
        } else {
          // Automatically logout after the session expires
          const timeout = setTimeout(async () => {
            await logout();
            clearAuthTokens();
            navigate("/login");
            alert("Session expired. You have been logged out.");
          }, 3600000); // 1 hour in milliseconds

          return () => clearTimeout(timeout); // Cleanup timeout
        }
      } else if (!currentUser.emailVerified) {
        // Redirect to Two-Factor Authentication if email is not verified
        navigate("/two-factor-auth");
      }

      setLoading(false);
    };

    checkAuth();
  }, [currentUser, logout, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : null;
};

export default ProtectedRoute;
