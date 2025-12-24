import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PAYSTACK_PLAN_CODES } from "@/lib/paystack-subscriptions";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planSlug } = await request.json();

    if (!planSlug || !["starter", "professional"].includes(planSlug)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get plan code for Paystack
    const planCode = planSlug === "professional" 
      ? PAYSTACK_PLAN_CODES.professional_monthly 
      : PAYSTACK_PLAN_CODES.starter_monthly;

    const reference = `sub_${user.id}_${Date.now()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/verify?reference=${reference}`;

    // Initialize transaction with Paystack
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        plan: planCode,
        callback_url: callbackUrl,
        reference,
        metadata: {
          user_id: user.id,
          plan_slug: planSlug,
          type: "subscription",
        },
      }),
    });

    const result = await response.json();

    if (!result.status) {
      console.error("Paystack initialization failed:", result.message);
      return NextResponse.json(
        { error: result.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "An error occurred while creating subscription" },
      { status: 500 }
    );
  }
}
