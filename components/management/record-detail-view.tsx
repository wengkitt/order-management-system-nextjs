import { BoxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DetailList,
  ManagementCard,
  ManagementPage,
  Note,
  PageHeading,
  StatusBadge,
} from "./shared";

export type RecordType = "customer" | "product" | "user";

const records = {
  customer: {
    title: "John Tan",
    description: "Customer since 4 February 2026",
    cardTitle: "Contact information",
    items: [
      ["Full name", "John Tan"],
      ["Phone", "012-345 6789"],
      ["Address", "10 Jalan Example, 50450 Kuala Lumpur"],
      ["Status", <StatusBadge key="status">Active</StatusBadge>],
    ] as [string, React.ReactNode][],
    asideTitle: "Recent activity",
    summary: "8 orders · RM 1,250 delivered spend",
    note: "Recent customer activity is shown here.",
  },
  product: {
    title: "Mechanical Keyboard",
    description: "KB-001 · Accessories",
    cardTitle: "Product information",
    items: [
      ["Description", "Hot-swappable mechanical keyboard with tactile switches."],
      ["Price", "RM 199.00"],
      ["Category", "Accessories"],
      ["Status", <StatusBadge key="status">Active</StatusBadge>],
    ] as [string, React.ReactNode][],
    asideTitle: "Inventory",
    summary: "20 available · low-stock threshold: 10",
    note: "Inventory is healthy: 10 units above threshold.",
  },
  user: {
    title: "Jane Lee",
    description: "Staff account · Active",
    cardTitle: "Account information",
    items: [
      ["Name", "Jane Lee"],
      ["Email", "jane@acme.my"],
      ["Phone", "012-448 9920"],
      ["Role", "Staff"],
      ["Status", <StatusBadge key="status">Active</StatusBadge>],
    ] as [string, React.ReactNode][],
    asideTitle: "Permissions",
    summary: "Dashboard, orders, customers, and product viewing.",
    note: "Staff cannot modify products or manage users.",
  },
};

export function RecordDetailView({ type }: { type: RecordType }) {
  const record = records[type];
  return (
    <ManagementPage>
      <PageHeading
        title={record.title}
        description={record.description}
        action={
          <div className="flex gap-2">
            <Button>Edit {type}</Button>
            <Button variant="destructive">{type === "user" ? "Deactivate" : "Delete"}</Button>
          </div>
        }
      />
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <ManagementCard title={record.cardTitle}>
          <DetailList items={record.items} />
        </ManagementCard>
        <ManagementCard title={record.asideTitle}>
          <div className="flex items-center gap-3">
            <BoxIcon className="size-8 text-muted-foreground" />
            <p className="text-sm">{record.summary}</p>
          </div>
          <Note>{record.note}</Note>
        </ManagementCard>
      </div>
    </ManagementPage>
  );
}
