import type { ReactElement, ReactNode } from "react";
import { render as rntlRender } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/auth/use-auth";

export function renderWithProviders(ui: ReactElement, opts?: { queryClient?: QueryClient }) {
  const queryClient =
    opts?.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  return { ...rntlRender(ui, { wrapper: Wrapper }), queryClient };
}
