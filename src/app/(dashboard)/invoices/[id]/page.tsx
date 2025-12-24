import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch invoice with client data
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    notFound();
  }

  // Fetch payments for this invoice
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", id)
    .order("paid_at", { ascending: false });

  // Fetch reminders for this invoice
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Invoice Details</h1>
          <p className="text-muted-foreground">
            View and manage invoice {invoice.invoice_number}
          </p>
        </div>
      </div>

      <InvoiceDetail
        invoice={invoice}
        payments={payments || []}
        reminders={reminders || []}
        userEmail={user.email || ""}
        user={profile!}
      />
    </div>
  );
}
