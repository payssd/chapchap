// Email sending via Resend
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "invoices@yourdomain.com",
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// SMS sending via Africa's Talking
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;

    if (!username || !apiKey) {
      return { success: false, error: "Africa's Talking credentials not configured" };
    }

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: apiKey,
      },
      body: new URLSearchParams({
        username,
        to,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.SMSMessageData?.Recipients?.[0]?.status !== "Success") {
      return { success: false, error: data.SMSMessageData?.Message || "Failed to send SMS" };
    }

    return { success: true };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

// Schedule reminders for an invoice
export function calculateReminderDates(
  dueDate: Date,
  daysBefore: number[] = [3],
  daysAfter: number[] = [3, 7, 14]
): Date[] {
  const dates: Date[] = [];

  // Reminders before due date
  daysBefore.forEach((days) => {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - days);
    if (reminderDate > new Date()) {
      dates.push(reminderDate);
    }
  });

  // Reminder on due date
  if (dueDate > new Date()) {
    dates.push(new Date(dueDate));
  }

  // Reminders after due date
  daysAfter.forEach((days) => {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() + days);
    dates.push(reminderDate);
  });

  return dates.sort((a, b) => a.getTime() - b.getTime());
}
