import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

// Helper function to set auth token in headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize auth token from localStorage if it exists
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
};

// Setup axios interceptors for handling expired tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // If error is due to expired token and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refreshToken')) {
      originalRequest._retry = true;
      // Try to get a new token using refresh token
      return axios
        .post('/api/token/refresh/', { refresh: localStorage.getItem('refreshToken') })
        .then((res) => {
          if (res.status === 200) {
            // Update token in localStorage and axios headers
            localStorage.setItem('token', res.data.access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            // Update the original request and retry
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return axios(originalRequest);
          }
        })
        .catch((refreshError) => {
          // If refresh token fails, clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        });
    }
    return Promise.reject(error);
  }
);

// Initialize auth on import
initializeAuth();

// Authentication API calls
export const loginUser = async (credentials) => {
  try {
    const res = await axios.post('/api/token/', credentials);
    const { access, refresh } = res.data;
    
    setAuthToken(access);
    
    // Also store refresh token
    localStorage.setItem('refreshToken', refresh);
    
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Login failed'
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const res = await axios.post('/api/auth/register/', userData);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || 'Registration failed'
    };
  }
};

export const logoutUser = () => {
  setAuthToken(null);
  localStorage.removeItem('refreshToken');
};

export const checkUserAuth = async () => {
  if (localStorage.getItem('token')) {
    return { isAuthenticated: true };
  }
  return { isAuthenticated: false };
};

// Plaid API calls
export const getLinkToken = async () => {
  try {
    const res = await axios.get('/api/link-token/');
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to get link token' };
  }
};

export const exchangePublicToken = async (publicToken) => {
  try {
    const res = await axios.post('/api/exchange-token/', { public_token: publicToken });
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to exchange token' };
  }
};

// Account and transaction API calls
export const getAccounts = async () => {
  try {
    const res = await axios.get('/api/accounts/');
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to fetch accounts' };
  }
};

export const unlinkAccount = async (accountId) => {
  try {
    const res = await axios.delete(`/api/accounts/${accountId}/unlink/`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to unlink account' };
  }
};

export const unlinkAllAccounts = async () => {
  try {
    const res = await axios.delete('/api/accounts/unlink-all/');
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to unlink all accounts' };
  }
};

export const getTransactions = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    const url = `/api/transactions/${queryString ? `?${queryString}` : ''}`;
    
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to fetch transactions' };
  }
};

export const getMockTransactions = async (accountId = null) => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (accountId) {
      queryParams.append('account_id', accountId);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/mock-transactions/${queryString ? `?${queryString}` : ''}`;
    
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Failed to fetch mock transactions' };
  }
}; 