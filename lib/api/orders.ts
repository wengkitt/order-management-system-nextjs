import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customers, orderItems, orders } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function getOrderDetails(id: string) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      customerId: customers.id,
      customerName: customers.name,
      customerPhoneNumber: customers.phoneNumber,
      customerAddress: customers.address,
      shippingAddress: orders.shippingAddress,
      notes: orders.notes,
      subtotal: orders.subtotal,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.createdAt));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customer: {
      id: order.customerId,
      name: order.customerName,
      phoneNumber: order.customerPhoneNumber,
      address: order.customerAddress,
    },
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.lineTotal),
    })),
    subtotal: Number(order.subtotal),
    totalAmount: Number(order.totalAmount),
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
