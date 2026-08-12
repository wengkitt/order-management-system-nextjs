import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { customers, orderItems, orders, orderStatusHistory, products } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError, isDatabaseError } from "@/lib/api/errors";
import { getOrderDetails, orderStatuses } from "@/lib/api/orders";
import { apiHandler, created, json } from "@/lib/api/response";
import { pagination, paginationFrom, parseJson, searchFrom } from "@/lib/api/validation";

const createOrderSchema = z.object({
  customerId: z.uuid(),
  items: z
    .array(z.object({ productId: z.uuid(), quantity: z.number().int().positive().max(100000) }))
    .min(1)
    .max(100),
  shippingAddress: z.string().trim().min(1).max(5000).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
});

export const GET = apiHandler(async (request: Request) => {
  const actor = await authenticate(request);
  const { page, limit, offset } = paginationFrom(request.url);
  const url = new URL(request.url);
  const search = searchFrom(request.url);
  const status = url.searchParams.get("status");
  const customerId = url.searchParams.get("customerId");
  const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  if (status && !orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    throw new ApiError(400, "INVALID_STATUS", "Invalid order status");
  }
  if (customerId && !z.uuid().safeParse(customerId).success) {
    throw new ApiError(400, "INVALID_CUSTOMER_ID", "Invalid customer ID");
  }
  if (!["createdAt", "updatedAt", "orderNumber", "totalAmount", "status"].includes(sortBy)) {
    throw new ApiError(400, "INVALID_SORT", "Invalid sort field");
  }
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    throw new ApiError(400, "INVALID_SORT", "Sort order must be asc or desc");
  }

  const filters = [];
  if (actor.role === "CUSTOMER") {
    if (!actor.customerId)
      throw new ApiError(403, "CUSTOMER_NOT_LINKED", "User is not linked to a customer");
    filters.push(eq(orders.customerId, actor.customerId));
  } else if (customerId) {
    filters.push(eq(orders.customerId, customerId));
  }
  if (status) filters.push(eq(orders.status, status as (typeof orderStatuses)[number]));
  if (search) {
    filters.push(
      or(ilike(orders.orderNumber, `%${search}%`), ilike(customers.name, `%${search}%`))!,
    );
  }
  const where = filters.length ? and(...filters) : undefined;
  const sortColumns = {
    createdAt: orders.createdAt,
    updatedAt: orders.updatedAt,
    orderNumber: orders.orderNumber,
    totalAmount: orders.totalAmount,
    status: orders.status,
  } as const;
  const orderBy = (sortOrder === "asc" ? asc : desc)(
    sortColumns[sortBy as keyof typeof sortColumns],
  );

  const [data, totals] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: customers.id,
        customerName: customers.name,
        itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(where)
      .groupBy(orders.id, customers.id)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(where),
  ]);

  return json({
    data: data.map((order) => ({
      ...order,
      customer: { id: order.customerId, name: order.customerName },
      customerId: undefined,
      customerName: undefined,
      totalAmount: Number(order.totalAmount),
    })),
    pagination: pagination(page, limit, totals[0]?.total ?? 0),
  });
});

export const POST = apiHandler(async (request: Request) => {
  const actor = await authenticate(request, INTERNAL_ROLES);
  const input = await parseJson(request, createOrderSchema);
  const productIds = input.items.map((item) => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new ApiError(422, "DUPLICATE_PRODUCT", "Each product may only appear once per order");
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.id, input.customerId),
        eq(customers.isActive, true),
        isNull(customers.deletedAt),
      ),
    )
    .limit(1);
  if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found or inactive");

  const availableProducts = await db
    .select()
    .from(products)
    .where(
      and(
        inArray(products.id, productIds),
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ),
    );
  if (availableProducts.length !== productIds.length) {
    throw new ApiError(
      422,
      "PRODUCT_NOT_FOUND",
      "One or more products do not exist or are inactive",
    );
  }
  const productMap = new Map(availableProducts.map((product) => [product.id, product]));
  const lines = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    return {
      id: randomUUID(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: (unitPrice * item.quantity).toFixed(2),
    };
  });
  const total = lines.reduce((sum, line) => sum + Number(line.lineTotal), 0).toFixed(2);
  const id = randomUUID();
  const orderNumber = `ORD-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

  try {
    await db.batch([
      db.insert(orders).values({
        id,
        orderNumber,
        customerId: customer.id,
        subtotal: total,
        totalAmount: total,
        shippingAddress: input.shippingAddress ?? customer.address,
        notes: input.notes,
        createdBy: actor.id,
      }),
      db.insert(orderItems).values(lines.map((line) => ({ ...line, orderId: id }))),
      db
        .insert(orderStatusHistory)
        .values({ orderId: id, toStatus: "PENDING", changedBy: actor.id }),
    ]);
  } catch (error) {
    if (isDatabaseError(error, "23505")) {
      throw new ApiError(409, "ORDER_CONFLICT", "The order could not be uniquely created");
    }
    throw error;
  }

  return created(await getOrderDetails(id));
});
