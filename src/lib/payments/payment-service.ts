// Payment Service - Handles payment link generation and verification

import { createClient } from "@/lib/supabase/client";
import { createPaymentProvider } from "./providers";
import type { 
  PaymentIntegration, 
  PaymentProvider,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  InitiateMobilePaymentRequest,
  InitiateMobilePaymentResponse,
} from "./types";

interface GeneratePaymentLinksParams {
  invoiceId: string;
  integrationIds: string[];
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  description?: string;
  callbackUrl?: string;
}

interface PaymentLinkResult {
  integrationId: string;
  provider: PaymentProvider;
  paymentLink?: string;
  reference?: string;
  error?: string;
}

export async function generatePaymentLinks(
  params: GeneratePaymentLinksParams
): Promise<PaymentLinkResult[]> {
  const supabase = createClient();
  const results: PaymentLinkResult[] = [];

  // Fetch integrations
  const { data: integrations } = await supabase
    .from("payment_integrations")
    .select("*")
    .in("id", params.integrationIds)
    .eq("is_active", true);

  if (!integrations || integrations.length === 0) {
    return [];
  }

  for (const integration of integrations as PaymentIntegration[]) {
    try {
      const provider = createPaymentProvider(
        integration.provider,
        integration.credentials
      );

      const reference = `INV_${params.invoiceId}_${integration.provider}_${Date.now()}`;

      // Determine webhook URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const webhookUrl = `${baseUrl}/api/webhooks/payments?provider=${integration.provider}&integration_id=${integration.id}`;

      if (integration.integration_type === "gateway") {
        // Create payment link for gateways
        const request: CreatePaymentLinkRequest = {
          amount: params.amount,
          currency: params.currency,
          email: params.email,
          phone: params.phone,
          reference,
          description: params.description,
          callback_url: params.callbackUrl || `${baseUrl}/invoices/${params.invoiceId}/success`,
          metadata: {
            invoice_id: params.invoiceId,
            integration_id: integration.id,
          },
        };

        const response = await provider.createPaymentLink(request);

        if (response.success) {
          // Store payment method for invoice
          await supabase.from("invoice_payment_methods").upsert({
            invoice_id: params.invoiceId,
            integration_id: integration.id,
            payment_link: response.payment_link,
            payment_reference: response.reference || reference,
          }, { onConflict: "invoice_id,integration_id" });

          results.push({
            integrationId: integration.id,
            provider: integration.provider,
            paymentLink: response.payment_link,
            reference: response.reference,
          });
        } else {
          results.push({
            integrationId: integration.id,
            provider: integration.provider,
            error: response.error,
          });
        }
      } else {
        // For mobile money, we don't generate links upfront
        // Instead, store the integration for later STK push
        await supabase.from("invoice_payment_methods").upsert({
          invoice_id: params.invoiceId,
          integration_id: integration.id,
          payment_reference: reference,
        }, { onConflict: "invoice_id,integration_id" });

        results.push({
          integrationId: integration.id,
          provider: integration.provider,
          reference,
        });
      }
    } catch (error) {
      results.push({
        integrationId: integration.id,
        provider: integration.provider,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function initiateMobilePayment(
  invoiceId: string,
  integrationId: string,
  phone: string
): Promise<InitiateMobilePaymentResponse> {
  const supabase = createClient();

  // Get invoice details
  const { data: invoice } = await supabase
    .from("invoices")
    .select("amount, currency, description")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  // Get integration
  const { data: integration } = await supabase
    .from("payment_integrations")
    .select("*")
    .eq("id", integrationId)
    .eq("is_active", true)
    .single();

  if (!integration) {
    return { success: false, error: "Payment integration not found" };
  }

  try {
    const provider = createPaymentProvider(
      integration.provider as PaymentProvider,
      integration.credentials as Record<string, string>
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reference = `INV_${invoiceId}_${integration.provider}_${Date.now()}`;

    const request: InitiateMobilePaymentRequest = {
      amount: invoice.amount,
      currency: invoice.currency,
      phone,
      reference,
      description: invoice.description || "Invoice Payment",
      callback_url: `${baseUrl}/api/webhooks/payments?provider=${integration.provider}&integration_id=${integrationId}`,
    };

    const response = await provider.initiateMobilePayment(request);

    if (response.success) {
      // Update invoice with payment reference
      await supabase
        .from("invoices")
        .update({ payment_reference: response.reference || reference })
        .eq("id", invoiceId);

      // Update invoice payment method
      await supabase.from("invoice_payment_methods").upsert({
        invoice_id: invoiceId,
        integration_id: integrationId,
        payment_reference: response.reference || reference,
      }, { onConflict: "invoice_id,integration_id" });
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment initiation failed",
    };
  }
}

export async function getInvoicePaymentMethods(invoiceId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("invoice_payment_methods")
    .select(`
      *,
      integration:payment_integrations(
        id,
        provider,
        display_name,
        integration_type,
        supported_methods
      )
    `)
    .eq("invoice_id", invoiceId)
    .eq("is_active", true);

  return data || [];
}
