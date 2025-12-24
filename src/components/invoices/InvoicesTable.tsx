"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Send, CheckCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { BulkActions } from "./BulkActions";
import type { Invoice, Client } from "@/lib/supabase/database.types";

type InvoiceWithClient = Invoice & {
  clients: Pick<Client, "name" | "email"> | null;
};

interface InvoicesTableProps {
  invoices: InvoiceWithClient[];
  onRefresh: () => void;
  enableSelection?: boolean;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function InvoicesTable({ invoices, onRefresh, enableSelection = true }: InvoicesTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedInvoices = invoices.filter((inv) => selectedIds.has(inv.id));
  const allSelected = invoices.length > 0 && selectedIds.size === invoices.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < invoices.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  async function handleDelete() {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    const supabase = createClient();

    await supabase.from("invoices").delete().eq("id", invoiceToDelete.id);

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
    onRefresh();
  }

  async function handleMarkAsPaid(invoice: Invoice) {
    setIsMarkingPaid(invoice.id);
    const supabase = createClient();

    await supabase
      .from("invoices")
      .update({
        status: "PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    setIsMarkingPaid(null);
    onRefresh();
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No invoices found. Create your first invoice to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </TableHead>
            )}
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className={`cursor-pointer ${selectedIds.has(invoice.id) ? "bg-primary/5" : ""}`}
              onClick={() => router.push(`/invoices/${invoice.id}`)}
            >
              {enableSelection && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(invoice.id)}
                    onChange={() => toggleSelect(invoice.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>{invoice.clients?.name || "Unknown"}</TableCell>
              <TableCell>
                {formatCurrency(invoice.amount, invoice.currency)}
              </TableCell>
              <TableCell>{formatDate(invoice.due_date)}</TableCell>
              <TableCell>
                <Badge className={statusColors[invoice.status]} variant="secondary">
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {invoice.status === "DRAFT" && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/invoices/${invoice.id}?action=send`)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Invoice
                      </DropdownMenuItem>
                    )}
                    {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                      <DropdownMenuItem
                        onClick={() => handleMarkAsPaid(invoice)}
                        disabled={isMarkingPaid === invoice.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setInvoiceToDelete(invoice);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceToDelete?.invoice_number}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {enableSelection && (
        <BulkActions
          selectedInvoices={selectedInvoices}
          onClearSelection={() => setSelectedIds(new Set())}
          onComplete={() => {
            setSelectedIds(new Set());
            onRefresh();
          }}
        />
      )}
    </>
  );
}
