/**
 * Root Layout Providers
 * Wraps the entire application with necessary providers
 */

"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth-context";
import { ReactNode } from "react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

import { ModalProvider } from "@/components/common/modal-provider";
import { Toaster } from "react-hot-toast";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          {children}
        </ModalProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
