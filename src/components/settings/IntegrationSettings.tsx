"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/lib/supabase/database.types";

interface IntegrationSettingsProps {
  settings: UserSettings | null;
  userId: string;
}

export function IntegrationSettings({ settings, userId }: IntegrationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [paystackKey, setPaystackKey] = useState(settings?.paystack_secret_key || "");

  async function handleSave() {
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          paystack_secret_key: paystackKey || null,
        },
        { onConflict: "user_id" }
      );

    setIsLoading(false);

    if (!error) {
      router.refresh();
    }
  }

  async function testConnection() {
    if (!paystackKey) {
      setTestResult("error");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test Paystack connection by fetching account details
      const response = await fetch("https://api.paystack.co/balance", {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      });

      if (response.ok) {
        setTestResult("success");
      } else {
        setTestResult("error");
      }
    } catch {
      setTestResult("error");
    }

    setIsTesting(false);
  }

  const isConnected = !!settings?.paystack_secret_key;

  return (
    <div className="space-y-6">
      {/* Paystack Integration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Paystack</h4>
            <p className="text-sm text-muted-foreground">
              Accept payments via Paystack
            </p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
        </div>

        <div className="space-y-3">
          <Label htmlFor="paystack-key">Secret Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="paystack-key"
                type={showKey ? "text" : "password"}
                placeholder="sk_live_xxxxx or sk_test_xxxxx"
                value={paystackKey}
                onChange={(e) => setPaystackKey(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isTesting || !paystackKey}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Test"
              )}
            </Button>
          </div>
          {testResult === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Connection successful!
            </div>
          )}
          {testResult === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              Connection failed. Please check your API key.
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Get your API keys from{" "}
            <a
              href="https://dashboard.paystack.com/#/settings/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Paystack Dashboard
            </a>
          </p>
        </div>
      </div>

      <Separator />

      {/* Africa's Talking (Info only - configured via env) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Africa&apos;s Talking (SMS)</h4>
            <p className="text-sm text-muted-foreground">
              Send SMS reminders to clients
            </p>
          </div>
          <Badge variant="secondary">Server Configured</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          SMS integration is configured at the server level. Contact support if you need to update SMS settings.
        </p>
      </div>

      <Separator />

      {/* Resend (Info only - configured via env) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Resend (Email)</h4>
            <p className="text-sm text-muted-foreground">
              Send email notifications and reminders
            </p>
          </div>
          <Badge variant="secondary">Server Configured</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Email integration is configured at the server level. Contact support if you need to update email settings.
        </p>
      </div>

      <Separator />

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Integration Settings
      </Button>
    </div>
  );
}
