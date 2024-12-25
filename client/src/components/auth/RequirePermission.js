import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { Alert, Box } from '@mui/material';

const RequirePermission = ({ children, permission, fallback = null }) => {
  const { hasPermission, loading } = useRole();

  if (loading) {
    return null;
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return fallback;
    }

    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">
          You don't have permission to access this feature.
        </Alert>
      </Box>
    );
  }

  return children;
};

export const RequireRole = ({ children, role, redirectTo = '/dashboard' }) => {
  const { hasRole, loading } = useRole();

  if (loading) {
    return null;
  }

  if (!hasRole(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RequirePermission;
