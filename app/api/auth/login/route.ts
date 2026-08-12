import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { signToken, verifyPassword } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validation";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { loginSchema } from "@/lib/schema/loginSchema";

export const POST = apiHandler(async (request: Request) => {
  const input = await parseJson(request, loginSchema);
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(401, "USER_INACTIVE", "This user account is inactive");

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    customerId: user.customerId,
  };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60,
    path: "/",
  });
  return json(safeUser);
});
