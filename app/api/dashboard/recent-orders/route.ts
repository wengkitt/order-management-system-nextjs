import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";
import { positiveInteger } from "@/lib/api/validation";

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);
  const limit = positiveInteger(new URL(request.url).searchParams.get("limit"), 5, 1, 50);
  const data = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: customers.name,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return json({
    data: data.map((order) => ({ ...order, totalAmount: Number(order.totalAmount) })),
  });
});
