import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    // Verify webhook signature
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (paystackSecretKey && signature) {
      const hash = createHmac("sha512", paystackSecretKey)
        .update(body)
        .digest("hex");
      
      if (hash !== signature) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const payload = JSON.parse(body);
    console.log("Webhook event received:", payload.event);

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle successful payment
    if (payload.event === "charge.success") {
      const { reference, amount, paid_at, metadata, customer } = payload.data;
      const invoiceId = metadata?.invoice_id;

      if (!invoiceId) {
        console.error("No invoice_id in payment metadata");
        return new Response(
          JSON.stringify({ success: true, message: "No invoice_id in metadata" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Processing payment for invoice: ${invoiceId}`);

      // Update invoice status to PAID
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paid_at || new Date().toISOString(),
          paystack_reference: reference,
        })
        .eq("id", invoiceId);

      if (invoiceError) {
        console.error("Error updating invoice:", invoiceError);
      } else {
        console.log(`Invoice ${invoiceId} marked as PAID`);
      }

      // Check if payment record already exists
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("paystack_reference", reference)
        .single();

      if (!existingPayment) {
        // Create payment record
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            invoice_id: invoiceId,
            amount: amount / 100, // Convert from kobo/cents
            paystack_reference: reference,
            paid_at: paid_at || new Date().toISOString(),
          });

        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        } else {
          console.log(`Payment record created for invoice ${invoiceId}`);
        }
      }

      // Fetch invoice and client details for notification
      const { data: invoice } = await supabase
        .from("invoices")
        .select("*, clients(*), users(*)")
        .eq("id", invoiceId)
        .single();

      if (invoice && invoice.clients?.email) {
        // TODO: Send payment confirmation email
        console.log(`Payment confirmation would be sent to: ${invoice.clients.email}`);
      }
    }

    // Handle failed payment
    if (payload.event === "charge.failed") {
      const { reference, metadata } = payload.data;
      const invoiceId = metadata?.invoice_id;

      if (invoiceId) {
        console.log(`Payment failed for invoice: ${invoiceId}, reference: ${reference}`);
        // Optionally update invoice or create a failed payment record
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
