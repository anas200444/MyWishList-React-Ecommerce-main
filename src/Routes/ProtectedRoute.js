import React, { useEffect, useState } from 'react';
import { useAuth } from '../User/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateSession, clearAuthTokens } from '../utlis/cookie-utils';

const ProtectedRoute = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        // If no user is logged in, validate session
        const isValidSession = validateSession();
        if (!isValidSession) {
          navigate('/login');
        } else {
          // Automatically logout after 10 seconds if the user is still on the page
          setTimeout(async () => {
            await logout();
            clearAuthTokens();
            navigate('/login');
            alert('Session expired. You have been logged out.');
          },  3600000); // 1 hour (in milliseconds)
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Cleanup timeout on component unmount or if the user navigates away
    return () => {
      // clear any timeouts on cleanup
      clearTimeout();
    };
  }, [currentUser, logout, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : null;
};

export default ProtectedRoute;
