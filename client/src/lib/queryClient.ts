import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData: any;
    const contentType = res.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: res.statusText };
      }
    } else {
      const text = await res.text();
      errorData = { error: text || res.statusText };
    }
    
    const error = new Error(errorData.error || `${res.status}: ${res.statusText}`);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const jsonData = await res.json();
    // Ensure we return an array for array endpoints
    if (url.includes("/executions") && !url.match(/\/executions\/[^/]+$/)) {
      return Array.isArray(jsonData) ? jsonData : [];
    }
    if (url.includes("/agents") && !url.match(/\/agents\/[^/]+$/)) {
      return Array.isArray(jsonData) ? jsonData : [];
    }
    return jsonData;
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
// Base API URL - in production it's same origin, in dev it's specified
const API_BASE_URL = process.env.NODE_ENV === "production" ? "" : "";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // The first element in queryKey should be the endpoint path
    if (!queryKey.length || typeof queryKey[0] !== 'string') {
      throw new Error('Query key must start with the API endpoint path');
    }
    
    // Ensure the endpoint starts with /api/
    let endpoint = queryKey[0].startsWith('/api/') ? queryKey[0] : `/api/${queryKey[0]}`;
    
    // Remove any trailing slash and double slashes
    endpoint = endpoint.replace(/\/+$/, '').replace(/\/+/g, '/');
    
    // Construct the full URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
