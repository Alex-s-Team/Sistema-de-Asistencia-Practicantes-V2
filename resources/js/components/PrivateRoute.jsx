// ============================================================================
// resources/js/components/PrivateRoute.jsx
// ============================================================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

const PrivateRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;