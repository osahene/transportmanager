import axios from 'axios';

const $axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
$axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
$axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle offline / network errors
    if (!error.response && error.isAxiosError) {
      console.error("Network error detected. You might be offline.");
      // The offlineBanner will handle the UI, but this prevents the app from crashing
      // You can also dispatch a specific Redux action here if needed
    }

    return Promise.reject(error);
  }
);

export { $axios };