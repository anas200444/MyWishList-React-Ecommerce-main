import React, { useEffect, useState } from 'react';
import { useAuth } from '../User/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);  // Loading state to prevent premature rendering

  useEffect(() => {
    if (currentUser) {
      setLoading(false); // If user is authenticated, stop loading
    } else {
      setLoading(false); // No user, but stop loading so we can redirect
      navigate('/login'); // Redirect to login if no user
    }
  }, [currentUser, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show loading while checking user state
  }

  return currentUser ? children : <Navigate to="/login" />; // Render children if authenticated, else redirect
};

export default ProtectedRoute;
