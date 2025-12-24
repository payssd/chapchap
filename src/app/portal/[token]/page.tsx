import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientPortal } from "@/components/portal/ClientPortal";

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch portal token
  const { data: portalToken } = await supabase
    .from("client_portal_tokens")
    .select("*, clients(*)")
    .eq("token", token)
    .single();

  if (!portalToken) {
    notFound();
  }

  // Check if token is expired
  if (new Date(portalToken.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-2">Link Expired</h1>
          <p className="text-muted-foreground">
            This portal link has expired. Please contact the business for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Fetch client's invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", portalToken.client_id)
    .order("created_at", { ascending: false });

  // Fetch payments for these invoices
  const invoiceIds = invoices?.map((inv) => inv.id) || [];
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .in("invoice_id", invoiceIds.length > 0 ? invoiceIds : ["none"]);

  return (
    <ClientPortal
      client={portalToken.clients}
      invoices={invoices || []}
      payments={payments || []}
      token={token}
    />
  );
}
