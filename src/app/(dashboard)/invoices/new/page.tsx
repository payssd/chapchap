import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { generateInvoiceNumber } from "@/lib/utils/invoice";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch clients for dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  // Get last invoice number to generate next one
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const generatedInvoiceNumber = generateInvoiceNumber(
    lastInvoice?.invoice_number || null
  );

  if (!clients || clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-muted-foreground">
              Create a new invoice for your client
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You need to add a client before creating an invoice.
          </p>
          <Link href="/clients">
            <Button>Add Your First Client</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">
            Create a new invoice for your client
          </p>
        </div>
      </div>

      <InvoiceForm
        clients={clients}
        generatedInvoiceNumber={generatedInvoiceNumber}
      />
    </div>
  );
}
