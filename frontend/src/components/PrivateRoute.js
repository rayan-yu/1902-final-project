import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading indicator while authentication status is being checked
  if (loading) {
    console.log('Loading...');
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  return user?.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute; 