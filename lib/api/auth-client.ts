import type { LoginInput } from "@/lib/schema/loginSchema";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  customerId: string | null;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiClientError(
      body.error?.message ?? "An unexpected error occurred",
      response.status,
      body.error?.code,
      body.error?.fields,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function login(input: LoginInput) {
  return apiRequest<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser() {
  return apiRequest<AuthUser>("/api/auth/me");
}

export function logout() {
  return apiRequest<void>("/api/auth/logout", { method: "POST" });
}
