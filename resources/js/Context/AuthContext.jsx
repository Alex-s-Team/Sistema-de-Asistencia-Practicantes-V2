import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const data = await authService.getCurrentUser();
        setUser(data.user);
        setPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { token, user: userData } = await authService.login(email, password);
    setUser(userData);
    setPermissions(userData.permissions || []);
    return { token, user: userData };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setPermissions([]);
    }
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isStaff = () => hasRole('staff');
  const isIntern = () => hasRole('intern');
  const canManageUsers = () => isAdmin() || isStaff();

  const value = {
    user,
    loading,
    permissions,
    login,
    logout,
    loadUser,
    hasPermission,
    hasRole,
    isAdmin,
    isStaff,
    isIntern,
    canManageUsers,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

