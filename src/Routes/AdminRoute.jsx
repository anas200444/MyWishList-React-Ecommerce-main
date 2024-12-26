import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../User/AuthContext";

export function AdminRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const isAdmin = currentUser.email === "anas.ziad.2004@gmail.com"; // Check admin email
  return isAdmin ? children : <Navigate to="/" />;
}
