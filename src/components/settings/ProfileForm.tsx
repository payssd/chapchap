"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  phone_number: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    business_name: string | null;
    phone_number: string | null;
  };
  userId: string;
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: initialData.business_name || "",
      phone_number: initialData.phone_number || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setSuccess(false);

    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        business_name: data.business_name,
        phone_number: data.phone_number || null,
      })
      .eq("id", userId);

    setIsLoading(false);

    if (!error) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Business Ltd" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+254 700 000 000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          {success && (
            <span className="text-sm text-green-600">Changes saved successfully!</span>
          )}
        </div>
      </form>
    </Form>
  );
}
