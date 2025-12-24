"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a password reset link. Please check your inbox
            and click the link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
