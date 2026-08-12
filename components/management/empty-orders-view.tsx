import { PackageOpenIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ManagementPage, PageHeading } from "./shared";

export function EmptyOrdersView() {
  return (
    <ManagementPage>
      <PageHeading title="Orders" description="Create, track, and fulfil customer orders." />
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border bg-card p-8 text-center">
        <PackageOpenIcon className="size-8 text-muted-foreground" />
        <h2 className="font-medium">No orders found</h2>
        <p className="text-sm text-muted-foreground">
          Try changing the filters or create the first order.
        </p>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Create order
        </Button>
      </div>
    </ManagementPage>
  );
}
