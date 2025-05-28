import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component that redirects authenticated users to their appropriate dashboard
 * and allows non-authenticated users to view the specified component
 */
const AuthenticatedRedirect = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('AuthenticatedRedirect - Auth state:', { isAuthenticated, user });

  if (!isAuthenticated) {
    // Not logged in, show the intended component (landing page, etc.)
    console.log('User not authenticated, showing original content');
    return children;
  }

  // User is authenticated, redirect to the appropriate dashboard based on role
  if (user && user.role) {
    const role = user.role.toLowerCase();
    console.log(`User authenticated with role: ${role}, redirecting to dashboard`);
    
    switch (role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'lecturer':
        return <Navigate to="/lecturer/dashboard" replace />;
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'guest':
        return <Navigate to="/guest/dashboard" replace />;
      case 'outsrc_student':
        return <Navigate to="/outsource/dashboard" replace />;
      default:
        // Default to student dashboard if role is unknown
        console.log(`Unknown role: ${role}, redirecting to default dashboard`);
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Fallback to generic dashboard if no specific role found
  console.log('User authenticated but no role found, redirecting to default dashboard');
  return <Navigate to="/dashboard" replace />;
};

export default AuthenticatedRedirect; 