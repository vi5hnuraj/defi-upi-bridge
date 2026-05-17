import axios from 'axios';
import Cookies from 'js-cookie'; // we’ll use the same token storage as your component

const api = axios.create({
  baseURL: 'http://localhost:5550/api', // 👈 notice /api added here
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from cookie for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
