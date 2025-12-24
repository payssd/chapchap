"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Send,
  CheckCircle,
  Copy,
  ExternalLink,
  Bell,
  Trash2,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { generateInvoicePDF, type InvoiceTemplate } from "@/lib/pdf-generator";
import type { Invoice, Client, Payment, Reminder, User } from "@/lib/supabase/database.types";

interface InvoiceDetailProps {
  invoice: Invoice & {
    clients: Client | null;
  };
  payments: Payment[];
  reminders: Reminder[];
  userEmail: string;
  user: User;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function InvoiceDetail({
  invoice,
  payments,
  reminders,
  userEmail,
  user,
}: InvoiceDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  async function handleDownloadPDF() {
    if (!invoice.clients) return;
    
    setIsGeneratingPDF(true);
    try {
      const blob = await generateInvoicePDF({
        invoice,
        client: invoice.clients,
        user,
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  async function handleMarkAsPaid() {
    setIsLoading("paid");
    const supabase = createClient();

    await supabase
      .from("invoices")
      .update({
        status: "PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    setIsLoading(null);
    router.refresh();
  }

  async function handleSendInvoice() {
    setIsLoading("send");
    const supabase = createClient();

    // Update status to SENT
    await supabase
      .from("invoices")
      .update({ status: "SENT" })
      .eq("id", invoice.id);

    setIsLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    setIsLoading("delete");
    const supabase = createClient();

    await supabase.from("invoices").delete().eq("id", invoice.id);

    router.push("/invoices");
    router.refresh();
  }

  function copyPaymentLink() {
    if (invoice.paystack_payment_link) {
      navigator.clipboard.writeText(invoice.paystack_payment_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isOverdue =
    new Date(invoice.due_date) < new Date() &&
    invoice.status !== "PAID" &&
    invoice.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">
                  {invoice.invoice_number}
                </CardTitle>
                <Badge
                  className={statusColors[isOverdue ? "OVERDUE" : invoice.status]}
                  variant="secondary"
                >
                  {isOverdue ? "OVERDUE" : invoice.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Created on {format(new Date(invoice.created_at), "PPP")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {invoice.status === "DRAFT" && (
                <Button onClick={handleSendInvoice} disabled={isLoading === "send"}>
                  {isLoading === "send" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Invoice
                </Button>
              )}
              {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMarkAsPaid}
                    disabled={isLoading === "paid"}
                  >
                    {isLoading === "paid" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Mark as Paid
                  </Button>
                  <Button variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Send Reminder
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || !invoice.clients}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-lg font-medium">
                  {format(new Date(invoice.due_date), "PPP")}
                </p>
              </div>
            </div>

            <Separator />

            {invoice.description && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{invoice.description}</p>
                </div>
                <Separator />
              </>
            )}

            {invoice.paystack_payment_link && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Link</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPaymentLink}
                  >
                    {copied ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(invoice.paystack_payment_link!, "_blank")
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </Button>
                </div>
              </div>
            )}

            {invoice.paid_at && (
              <div>
                <p className="text-sm text-muted-foreground">Paid On</p>
                <p className="text-lg font-medium text-green-600">
                  {format(new Date(invoice.paid_at), "PPP")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.clients ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-medium">{invoice.clients.name}</p>
                </div>
                {invoice.clients.business_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Business</p>
                    <p>{invoice.clients.business_name}</p>
                  </div>
                )}
                {invoice.clients.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{invoice.clients.email}</p>
                  </div>
                )}
                {invoice.clients.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{invoice.clients.phone_number}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Client information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ref: {payment.paystack_reference}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.paid_at), "PPP")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No payments recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reminder History */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder History</CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{reminder.reminder_type}</Badge>
                      <Badge
                        variant="secondary"
                        className={
                          reminder.status === "SENT"
                            ? "bg-green-100 text-green-800"
                            : reminder.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {reminder.status}
                      </Badge>
                    </div>
                    {reminder.message && (
                      <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                        {reminder.message}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reminder.sent_at
                      ? format(new Date(reminder.sent_at), "PPP")
                      : `Scheduled: ${format(new Date(reminder.scheduled_at), "PPP")}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No reminders sent yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoice_number}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading === "delete"}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading === "delete"}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading === "delete" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
