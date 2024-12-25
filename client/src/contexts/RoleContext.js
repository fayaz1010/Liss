import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const RoleContext = createContext({});

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

export const PERMISSIONS = {
  CREATE_EVENT: 'create_event',
  EDIT_EVENT: 'edit_event',
  DELETE_EVENT: 'delete_event',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ANALYTICS: 'view_analytics',
  SEND_NOTIFICATIONS: 'send_notifications',
  MANAGE_TEMPLATES: 'manage_templates',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MODERATOR]: [
    PERMISSIONS.CREATE_EVENT,
    PERMISSIONS.EDIT_EVENT,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.USER]: [
    PERMISSIONS.CREATE_EVENT,
    PERMISSIONS.EDIT_EVENT,
  ],
};

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || ROLES.USER);
        } else {
          setUserRole(ROLES.USER);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err.message);
        setUserRole(ROLES.USER);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (permission) => {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  };

  const hasRole = (role) => {
    if (!userRole) return false;
    if (role === ROLES.USER) return true;
    if (role === ROLES.MODERATOR) return userRole === ROLES.MODERATOR || userRole === ROLES.ADMIN;
    if (role === ROLES.ADMIN) return userRole === ROLES.ADMIN;
    return false;
  };

  const value = {
    role: userRole,
    loading,
    error,
    hasPermission,
    hasRole,
    ROLES,
    PERMISSIONS,
  };

  return (
    <RoleContext.Provider value={value}>
      {!loading && children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
