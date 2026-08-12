"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { customerRows, orderRows, productRows, userRows } from "./data";
import { DataTable, Filters, ManagementPage, PageHeading } from "./shared";

export type ManagementIndexType = "orders" | "customers" | "products" | "users";

export function IndexView({ type }: { type: ManagementIndexType }) {
  const { user } = useAuth();
  const config = {
    orders: {
      title: user.role === "CUSTOMER" ? "My orders" : "Orders",
      description:
        user.role === "CUSTOMER"
          ? "Track your purchases and delivery progress."
          : "Create, track, and fulfil customer orders.",
      button: "Create order",
      headers: ["Order", "Customer", "Items", "Total", "Status", "Created"],
      rows: user.role === "CUSTOMER" ? orderRows.slice(0, 1) : orderRows,
      href: "/orders",
    },
    customers: {
      title: "Customers",
      description: "Manage active customer profiles and delivery details.",
      button: "Add customer",
      headers: ["Customer", "Phone", "Location", "Orders", "Total spent"],
      rows: customerRows,
      href: "/customers",
    },
    products: {
      title: "Products",
      description: "Monitor catalogue pricing and inventory.",
      button: "Add product",
      headers: ["SKU", "Product", "Category", "Price", "Stock", "Status"],
      rows: productRows,
      href: "/products",
    },
    users: {
      title: "Users",
      description: "Manage staff access, roles, and customer accounts.",
      button: "Add user",
      headers: ["Name", "Email", "Role", "Status", "Created"],
      rows: userRows,
      href: "/users",
    },
  }[type];
  const canAdd =
    type === "orders"
      ? user.role !== "CUSTOMER"
      : type === "products"
        ? user.role === "ADMIN"
        : true;
  return (
    <ManagementPage>
      <PageHeading
        title={config.title}
        description={config.description}
        action={
          canAdd ? (
            <Button render={type === "orders" ? <Link href="/orders/new" /> : undefined}>
              <PlusIcon data-icon="inline-start" />
              {config.button}
            </Button>
          ) : undefined
        }
      />
      <Filters noun={type} />
      <DataTable headers={config.headers} rows={config.rows} href={config.href} />
    </ManagementPage>
  );
}
