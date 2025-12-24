import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { PaymentIntegrations } from "@/components/settings/PaymentIntegrations";
import { TemplateSettings } from "@/components/settings/TemplateSettings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="integrations">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your business information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={{
                  business_name: profile?.business_name || null,
                  phone_number: profile?.phone_number || null,
                }}
                userId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when reminders are sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings settings={settings} userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>
                Connect payment gateways and mobile money services to accept payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentIntegrations userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>
                Choose your preferred invoice template style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSettings 
                userId={user.id} 
                currentTemplate={(settings as any)?.invoice_template || "modern"} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Other Integrations</CardTitle>
              <CardDescription>
                SMS and email notification services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationSettings settings={settings} userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
