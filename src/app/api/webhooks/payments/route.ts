// Universal Payment Webhook Handler
// Routes webhooks to the appropriate provider handler

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPaymentProvider } from "@/lib/payments";
import type { PaymentProvider } from "@/lib/payments/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get provider from URL params or headers
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("provider") as PaymentProvider;
    const integrationId = searchParams.get("integration_id");

    if (!providerId) {
      return NextResponse.json(
        { error: "Provider not specified" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Get signature from headers (varies by provider)
    const signature = 
      request.headers.get("x-paystack-signature") ||
      request.headers.get("verif-hash") || // Flutterwave
      request.headers.get("x-callback-signature") ||
      "";

    // If integration_id provided, get credentials from database
    let credentials: Record<string, string> = {};
    
    if (integrationId) {
      const { data: integration } = await supabase
        .from("payment_integrations")
        .select("credentials, user_id")
        .eq("id", integrationId)
        .single();

      if (integration) {
        credentials = integration.credentials as Record<string, string>;
      }
    }

    // Create provider instance and verify signature
    if (Object.keys(credentials).length > 0) {
      const provider = createPaymentProvider(providerId, credentials);
      const isValid = provider.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        console.error("Invalid webhook signature for provider:", providerId);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Route to appropriate handler based on provider
    switch (providerId) {
      case "paystack":
        return handlePaystackWebhook(supabase, payload);
      case "flutterwave":
        return handleFlutterwaveWebhook(supabase, payload);
      case "mpesa_kenya":
        return handleMpesaWebhook(supabase, payload);
      case "airtel_money":
        return handleAirtelWebhook(supabase, payload);
      default:
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Paystack Webhook Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaystackWebhook(
  supabase: any,
  payload: Record<string, unknown>
) {
  const event = payload.event as string;
  const data = payload.data as Record<string, unknown>;

  if (event === "charge.success") {
    const reference = data.reference as string;
    const amount = (data.amount as number) / 100; // Convert from kobo
    const paidAt = data.paid_at as string;
    const channel = data.channel as string;

    // Find invoice by reference
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, user_id, status")
      .eq("payment_reference", reference)
      .single();

    if (invoice && invoice.status !== "PAID") {
      // Update invoice status
      await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paidAt,
        })
        .eq("id", invoice.id);

      // Create payment record
      await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount,
        provider: "paystack",
        provider_reference: reference,
        payment_method: channel,
        paid_at: paidAt,
        metadata: data,
      });

      // Cancel pending reminders
      await supabase
        .from("reminders")
        .update({ status: "CANCELLED" })
        .eq("invoice_id", invoice.id)
        .eq("status", "PENDING");
    }
  }

  return NextResponse.json({ received: true });
}

// Flutterwave Webhook Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleFlutterwaveWebhook(
  supabase: any,
  payload: Record<string, unknown>
) {
  const event = payload.event as string;
  const data = payload.data as Record<string, unknown>;

  if (event === "charge.completed" && data.status === "successful") {
    const reference = data.tx_ref as string;
    const amount = data.amount as number;
    const paidAt = data.created_at as string;
    const paymentType = data.payment_type as string;

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, user_id, status")
      .eq("payment_reference", reference)
      .single();

    if (invoice && invoice.status !== "PAID") {
      await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paidAt,
        })
        .eq("id", invoice.id);

      await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount,
        provider: "flutterwave",
        provider_reference: data.flw_ref as string,
        payment_method: paymentType,
        paid_at: paidAt,
        metadata: data,
      });

      await supabase
        .from("reminders")
        .update({ status: "CANCELLED" })
        .eq("invoice_id", invoice.id)
        .eq("status", "PENDING");
    }
  }

  return NextResponse.json({ received: true });
}

// M-Pesa (Daraja) Webhook Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleMpesaWebhook(
  supabase: any,
  payload: Record<string, unknown>
) {
  const body = payload.Body as Record<string, unknown>;
  const stkCallback = body?.stkCallback as Record<string, unknown>;

  if (!stkCallback) {
    return NextResponse.json({ received: true });
  }

  const resultCode = stkCallback.ResultCode as number;
  const merchantRequestId = stkCallback.MerchantRequestID as string;

  if (resultCode === 0) {
    // Payment successful
    const callbackMetadata = stkCallback.CallbackMetadata as Record<string, unknown>;
    const items = callbackMetadata?.Item as Array<{ Name: string; Value: unknown }>;

    let amount = 0;
    let mpesaReceiptNumber = "";
    let transactionDate = "";
    let phoneNumber = "";

    items?.forEach((item) => {
      switch (item.Name) {
        case "Amount":
          amount = item.Value as number;
          break;
        case "MpesaReceiptNumber":
          mpesaReceiptNumber = item.Value as string;
          break;
        case "TransactionDate":
          transactionDate = String(item.Value);
          break;
        case "PhoneNumber":
          phoneNumber = String(item.Value);
          break;
      }
    });

    // Find invoice by merchant request ID (stored as checkout_request_id)
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, user_id, status")
      .eq("payment_reference", merchantRequestId)
      .single();

    if (invoice && invoice.status !== "PAID") {
      const paidAt = new Date().toISOString();

      await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paidAt,
        })
        .eq("id", invoice.id);

      await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount,
        provider: "mpesa_kenya",
        provider_reference: mpesaReceiptNumber,
        payment_method: "mpesa",
        paid_at: paidAt,
        metadata: {
          phone_number: phoneNumber,
          transaction_date: transactionDate,
          merchant_request_id: merchantRequestId,
        },
      });

      await supabase
        .from("reminders")
        .update({ status: "CANCELLED" })
        .eq("invoice_id", invoice.id)
        .eq("status", "PENDING");
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

// Airtel Money Webhook Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleAirtelWebhook(
  supabase: any,
  payload: Record<string, unknown>
) {
  const transaction = payload.transaction as Record<string, unknown>;

  if (!transaction) {
    return NextResponse.json({ received: true });
  }

  const status = transaction.status as string;
  const reference = transaction.id as string;

  if (status === "TS") {
    // Transaction successful
    const amount = parseFloat(transaction.amount as string);
    const airtelMoneyId = transaction.airtel_money_id as string;

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, user_id, status")
      .eq("payment_reference", reference)
      .single();

    if (invoice && invoice.status !== "PAID") {
      const paidAt = new Date().toISOString();

      await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paidAt,
        })
        .eq("id", invoice.id);

      await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount,
        provider: "airtel_money",
        provider_reference: airtelMoneyId,
        payment_method: "airtel",
        paid_at: paidAt,
        metadata: transaction,
      });

      await supabase
        .from("reminders")
        .update({ status: "CANCELLED" })
        .eq("invoice_id", invoice.id)
        .eq("status", "PENDING");
    }
  }

  return NextResponse.json({ received: true });
}
