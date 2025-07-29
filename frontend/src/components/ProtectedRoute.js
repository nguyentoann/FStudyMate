import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Add debugging
  console.log('ProtectedRoute - Current user:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);
  
  if (loading) {
    console.log('ProtectedRoute - Still loading auth state');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - No authenticated user, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check role access with debug logging
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase(); // Normalize to lowercase
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase()); // Normalize all allowed roles
    
    console.log('ProtectedRoute - User role (normalized):', userRole);
    console.log('ProtectedRoute - Allowed roles (normalized):', normalizedAllowedRoles);
    console.log('ProtectedRoute - Is role allowed:', normalizedAllowedRoles.includes(userRole));
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log(`ProtectedRoute - Access denied: User role '${userRole}' not in allowed roles:`, normalizedAllowedRoles);
      return <Navigate to="/unauthorized" />;
    }
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute; 