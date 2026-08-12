import {
  check,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { customers } from "./customers";
import { sql } from "drizzle-orm/sql";

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", {
      length: 100,
    })
      .notNull()
      .unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    subtotal: numeric("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),
    totalAmount: numeric("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    shippingAddress: text("shipping_address").notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("orders_subtotal_non_negative", sql`${table.subtotal} >= 0`),
    check("orders_total_amount_non_negative", sql`${table.totalAmount} >= 0`),
  ],
);
