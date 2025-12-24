import { createClient } from "@/lib/supabase/client";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Paystack plan codes - these should be created in Paystack Dashboard
export const PAYSTACK_PLAN_CODES = {
  starter_monthly: process.env.PAYSTACK_STARTER_PLAN_CODE || "PLN_starter_monthly",
  professional_monthly: process.env.PAYSTACK_PROFESSIONAL_PLAN_CODE || "PLN_professional_monthly",
};

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializeTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface SubscriptionData {
  subscription_code: string;
  email_token: string;
  status: string;
  next_payment_date: string;
}

/**
 * Initialize a subscription transaction with Paystack
 */
export async function initializeSubscription(
  email: string,
  planCode: string,
  userId: string,
  callbackUrl: string
): Promise<{ authorizationUrl: string; reference: string } | null> {
  try {
    const reference = `sub_${userId}_${Date.now()}`;
    
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        plan: planCode,
        callback_url: callbackUrl,
        reference,
        metadata: {
          user_id: userId,
          type: "subscription",
        },
      }),
    });

    const result: PaystackResponse<InitializeTransactionData> = await response.json();

    if (!result.status) {
      console.error("Paystack initialization failed:", result.message);
      return null;
    }

    return {
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    };
  } catch (error) {
    console.error("Error initializing subscription:", error);
    return null;
  }
}

/**
 * Verify a subscription payment
 */
export async function verifySubscription(reference: string): Promise<{
  success: boolean;
  subscriptionCode?: string;
  message?: string;
}> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!result.status || result.data.status !== "success") {
      return {
        success: false,
        message: result.message || "Payment verification failed",
      };
    }

    return {
      success: true,
      subscriptionCode: result.data.subscription?.subscription_code,
    };
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return {
      success: false,
      message: "An error occurred while verifying payment",
    };
  }
}

/**
 * Get subscription details from Paystack
 */
export async function getSubscription(subscriptionCode: string): Promise<SubscriptionData | null> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/${subscriptionCode}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result: PaystackResponse<SubscriptionData> = await response.json();

    if (!result.status) {
      console.error("Failed to get subscription:", result.message);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
}

/**
 * Cancel a Paystack subscription
 */
export async function cancelSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    });

    const result = await response.json();

    if (!result.status) {
      return {
        success: false,
        message: result.message || "Failed to cancel subscription",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      message: "An error occurred while canceling subscription",
    };
  }
}

/**
 * Enable a previously disabled subscription
 */
export async function enableSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/enable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    });

    const result = await response.json();

    if (!result.status) {
      return {
        success: false,
        message: result.message || "Failed to enable subscription",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error enabling subscription:", error);
    return {
      success: false,
      message: "An error occurred while enabling subscription",
    };
  }
}

/**
 * Update user subscription in database after successful payment
 */
export async function updateUserSubscription(
  userId: string,
  planSlug: string,
  subscriptionCode: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get the plan ID
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", planSlug)
      .single();

    if (!plan) {
      console.error("Plan not found:", planSlug);
      return false;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update or insert subscription
    const { error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        status: "active",
        trial_ends_at: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        paystack_subscription_code: subscriptionCode,
        updated_at: now.toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Error updating subscription:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    return false;
  }
}
