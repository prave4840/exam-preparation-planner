import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to format errors uniformly
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let validationErrors = [];

    if (error.response?.data) {
      const data = error.response.data;
      if (data.message) {
        errorMessage = data.message;
      }
      if (Array.isArray(data.errors)) {
        validationErrors = data.errors;
      }
    } else if (error.request) {
      errorMessage = 'Unable to reach the server. Please check your network connection.';
    }

    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.errors = validationErrors;
    customError.raw = error;

    return Promise.reject(customError);
  }
);

export default axiosClient;
