import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthProvider from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PlaidLink from './components/PlaidLink';
import NotFound from './components/NotFound';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green shade for finance app
    },
    secondary: {
      main: '#0288d1', // Blue shade
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Redirect root to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/link-account" element={<PlaidLink />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
