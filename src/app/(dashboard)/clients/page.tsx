import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientsPageClient } from "@/components/clients/ClientsPageClient";

async function getClientsWithOutstanding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  // Get all clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (!clients) return [];

  // Get outstanding amounts for each client
  const clientsWithOutstanding = await Promise.all(
    clients.map(async (client) => {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("amount")
        .eq("client_id", client.id)
        .in("status", ["DRAFT", "SENT", "OVERDUE"]);

      const total_outstanding =
        invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      return { ...client, total_outstanding };
    })
  );

  return clientsWithOutstanding;
}

export default async function ClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const clients = await getClientsWithOutstanding(supabase, user.id);

  return <ClientsPageClient initialClients={clients} />;
}
