import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Platform } from 'react-native';

// Adjust this to your local dev machine's IP address if testing on a physical device,
// or use 10.0.2.2 for Android emulator.
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
