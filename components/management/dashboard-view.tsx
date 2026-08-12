"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { orderRows } from "./data";
import { DataTable, ManagementPage, Note, PageHeading, StatCard } from "./shared";

export function DashboardView() {
  const { user } = useAuth();
  const pipeline = [
    ["Pending", 12, 22],
    ["Confirmed", 4, 8],
    ["Processing", 18, 35],
    ["Shipped", 20, 39],
    ["Delivered", 64, 100],
  ] as const;
  return (
    <ManagementPage>
      <PageHeading
        title={`Good morning, ${user.name.split(" ")[0]}`}
        description="Here’s what needs your attention today."
        action={
          <Button nativeButton={false} render={<Link href="/orders/new" />}>
            <PlusIcon data-icon="inline-start" />
            Create order
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Delivered revenue" value="RM 58,240" detail="From 64 delivered orders" />
        <StatCard label="Open orders" value="54" detail="12 awaiting confirmation" />
        <StatCard label="Customers" value="45" detail="Active customer records" />
        <StatCard label="Products" value="32" detail="4 need restocking" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order pipeline</CardTitle>
            <span className="text-sm text-muted-foreground">125 total</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pipeline.map(([label, count, width]) => (
              <div
                className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm"
                key={label}
              >
                <span>{label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-foreground"
                    style={{ width: `${width}%` }}
                  />
                </span>
                <b>{count}</b>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority queue</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                ["Pending over 24h", "5 orders"],
                ["Low stock", "4 products"],
                ["Ready to ship", "8 orders"],
              ].map(([label, value]) => (
                <div className="flex justify-between" key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <Note>Revenue includes delivered orders only.</Note>
          </CardContent>
        </Card>
      </div>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent orders</h2>
          <Button nativeButton={false} variant="outline" render={<Link href="/orders" />}>
            View all
          </Button>
        </div>
        <DataTable
          headers={["Order", "Customer", "Items", "Total", "Status", "Created"]}
          rows={orderRows.slice(0, 4)}
          href="/orders"
        />
      </section>
    </ManagementPage>
  );
}
