import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute: Ensures that only authenticated users with a valid token
 * in localStorage can access the dashboard and inner pages.
 * If unauthenticated, immediately redirects to /login.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
