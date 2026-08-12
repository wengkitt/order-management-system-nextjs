import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ADMIN_ONLY, authenticate, roles } from "@/lib/api/auth";
import { ApiError, isDatabaseError } from "@/lib/api/errors";
import { apiHandler, json } from "@/lib/api/response";
import { parseJson, parseUuid } from "@/lib/api/validation";

const safeUserFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  phoneNumber: users.phoneNumber,
  role: users.role,
  customerId: users.customerId,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const schema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z.email().trim().toLowerCase().optional(),
    phoneNumber: z.string().trim().min(1).max(50).nullable().optional(),
    role: z.enum(roles).optional(),
    customerId: z.uuid().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");
type Context = { params: Promise<{ id: string }> };

async function id(context: Context) {
  return parseUuid((await context.params).id);
}

export const GET = apiHandler(async (request: Request, context: Context) => {
  await authenticate(request, ADMIN_ONLY);
  const [user] = await db
    .select(safeUserFields)
    .from(users)
    .where(eq(users.id, await id(context)))
    .limit(1);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  return json(user);
});
export const PATCH = apiHandler(async (request: Request, context: Context) => {
  await authenticate(request, ADMIN_ONLY);
  const userId = await id(context);
  const input = await parseJson(request, schema);
  try {
    const [user] = await db
      .update(users)
      .set({ ...input, phoneNumber: input.phoneNumber || null, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning(safeUserFields);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    return json(user);
  } catch (error) {
    if (isDatabaseError(error, "23505"))
      throw new ApiError(409, "EMAIL_EXISTS", "Email already exists");
    throw error;
  }
});
