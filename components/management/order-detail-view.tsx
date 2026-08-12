import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailList, ManagementCard, ManagementPage, PageHeading, StatusBadge } from "./shared";

export function OrderDetailView() {
  return (
    <ManagementPage>
      <PageHeading
        title="ORD-260812-A1B2C3"
        description="Created 12 Aug 2026 at 10:30"
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit order</Button>
            <Button>Update status</Button>
          </div>
        }
      />
      <StatusBadge>Processing</StatusBadge>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            className={cn("h-1.5 rounded-full", step < 4 ? "bg-foreground" : "bg-muted")}
            key={step}
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-3">
          <ManagementCard title="Items">
            <div className="divide-y text-sm">
              <div className="grid grid-cols-[1fr_auto_auto] gap-5 py-3">
                <b>
                  Mechanical Keyboard
                  <br />
                  <small className="text-muted-foreground">KB-001 · × 1</small>
                </b>
                <span>RM 199.00</span>
                <b>RM 199.00</b>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-5 py-3">
                <b>
                  Wireless Mouse
                  <br />
                  <small className="text-muted-foreground">MS-014 · × 2</small>
                </b>
                <span>RM 24.50</span>
                <b>RM 49.00</b>
              </div>
              <div className="flex justify-between pt-4 text-base">
                <b>Total</b>
                <b>RM 248.00</b>
              </div>
            </div>
          </ManagementCard>
          <ManagementCard title="Shipping & notes">
            <p className="text-sm">10 Jalan Example, 50450 Kuala Lumpur</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Leave parcel with reception if customer is unavailable.
            </p>
          </ManagementCard>
        </div>
        <ManagementCard title="Customer">
          <DetailList
            items={[
              ["Name", "John Tan"],
              ["Phone", "012-345 6789"],
              ["Status", <StatusBadge key="status">Active</StatusBadge>],
              ["Payment", "Pay on delivery"],
            ]}
          />
        </ManagementCard>
      </div>
    </ManagementPage>
  );
}
