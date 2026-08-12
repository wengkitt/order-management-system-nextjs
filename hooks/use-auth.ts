"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, login, logout, type AuthUser } from "@/lib/api/auth-client";

export const authQueryKey = ["auth", "me"] as const;

export function useCurrentUser(initialUser?: AuthUser) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    initialData: initialUser,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(authQueryKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(authQueryKey, null),
  });
}
