"use client";

import { useState } from "react";
import { Send, CheckCircle, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/lib/supabase/database.types";

interface BulkActionsProps {
  selectedInvoices: Invoice[];
  onClearSelection: () => void;
  onComplete: () => void;
}

type BulkOperation = "send" | "markPaid" | "delete" | null;

interface OperationResult {
  success: number;
  failed: number;
  total: number;
}

export function BulkActions({
  selectedInvoices,
  onClearSelection,
  onComplete,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperation>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OperationResult | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<BulkOperation>(null);

  const count = selectedInvoices.length;

  async function handleBulkOperation(operation: BulkOperation) {
    if (!operation) return;

    setConfirmDialog(null);
    setIsProcessing(true);
    setCurrentOperation(operation);
    setProgress(0);
    setResult(null);

    const supabase = createClient();
    let success = 0;
    let failed = 0;
    const total = selectedInvoices.length;

    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoice = selectedInvoices[i];

      try {
        if (operation === "send") {
          const { error } = await supabase
            .from("invoices")
            .update({ status: "SENT" })
            .eq("id", invoice.id);
          if (error) throw error;
        } else if (operation === "markPaid") {
          const { error } = await supabase
            .from("invoices")
            .update({ status: "PAID", paid_at: new Date().toISOString() })
            .eq("id", invoice.id);
          if (error) throw error;
        } else if (operation === "delete") {
          const { error } = await supabase
            .from("invoices")
            .delete()
            .eq("id", invoice.id);
          if (error) throw error;
        }
        success++;
      } catch (error) {
        console.error(`Failed to process invoice ${invoice.id}:`, error);
        failed++;
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setResult({ success, failed, total });
    setIsProcessing(false);
    setCurrentOperation(null);

    // Auto-complete after showing results
    setTimeout(() => {
      setResult(null);
      onClearSelection();
      onComplete();
    }, 2000);
  }

  if (count === 0) return null;

  const operationLabels: Record<string, string> = {
    send: "Sending invoices",
    markPaid: "Marking as paid",
    delete: "Deleting invoices",
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-card border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
          {isProcessing ? (
            <div className="flex items-center gap-4 min-w-[300px]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {currentOperation && operationLabels[currentOperation]}...
                </p>
                <Progress value={progress} className="h-2 mt-1" />
              </div>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          ) : result ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm">
                <span className="font-medium text-green-600">{result.success} successful</span>
                {result.failed > 0 && (
                  <span className="text-red-600 ml-2">{result.failed} failed</span>
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{count} selected</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onClearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-border" />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDialog("send")}
                  disabled={selectedInvoices.every((i) => i.status !== "DRAFT")}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDialog("markPaid")}
                  disabled={selectedInvoices.every(
                    (i) => i.status === "PAID" || i.status === "CANCELLED"
                  )}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark All Paid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setConfirmDialog("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={confirmDialog === "send"}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send {count} Invoices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all selected draft invoices as sent. Clients will be
              notified if email notifications are enabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBulkOperation("send")}>
              Send All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDialog === "markPaid"}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark {count} Invoices as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all selected invoices as paid with today&apos;s date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBulkOperation("markPaid")}>
              Mark All Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDialog === "delete"}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} Invoices?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected invoices and their
              associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkOperation("delete")}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
