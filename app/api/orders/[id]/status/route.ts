import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { orders, orderStatusHistory } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { allowedTransitions, getOrderDetails, orderStatuses } from "@/lib/api/orders";
import { apiHandler, json } from "@/lib/api/response";
import { parseJson, parseUuid } from "@/lib/api/validation";

const statusSchema = z.object({
  status: z.enum(orderStatuses),
  notes: z.string().trim().max(10000).nullable().optional(),
});

export const PATCH = apiHandler(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const actor = await authenticate(request, INTERNAL_ROLES);
    const id = parseUuid((await context.params).id);
    const input = await parseJson(request, statusSchema);
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
    if (!allowedTransitions[order.status].includes(input.status)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Order cannot transition from ${order.status} to ${input.status}`,
      );
    }
    const now = new Date();
    await db.batch([
      db
        .update(orders)
        .set({ status: input.status, updatedBy: actor.id, updatedAt: now })
        .where(eq(orders.id, id)),
      db.insert(orderStatusHistory).values({
        orderId: id,
        fromStatus: order.status,
        toStatus: input.status,
        changedBy: actor.id,
        notes: input.notes,
      }),
    ]);
    return json(await getOrderDetails(id));
  },
);
