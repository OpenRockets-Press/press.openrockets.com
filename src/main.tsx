import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/router";
import "./index.css";

import { TranslationProvider } from "@/lib/TranslationContext";

console.log("App mounted v3");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TranslationProvider>
  </StrictMode>,
);
