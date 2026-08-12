import { and, count, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiHandler, json, noContent } from "@/lib/api/response";
import { parseJson, parseUuid } from "@/lib/api/validation";

const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    address: z.string().trim().min(1).max(5000).optional(),
    phoneNumber: z.string().trim().min(1).max(50).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

type Context = { params: Promise<{ id: string }> };

async function customerId(context: Context): Promise<string> {
  return parseUuid((await context.params).id);
}

export const GET = apiHandler(async (request: Request, context: Context) => {
  await authenticate(request, INTERNAL_ROLES);
  const id = await customerId(context);
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
    .limit(1);
  if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");

  const [summary] = await db
    .select({
      orderCount: count(),
      totalSpent: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} = 'DELIVERED'), 0)`,
    })
    .from(orders)
    .where(eq(orders.customerId, id));
  return json({
    ...customer,
    orderCount: summary?.orderCount ?? 0,
    totalSpent: Number(summary?.totalSpent ?? 0),
  });
});

export const PATCH = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request, INTERNAL_ROLES);
  const id = await customerId(context);
  const input = await parseJson(request, updateCustomerSchema);
  const [customer] = await db
    .update(customers)
    .set({
      ...input,
      phoneNumber: input.phoneNumber || null,
      updatedBy: actor.id,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
    .returning();
  if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
  return json(customer);
});

export const DELETE = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request, INTERNAL_ROLES);
  const id = await customerId(context);
  const [customer] = await db
    .update(customers)
    .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date(), updatedBy: actor.id })
    .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
    .returning({ id: customers.id });
  if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
  return noContent();
});
