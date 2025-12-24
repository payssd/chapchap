"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import type { Invoice, Client, Payment } from "@/lib/supabase/database.types";

interface ClientPortalProps {
  client: Client;
  invoices: Invoice[];
  payments: Payment[];
  token: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  DRAFT: {
    color: "bg-gray-100 text-gray-800",
    icon: <Clock className="h-3 w-3" />,
    label: "Draft",
  },
  SENT: {
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="h-3 w-3" />,
    label: "Pending",
  },
  PAID: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-3 w-3" />,
    label: "Paid",
  },
  OVERDUE: {
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Overdue",
  },
  CANCELLED: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Cancelled",
  },
};

export function ClientPortal({ client, invoices, payments, token }: ClientPortalProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getInvoicePayments = (invoiceId: string) => {
    return payments.filter((p) => p.invoice_id === invoiceId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Client Portal</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {client.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalOutstanding)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const status = statusConfig[invoice.status];
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <span className="flex items-center gap-1">
                              {status.icon}
                              {status.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.paystack_payment_link &&
                              invoice.status !== "PAID" &&
                              invoice.status !== "CANCELLED" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    window.open(invoice.paystack_payment_link!, "_blank")
                                  }
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Now
                                </Button>
                              )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => {
                  const invoice = invoices.find((inv) => inv.id === payment.invoice_id);
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Invoice: {invoice?.invoice_number || "N/A"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.paid_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoice {selectedInvoice.invoice_number}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusConfig[selectedInvoice.status].color}>
                      {statusConfig[selectedInvoice.status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p>{format(new Date(selectedInvoice.created_at), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p>{format(new Date(selectedInvoice.due_date), "PPP")}</p>
                  </div>
                </div>

                {selectedInvoice.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="mt-1">{selectedInvoice.description}</p>
                    </div>
                  </>
                )}

                {selectedInvoice.paystack_payment_link &&
                  selectedInvoice.status !== "PAID" &&
                  selectedInvoice.status !== "CANCELLED" && (
                    <>
                      <Separator />
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(selectedInvoice.paystack_payment_link!, "_blank")
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </>
                  )}

                {selectedInvoice.paid_at && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Paid on {format(new Date(selectedInvoice.paid_at), "PPP")}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by ChapChap</p>
        </div>
      </footer>
    </div>
  );
}
