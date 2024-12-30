import React, { useEffect, useState } from 'react';
import { useAuth } from '../User/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { validateSession } from '../utlis/cookie-utils';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !currentUser) {
        const isValidSession = validateSession();
        if (!isValidSession) {
          navigate('/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [currentUser, isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated || currentUser ? children : null;
};

export default ProtectedRoute;