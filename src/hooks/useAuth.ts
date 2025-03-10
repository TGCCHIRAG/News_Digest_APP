import { useAuthenticationStatus } from '@nhost/react';

export function useAuth() {
  const { isAuthenticated: user, isLoading: loading } = useAuthenticationStatus();
  return { user, loading };
}