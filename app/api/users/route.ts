import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ADMIN_ONLY, authenticate, hashPassword, roles } from "@/lib/api/auth";
import { ApiError, isDatabaseError } from "@/lib/api/errors";
import { apiHandler, created, json } from "@/lib/api/response";
import { pagination, paginationFrom, parseJson, searchFrom } from "@/lib/api/validation";

const createUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(200),
    phoneNumber: z.string().trim().min(1).max(50).nullable().optional(),
    role: z.enum(roles),
    customerId: z.uuid().nullable().optional(),
  })
  .refine((value) => value.role !== "CUSTOMER" || value.customerId, {
    message: "customerId is required for customer users",
    path: ["customerId"],
  });

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

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, ADMIN_ONLY);
  const { page, limit, offset } = paginationFrom(request.url);
  const url = new URL(request.url);
  const search = searchFrom(request.url);
  const role = url.searchParams.get("role");
  const active = url.searchParams.get("isActive");
  if (role && !roles.includes(role as (typeof roles)[number]))
    throw new ApiError(400, "INVALID_ROLE", "Invalid role");
  const filters = [];
  if (search)
    filters.push(or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))!);
  if (role) filters.push(eq(users.role, role as (typeof roles)[number]));
  if (active === "true" || active === "false") filters.push(eq(users.isActive, active === "true"));
  const where = filters.length ? and(...filters) : undefined;
  const [data, totals] = await Promise.all([
    db
      .select(safeUserFields)
      .from(users)
      .where(where)
      .orderBy(asc(users.name))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);
  return json({ data, pagination: pagination(page, limit, totals[0]?.total ?? 0) });
});

export const POST = apiHandler(async (request: Request) => {
  await authenticate(request, ADMIN_ONLY);
  const input = await parseJson(request, createUserSchema);
  try {
    const [user] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        phoneNumber: input.phoneNumber || null,
        role: input.role,
        customerId: input.customerId,
      })
      .returning(safeUserFields);
    return created(user);
  } catch (error) {
    if (isDatabaseError(error, "23505"))
      throw new ApiError(409, "EMAIL_EXISTS", "Email already exists");
    throw error;
  }
});
