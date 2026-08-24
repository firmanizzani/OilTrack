import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env as Record<string, string> | undefined;

const api = axios.create({
  baseURL: env?.VITE_API_URL ? `${env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('olitrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('olitrack_token');
      localStorage.removeItem('olitrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
