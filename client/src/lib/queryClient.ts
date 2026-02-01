import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { getApiBaseUrl } from "./firebase";

// Enhanced error handling
class APIError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, message: string, statusText: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.name = 'APIError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new APIError(res.status, text, res.statusText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const baseUrl = getApiBaseUrl();

    // Handle URL construction to avoid double /api prefix
    let fullUrl: string;
    if (url.startsWith('/api/')) {
      const pathAfterApi = url.substring(4); // Remove '/api'
      fullUrl = `${baseUrl}${pathAfterApi}`;
    } else if (url.startsWith('/')) {
      fullUrl = `${baseUrl}${url}`;
    } else {
      fullUrl = `${baseUrl}/${url}`;
    }

    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey, signal }) => {
      try {
        const baseUrl = getApiBaseUrl();
        const queryPath = queryKey[0] as string;

        // If queryPath already starts with /api, we need to handle baseUrl carefully
        // baseUrl is either:
        // - 'http://localhost:5000/api' in development
        // - '/api' in production/Firebase
        // queryPath is like '/api/user' or '/api/diaries'

        let url: string;
        if (queryPath.startsWith('/api/')) {
          // Extract the path after /api/
          const pathAfterApi = queryPath.substring(4); // Remove '/api'
          url = `${baseUrl}${pathAfterApi}`;
        } else if (queryPath.startsWith('/')) {
          url = `${baseUrl}${queryPath}`;
        } else {
          url = `${baseUrl}/${queryPath}`;
        }

        const res = await fetch(url, {
          credentials: "include",
          signal,
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res);
        const json = await res.json();

        // Unwrap v1 API responses that have {success: true, data: ...} format
        if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
          return json.data;
        }

        return json;
      } catch (error) {
        console.error(`Query failed for ${queryKey[0]}:`, error);
        throw error;
      }
    };

// Enhanced retry logic
const retryFn = (failureCount: number, error: unknown) => {
  // Don't retry on 4xx errors (client errors)
  if (error instanceof APIError && error.status >= 400 && error.status < 500) {
    return false;
  }

  // Retry up to 3 times for 5xx errors and network errors
  return failureCount < 3;
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`Query error for ${query.queryKey}:`, error);

      // You can add toast notifications here if needed
      // toast.error(`Failed to fetch data: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error(`Mutation error:`, error);

      // You can add toast notifications here if needed
      // toast.error(`Operation failed: ${error.message}`);
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
      retry: retryFn,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: retryFn,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
