import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, checkUserAuth } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('Checking auth token...');
      if (token) {
        console.log('Token found');
        try {
          console.log('Authenticating user...');
          const authUser = await checkUserAuth();
          setUser(authUser);
          console.log('User authenticated');
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);
  
  // Login user
  const login = async (credentials) => {
    try {
      const result = await loginUser(credentials);
      
      if (result.success) {
        setToken(localStorage.getItem('token'));
        setUser({ isAuthenticated: true });
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Login failed'
      };
    }
  };
  
  // Register user
  const register = async (userData) => {
    try {
      const result = await registerUser(userData);
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  };
  
  // Logout user
  const logout = () => {
    logoutUser();
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 