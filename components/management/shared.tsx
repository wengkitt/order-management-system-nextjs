import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const variant =
    children === "Cancelled" || children === "Inactive" || children === "Out of stock"
      ? "destructive"
      : children === "Delivered" || children === "Active"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </Badge>
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
      <Card className="py-0">
        <Table className="min-w-2xl">
          <TableHeader className="bg-muted/50 text-xs text-muted-foreground">
            <TableRow>
              {headers.map((header) => (
                <TableHead className="px-4 last:text-right" key={header}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.join("-")}>
                {row.map((cell, index) => (
                  <TableCell className="px-4 py-3 last:text-right" key={`${cell}-${index}`}>
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
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
      <Select defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select defaultValue="newest">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
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
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <strong className="text-2xl font-medium">{value}</strong>
        <small className="text-muted-foreground">{detail}</small>
      </CardContent>
    </Card>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <Alert className="mt-3">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
