import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import "./index.css";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.toLowerCase();
  return String(error).toLowerCase();
}

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;

  const message = getErrorMessage(error);
  if (
    message.includes("access-control-allow-origin") ||
    message.includes("cross-origin") ||
    message.includes("cors") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("request failed 401") ||
    message.includes("request failed 403") ||
    message.includes("request failed 404") ||
    message.includes("request failed 409") ||
    message.includes("request failed 422") ||
    message.includes("request failed 429")
  ) {
    return false;
  }

  return true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: shouldRetryQuery,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
