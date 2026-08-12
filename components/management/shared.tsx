import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ManagementPage({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 flex-col gap-5 p-4 sm:p-6">{children}</main>;
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ children }: { children: string }) {
  const tone =
    children === "Delivered" || children === "Active"
      ? "text-emerald-700"
      : children === "Cancelled" || children === "Inactive" || children === "Out of stock"
        ? "text-destructive"
        : children === "Processing"
          ? "text-blue-700"
          : "text-amber-700";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs font-medium",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function DataTable({
  headers,
  rows,
  href,
}: {
  headers: string[];
  rows: string[][];
  href?: string;
}) {
  const statuses = new Set([
    "Pending",
    "Processing",
    "Delivered",
    "Cancelled",
    "Confirmed",
    "Active",
    "Inactive",
    "Low stock",
    "Out of stock",
  ]);
  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-2xl text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th className="px-4 py-3 font-medium last:text-right" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="border-t transition-colors hover:bg-muted/30" key={row.join("-")}>
                {row.map((cell, index) => (
                  <td className="px-4 py-3 last:text-right" key={`${cell}-${index}`}>
                    {index === 0 && href ? (
                      <Link
                        className="font-medium hover:underline"
                        href={`${href}/${rowIndex + 1}`}
                      >
                        {cell}
                      </Link>
                    ) : statuses.has(cell) ? (
                      <StatusBadge>{cell}</StatusBadge>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <span>Showing 1–{rows.length} of 24</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button size="sm">1</Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export function Filters({ noun }: { noun: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={`Search ${noun}…`} />
      </div>
      <select className="h-9 rounded-lg border bg-background px-3 text-sm">
        <option>All statuses</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <select className="h-9 rounded-lg border bg-background px-3 text-sm">
        <option>Newest first</option>
        <option>Oldest first</option>
      </select>
      <Button variant="outline">
        <SlidersHorizontalIcon data-icon="inline-start" />
        More filters
      </Button>
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="text-2xl font-medium">{value}</strong>
      <small className="text-muted-foreground">{detail}</small>
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 border-l-3 bg-muted p-3 text-xs text-muted-foreground">{children}</div>
  );
}

export function DetailList({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      {items.map(([label, value]) => (
        <div className="grid grid-cols-[8rem_1fr] gap-3" key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ManagementCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="mb-4 font-medium">{title}</h2>
      {children}
    </section>
  );
}
