"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/lib/supabase/database.types";

interface NotificationSettingsProps {
  settings: UserSettings | null;
  userId: string;
}

export function NotificationSettings({ settings, userId }: NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [autoReminders, setAutoReminders] = useState(
    settings?.auto_reminders_enabled ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    settings?.email_notifications ?? true
  );
  const [smsNotifications, setSmsNotifications] = useState(
    settings?.sms_notifications ?? true
  );

  // Reminder days
  const [daysBefore, setDaysBefore] = useState<number[]>(
    (settings?.reminder_days_before as number[]) || [3]
  );
  const [daysAfter, setDaysAfter] = useState<number[]>(
    (settings?.reminder_days_after as number[]) || [3, 7, 14]
  );

  const toggleDayBefore = (day: number) => {
    setDaysBefore((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const toggleDayAfter = (day: number) => {
    setDaysAfter((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  async function handleSave() {
    setIsLoading(true);
    setSuccess(false);

    const supabase = createClient();

    const settingsData = {
      user_id: userId,
      auto_reminders_enabled: autoReminders,
      email_notifications: emailNotifications,
      sms_notifications: smsNotifications,
      reminder_days_before: daysBefore,
      reminder_days_after: daysAfter,
    };

    // Upsert settings
    const { error } = await supabase
      .from("user_settings")
      .upsert(settingsData, { onConflict: "user_id" });

    setIsLoading(false);

    if (!error) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const beforeDueOptions = [1, 3, 5, 7];
  const afterDueOptions = [1, 3, 7, 14, 21, 30];

  return (
    <div className="space-y-6">
      {/* Auto Reminders Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-reminders">Automatic Reminders</Label>
          <p className="text-sm text-muted-foreground">
            Automatically send payment reminders to clients
          </p>
        </div>
        <Switch
          id="auto-reminders"
          checked={autoReminders}
          onCheckedChange={setAutoReminders}
        />
      </div>

      <Separator />

      {/* Notification Channels */}
      <div className="space-y-4">
        <h4 className="font-medium">Notification Channels</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send reminders via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send reminders via SMS
            </p>
          </div>
          <Switch
            id="sms-notifications"
            checked={smsNotifications}
            onCheckedChange={setSmsNotifications}
          />
        </div>
      </div>

      <Separator />

      {/* Reminder Schedule */}
      <div className="space-y-4">
        <h4 className="font-medium">Reminder Schedule</h4>

        <div className="space-y-3">
          <Label>Days before due date</Label>
          <div className="flex flex-wrap gap-2">
            {beforeDueOptions.map((day) => (
              <Button
                key={day}
                type="button"
                variant={daysBefore.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDayBefore(day)}
              >
                {day} day{day > 1 ? "s" : ""}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Days after due date</Label>
          <div className="flex flex-wrap gap-2">
            {afterDueOptions.map((day) => (
              <Button
                key={day}
                type="button"
                variant={daysAfter.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDayAfter(day)}
              >
                {day} day{day > 1 ? "s" : ""}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
        {success && (
          <span className="text-sm text-green-600">Settings saved successfully!</span>
        )}
      </div>
    </div>
  );
}
