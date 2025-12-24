import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoicesPageClient } from "@/components/invoices/InvoicesPageClient";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all invoices with client data
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <InvoicesPageClient initialInvoices={invoices || []} />;
}
