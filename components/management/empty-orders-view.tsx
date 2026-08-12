import { PackageOpenIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ManagementPage, PageHeading } from "./shared";

export function EmptyOrdersView() {
  return (
    <ManagementPage>
      <PageHeading title="Orders" description="Create, track, and fulfil customer orders." />
      <Empty className="min-h-80 border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpenIcon />
          </EmptyMedia>
          <EmptyTitle>No orders found</EmptyTitle>
          <EmptyDescription>Try changing the filters or create the first order.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <PlusIcon data-icon="inline-start" />
            Create order
          </Button>
        </EmptyContent>
      </Empty>
    </ManagementPage>
  );
}
