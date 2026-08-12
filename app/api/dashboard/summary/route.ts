import { and, count, eq, isNull, sum } from "drizzle-orm";

import { db } from "@/db";
import { customers, orders, products } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);

  const [orderStats, customerStats, productStats, revenueStats] = await Promise.all([
    db.select({ status: orders.status, total: count() }).from(orders).groupBy(orders.status),
    db
      .select({ total: count() })
      .from(customers)
      .where(and(eq(customers.isActive, true), isNull(customers.deletedAt))),
    db
      .select({ total: count() })
      .from(products)
      .where(and(eq(products.isActive, true), isNull(products.deletedAt))),
    db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.status, "DELIVERED")),
  ]);

  const byStatus = Object.fromEntries(orderStats.map((row) => [row.status, row.total]));
  const totalOrders = orderStats.reduce((total, row) => total + row.total, 0);

  return json({
    totalOrders,
    pendingOrders: byStatus.PENDING ?? 0,
    confirmedOrders: byStatus.CONFIRMED ?? 0,
    processingOrders: byStatus.PROCESSING ?? 0,
    shippedOrders: byStatus.SHIPPED ?? 0,
    deliveredOrders: byStatus.DELIVERED ?? 0,
    cancelledOrders: byStatus.CANCELLED ?? 0,
    totalCustomers: customerStats[0]?.total ?? 0,
    totalProducts: productStats[0]?.total ?? 0,
    totalRevenue: Number(revenueStats[0]?.total ?? 0),
  });
});
