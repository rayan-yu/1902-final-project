import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLinkToken, exchangePublicToken } from '../utils/api';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

const PlaidLink = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  const navigate = useNavigate();

  // Memoize the initializePlaidLink function with useCallback to avoid
  // recreating it on every render
  const initializePlaidLink = useCallback((token) => {
    if (!window.Plaid) {
      console.error('Plaid Link failed to load');
      setError('Plaid Link failed to load');
      return;
    }

    // Create the Plaid Link instance
    const linkHandler = window.Plaid.create({
      token: token,
      onSuccess: async (public_token, metadata) => {
        try {
          const response = await exchangePublicToken(public_token);
          console.log('Account linked successfully:', response);
          // Force a page reload to ensure proper state management
          window.location.href = '/dashboard';
        } catch (err) {
          console.error('Error exchanging token:', err);
          setError('Failed to link account. Please try again.');
        }
      },
      onExit: (err, metadata) => {
        if (err) {
          console.error('Plaid Link error:', err);
          setError('An error occurred while connecting your account.');
        }
        // Use window.location.href instead of navigate to force a full page reload
        window.location.href = '/dashboard';
      },
      onLoad: () => {
        // Open the Plaid Link as soon as it's loaded
        linkHandler.open();
      },
    });
  }, []);

  // Fetch the link token only once when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchLinkToken = async () => {
      try {
        const response = await getLinkToken();
        if (isMounted) {
          setLinkToken(response.link_token);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching link token:', err);
        if (isMounted) {
          setError('Failed to initialize Plaid Link. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchLinkToken();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Plaid script and initialize only once when linkToken is available
  useEffect(() => {
    if (!linkToken) return;
    
    // Check if an instance is already open (by looking for the iframe)
    const existingInstance = document.querySelector('#plaid-link-iframe-1');
    if (existingInstance) {
      console.log('Plaid Link is already open, not reinitializing');
      return;
    }
    
    // Check if script is already in the document
    let existingScript = document.getElementById('plaid-link-script');
    
    if (existingScript) {
      // If script exists, just initialize
      initializePlaidLink(linkToken);
    } else {
      // Create and load the script if it doesn't exist
      const script = document.createElement('script');
      script.id = 'plaid-link-script';
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.onload = () => initializePlaidLink(linkToken);
      document.body.appendChild(script);
    }
    
    // Cleanup function
    return () => {
      // We don't remove the script tag to avoid reloading it between sessions
      // But we should remove any Plaid UI instances from the DOM
      const linkElement = document.getElementById('plaid-link-iframe-1');
      if (linkElement && linkElement.parentElement) {
        linkElement.parentElement.remove();
      }
    };
  }, [linkToken, initializePlaidLink]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Initializing connection to your bank...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography>Connecting to your bank...</Typography>
      </Box>
    </Container>
  );
};

export default PlaidLink; 