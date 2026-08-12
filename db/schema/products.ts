import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { sql } from "drizzle-orm/sql";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    price: numeric("price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
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
    check("products_price_non_negative", sql`${table.price} >= 0`),
    check("products_low_stock_threshold_non_negative", sql`${table.lowStockThreshold} >= 0`),
    check("products_stock_non_negative", sql`${table.stockQuantity} >= 0`),
  ],
);
