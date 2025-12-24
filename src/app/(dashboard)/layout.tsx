import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SubscriptionProvider } from "@/lib/contexts/SubscriptionContext";
import { TrialBanner } from "@/components/subscription/TrialBanner";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = {
    id: user.id,
    email: user.email || "",
    businessName: profile?.business_name || "",
    phoneNumber: profile?.phone_number || "",
  };

  return (
    <SubscriptionProvider>
      <TrialBanner />
      <DashboardLayout user={userData}>{children}</DashboardLayout>
    </SubscriptionProvider>
  );
}
