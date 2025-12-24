interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    metadata: {
      invoice_id?: string;
    };
  };
}

export async function createPaymentLink(
  amount: number,
  email: string,
  invoiceId: string,
  currency: string = "KES"
): Promise<PaystackInitializeResponse> {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Paystack uses smallest currency unit
      currency,
      metadata: {
        invoice_id: invoiceId,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
    }),
  });

  return response.json();
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
