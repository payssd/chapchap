"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    async function verifyPayment() {
      const ref = reference || trxref;
      
      if (!ref) {
        setStatus("failed");
        setMessage("No payment reference found");
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${ref}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Your payment has been processed successfully!");
        } else {
          setStatus("failed");
          setMessage(data.error || "Payment verification failed");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("An error occurred while verifying your payment");
      }
    }

    verifyPayment();
  }, [reference, trxref]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          )}
          {status === "success" && (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          )}
          {status === "failed" && (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
          <CardTitle className="mt-4">
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status !== "loading" && (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              {status === "failed" && (
                <Button variant="outline" onClick={() => router.back()}>
                  Try Again
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
