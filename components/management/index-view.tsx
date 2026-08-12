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
      actionHref: "/orders/new",
      canAdd: user.role !== "CUSTOMER",
    },
    customers: {
      title: "Customers",
      description: "Manage active customer profiles and delivery details.",
      button: "Add customer",
      headers: ["Customer", "Phone", "Location", "Orders", "Total spent"],
      rows: customerRows,
      href: "/customers",
      actionHref: undefined,
      canAdd: true,
    },
    products: {
      title: "Products",
      description: "Monitor catalogue pricing and inventory.",
      button: "Add product",
      headers: ["SKU", "Product", "Category", "Price", "Stock", "Status"],
      rows: productRows,
      href: "/products",
      actionHref: undefined,
      canAdd: user.role === "ADMIN",
    },
    users: {
      title: "Users",
      description: "Manage staff access, roles, and customer accounts.",
      button: "Add user",
      headers: ["Name", "Email", "Role", "Status", "Created"],
      rows: userRows,
      href: "/users",
      actionHref: "/users/new",
      canAdd: user.role === "ADMIN",
    },
  }[type];

  const actionButton = config.canAdd ? (
    <Button
      nativeButton={!config.actionHref}
      render={config.actionHref ? <Link href={config.actionHref} /> : undefined}
    >
      <PlusIcon data-icon="inline-start" />
      {config.button}
    </Button>
  ) : undefined;

  return (
    <ManagementPage>
      <PageHeading title={config.title} description={config.description} action={actionButton} />
      <Filters noun={type} />
      <DataTable headers={config.headers} rows={config.rows} href={config.href} />
    </ManagementPage>
  );
}
