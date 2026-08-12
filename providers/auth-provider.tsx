"use client";

import { createContext, use } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import type { AuthUser } from "@/lib/api/auth-client";

type AuthContextValue = {
  user: AuthUser;
  isLoading: boolean;
  isAuthenticated: true;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser;
}) {
  const currentUser = useCurrentUser(initialUser);
  const user = currentUser.data ?? initialUser;

  return (
    <AuthContext value={{ user, isLoading: currentUser.isLoading, isAuthenticated: true }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
