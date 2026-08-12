import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ADMIN_ONLY, authenticate } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
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

export const PATCH = apiHandler(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const actor = await authenticate(request, ADMIN_ONLY);
    const id = parseUuid((await context.params).id);
    const input = await parseJson(request, z.object({ isActive: z.boolean() }));
    if (actor.id === id && !input.isActive)
      throw new ApiError(409, "CANNOT_DEACTIVATE_SELF", "You cannot deactivate your own account");
    const [user] = await db
      .update(users)
      .set({ isActive: input.isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning(safeUserFields);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    return json(user);
  },
);
