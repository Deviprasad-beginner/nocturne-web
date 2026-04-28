import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";

// AbortErrors are expected — they fire when a component unmounts mid-request
// (e.g. navigating away). Logging them as errors is misleading noise.
const isAbortError = (e: unknown): boolean =>
  e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"));
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
  timeoutMs: number = 15000,  // 15s default — covers Render cold starts
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
      signal: controller.signal,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new APIError(408, "Request timed out. The server may be starting up — please try again.", "Request Timeout");
    }
    console.error(`API Request failed: ${method} ${url}`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
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
        // Normalize null data to [] for collection endpoints to prevent .length crashes
        if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
          const data = json.data;
          // If the API explicitly returns null for a collection, normalize to []
          // This prevents TypeError: Cannot read properties of null (reading 'length')
          return data === null ? [] : data;
        }

        return json;
      } catch (error) {
        // Don't log AbortErrors — QueryCache.onError handles real errors below
        if (!isAbortError(error)) throw error;
        throw error;
      }
    };

// Enhanced retry logic — cold-start aware
const retryFn = (failureCount: number, error: unknown) => {
  // Never retry client errors (except 408 request timeout)
  if (error instanceof APIError && error.status >= 400 && error.status < 500 && error.status !== 408) {
    return false;
  }

  // 503 = server is waking up from Render cold start — retry up to 5 times
  if (error instanceof APIError && error.status === 503) {
    return failureCount < 5;
  }

  // Retry up to 4 times for other 5xx errors and network errors
  return failureCount < 4;
};

// Retry delay: longer waits for 503 (cold start) than normal errors
const retryDelayFn = (attemptIndex: number, error: unknown) => {
  // 503 cold start: wait longer — 2s, 4s, 8s, 15s, 20s
  if (error instanceof APIError && error.status === 503) {
    return Math.min(2000 * 2 ** attemptIndex, 20000);
  }
  // Normal backoff: 1s, 2s, 4s, 8s
  return Math.min(1000 * 2 ** attemptIndex, 8000);
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Silently ignore aborts — they're normal on page navigation
      if (isAbortError(error)) return;
      console.error(`[Query] ${String(query.queryKey[0])}:`, error);
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
      staleTime: 1000 * 60 * 5,
      retry: retryFn,
      retryDelay: retryDelayFn,
    },
    mutations: {
      retry: retryFn,
      retryDelay: retryDelayFn,
    },
  },
});
