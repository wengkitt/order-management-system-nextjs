import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./orders";
import { products } from "./products";
import { sql } from "drizzle-orm/sql";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    productName: varchar("product_name", {
      length: 255,
    }).notNull(),
    sku: varchar("sku", {
      length: 100,
    }).notNull(),
    unitPrice: numeric("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    unique("order_items_order_product_unique").on(table.orderId, table.productId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check("order_items_unit_price_non_negative", sql`${table.unitPrice} >= 0`),
    check("order_items_line_total_non_negative", sql`${table.lineTotal} >= 0`),
  ],
);
