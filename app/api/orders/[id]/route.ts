import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { customers, orderItems, orders, orderStatusHistory } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { getOrderDetails } from "@/lib/api/orders";
import { apiHandler, json, noContent } from "@/lib/api/response";
import { parseJson, parseUuid } from "@/lib/api/validation";

const updateOrderSchema = z
  .object({
    customerId: z.uuid().optional(),
    shippingAddress: z.string().trim().min(1).max(5000).optional(),
    notes: z.string().trim().max(10000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

type Context = { params: Promise<{ id: string }> };

async function orderId(context: Context) {
  return parseUuid((await context.params).id);
}

export const GET = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request);
  const details = await getOrderDetails(await orderId(context));
  if (actor.role === "CUSTOMER" && details.customer.id !== actor.customerId) {
    throw new ApiError(403, "FORBIDDEN", "You may only view your own orders");
  }
  return json(details);
});

export const PATCH = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request, INTERNAL_ROLES);
  const id = await orderId(context);
  const input = await parseJson(request, updateOrderSchema);
  const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
  if (existing.status !== "PENDING") {
    throw new ApiError(409, "ORDER_NOT_EDITABLE", "Only pending orders may be edited");
  }
  if (input.customerId) {
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, input.customerId), eq(customers.isActive, true)))
      .limit(1);
    if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found or inactive");
  }
  await db
    .update(orders)
    .set({ ...input, updatedBy: actor.id, updatedAt: new Date() })
    .where(eq(orders.id, id));
  return json(await getOrderDetails(id));
});

export const DELETE = apiHandler(async (request: Request, context: Context) => {
  await authenticate(request, INTERNAL_ROLES);
  const id = await orderId(context);
  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!existing) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
  if (existing.status !== "PENDING") {
    throw new ApiError(409, "ORDER_NOT_DELETABLE", "Only pending orders may be deleted");
  }
  await db.batch([
    db.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, id)),
    db.delete(orderItems).where(eq(orderItems.orderId, id)),
    db.delete(orders).where(eq(orders.id, id)),
  ]);
  return noContent();
});
