import { and, asc, count, eq, ilike, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { apiHandler, created, json } from "@/lib/api/response";
import { pagination, paginationFrom, parseJson, searchFrom } from "@/lib/api/validation";

const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(5000),
  phoneNumber: z.string().trim().min(1).max(50).nullable().optional(),
});

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);
  const { page, limit, offset } = paginationFrom(request.url);
  const search = searchFrom(request.url);
  const filters = [eq(customers.isActive, true), isNull(customers.deletedAt)];
  if (search) {
    filters.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.phoneNumber, `%${search}%`),
        ilike(customers.address, `%${search}%`),
      )!,
    );
  }
  const where = and(...filters);
  const [data, totals] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(where)
      .orderBy(asc(customers.name))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(customers).where(where),
  ]);
  return json({ data, pagination: pagination(page, limit, totals[0]?.total ?? 0) });
});

export const POST = apiHandler(async (request: Request) => {
  const actor = await authenticate(request, INTERNAL_ROLES);
  const input = await parseJson(request, createCustomerSchema);
  const [customer] = await db
    .insert(customers)
    .values({ ...input, phoneNumber: input.phoneNumber || null, createdBy: actor.id })
    .returning();
  return created(customer);
});
