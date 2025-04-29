import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Set up axios interceptors for handling expired tokens
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

// Initialize auth token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
