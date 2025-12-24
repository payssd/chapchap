import { InvoiceDetailSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function InvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" disabled>
          <Skeleton className="h-5 w-5" />
        </Button>
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56 mt-2" />
        </div>
      </div>

      <InvoiceDetailSkeleton />
    </div>
  );
}
