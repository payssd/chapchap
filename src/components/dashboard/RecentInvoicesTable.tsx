"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Invoice, Client } from "@/lib/supabase/database.types";

type InvoiceWithClient = Invoice & {
  clients: Pick<Client, "name"> | null;
};

interface RecentInvoicesTableProps {
  invoices: InvoiceWithClient[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const router = useRouter();

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invoices yet. Create your first invoice to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/invoices/${invoice.id}`)}
          >
            <TableCell className="font-medium">
              {invoice.invoice_number}
            </TableCell>
            <TableCell>{invoice.clients?.name || "Unknown"}</TableCell>
            <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
            <TableCell>{formatDate(invoice.due_date)}</TableCell>
            <TableCell>
              <Badge className={statusColors[invoice.status]} variant="secondary">
                {invoice.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
