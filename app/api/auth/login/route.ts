import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { signToken, verifyPassword } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validation";

const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required").max(200),
});

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
    role: user.role,
  };
  return json({ user: safeUser, token: await signToken(user) });
});
