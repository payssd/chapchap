import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RecurringInvoicesClient } from "@/components/invoices/RecurringInvoicesClient";

export default async function RecurringInvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recurring invoices with client data
  const { data: recurringInvoices } = await supabase
    .from("recurring_invoices")
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("next_invoice_date", { ascending: true });

  // Fetch clients for the form
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recurring Invoices</h1>
        <p className="text-muted-foreground">
          Set up automatic invoice generation on a schedule
        </p>
      </div>

      <RecurringInvoicesClient
        recurringInvoices={recurringInvoices || []}
        clients={clients || []}
      />
    </div>
  );
}
