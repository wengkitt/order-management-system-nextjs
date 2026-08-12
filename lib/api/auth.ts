import "server-only";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

export const roles = ["ADMIN", "STAFF", "CUSTOMER"] as const;
export type UserRole = (typeof roles)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  customerId: string | null;
};

const encoder = new TextEncoder();

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return encoder.encode(value);
}

export async function signToken(user: Pick<AuthUser, "id" | "role">): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }
  return authorization.slice(7).trim();
}

export async function authenticate(
  request: Request,
  allowedRoles?: readonly UserRole[],
): Promise<AuthUser> {
  let subject: string | undefined;
  try {
    const verified = await jwtVerify(bearerToken(request), secret(), { algorithms: ["HS256"] });
    subject = verified.payload.sub;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "INVALID_TOKEN", "Authentication token is invalid or expired");
  }

  if (!subject) throw new ApiError(401, "INVALID_TOKEN", "Authentication token is invalid");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      role: users.role,
      customerId: users.customerId,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, subject))
    .limit(1);

  if (!user?.isActive) throw new ApiError(401, "INVALID_TOKEN", "User is inactive or missing");
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    customerId: user.customerId,
  };
}

export const ADMIN_ONLY = ["ADMIN"] as const;
export const INTERNAL_ROLES = ["ADMIN", "STAFF"] as const;
