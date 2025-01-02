// protected.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../User/AuthContext'; // Custom hook for auth context
import { useNavigate } from 'react-router-dom'; // Navigation hook
import { validateSession, clearAuthTokens } from '../utlis/cookie-utils';

const ProtectedRoute = ({ children }) => {
  const { currentUser, logout, requires2FA } = useAuth(); // Auth context values
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Manage loading state

  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        // No user logged in: validate session
        const isValidSession = validateSession();

        if (!isValidSession) {
          navigate('/login'); // Redirect to login if session is invalid
        } else {
          // Automatically logout after 1 hour
          setTimeout(async () => {
            await logout();
            clearAuthTokens();
            navigate('/login');
            alert('Session expired. You have been logged out.');
          }, 3600000); // 1 hour (in milliseconds)
        }
      } else if (requires2FA) {
        // User logged in but 2FA is required
        navigate('/2fa');
      }

      setLoading(false); // Stop loading after checks
    };

    checkAuth();

    // Cleanup timeout if component unmounts
    return () => {
      clearTimeout();
    };
  }, [currentUser, requires2FA, logout, navigate]);

  if (loading) {
    // Show a loading indicator during authentication checks
    return <div>Loading...</div>;
  }

  // Render children if the user is authenticated
  return currentUser ? children : null;
};

export default ProtectedRoute;
