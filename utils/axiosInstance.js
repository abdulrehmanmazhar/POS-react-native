import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://pos-server-production-2cf1.up.railway.app/api/v1'; // Replace with your server's base URL
// const API_BASE_URL = 'http://localhost:8080/api/v1';

console.log(`connected to server ${API_BASE_URL}`)

const axiosInstance = axios.create({
    baseURL: API_BASE_URL, // Replace with your server's base URL
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies if needed
  });

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get(`${API_BASE_URL}/refresh`, {}, { withCredentials: true });
        const newToken = refreshResponse.data.accessToken;
        console.log("refreshed")

        // Store the new token and retry the original request
        await AsyncStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Logout the user if refresh fails
        await AsyncStorage.removeItem('accessToken');
        console.log("refresh failed so logged out")
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
