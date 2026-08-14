import { QueryClient } from '@tanstack/react-query';

export { API_BASE_URL } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,   // 5 min
      refetchOnWindowFocus: false,
    },
  },
});
