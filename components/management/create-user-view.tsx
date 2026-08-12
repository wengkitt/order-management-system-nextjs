import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ManagementCard, ManagementPage, PageHeading } from "./shared";

export function CreateUserView() {
  const items = [
    ["Mechanical Keyboard", "KB-001 · RM 199.00", "1", "RM 199.00"],
    ["Wireless Mouse", "MS-014 · RM 89.00", "2", "RM 178.00"],
  ];
  return (
    <ManagementPage>
      <PageHeading
        title="Create user"
        description="Add a new user to the system."
        action={
          <div className="flex gap-2">
            <Button nativeButton={false} variant="outline" render={<Link href="/users" />}>
              Cancel
            </Button>
            <Button>Create user</Button>
          </div>
        }
      />
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <ManagementCard title="User details">
          <FieldGroup>
            <Field>
              <FieldLabel>User role</FieldLabel>
              <Select defaultValue="customer">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <FieldSet>
              <div className="mb-2 flex justify-between">
                <FieldLegend>Order items</FieldLegend>
                <Button variant="outline" size="sm">
                  <PlusIcon data-icon="inline-start" />
                  Add product
                </Button>
              </div>
              {items.map((item) => (
                <div
                  className="grid grid-cols-[1fr_4rem_auto] items-center gap-3 py-3 text-sm"
                  key={item[0]}
                >
                  <b>
                    {item[0]}
                    <br />
                    <small className="text-muted-foreground">{item[1]}</small>
                  </b>
                  <Field>
                    <FieldLabel className="sr-only" htmlFor={`user-quantity-${item[0]}`}>
                      Quantity
                    </FieldLabel>
                    <Input id={`user-quantity-${item[0]}`} defaultValue={item[2]} />
                  </Field>
                  <b>{item[3]}</b>
                  <Separator className="col-span-full" />
                </div>
              ))}
            </FieldSet>
            <Field>
              <FieldLabel htmlFor="user-address">Shipping address</FieldLabel>
              <Textarea id="user-address" defaultValue="10 Jalan Example, 50450 Kuala Lumpur" />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-notes">Internal notes</FieldLabel>
              <Textarea id="user-notes" placeholder="Optional fulfilment note" />
            </Field>
          </FieldGroup>
        </ManagementCard>
      </div>
    </ManagementPage>
  );
}
