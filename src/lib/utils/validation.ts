import * as z from "zod";

// Kenyan phone number validation (+254 format)
export const kenyanPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val === "") return true;
      // Accept +254, 254, 07, or 01 formats
      const cleaned = val.replace(/[\s-]/g, "");
      return /^(\+?254|0)[17]\d{8}$/.test(cleaned);
    },
    {
      message: "Please enter a valid Kenyan phone number (e.g., +254 712 345 678)",
    }
  );

// Format phone to +254 format
export function formatKenyanPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s-]/g, "");
  
  if (cleaned.startsWith("+254")) {
    return cleaned;
  }
  if (cleaned.startsWith("254")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+254${cleaned.slice(1)}`;
  }
  return phone;
}

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .or(z.literal(""));

// Positive amount validation
export const positiveAmountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(100000000, "Amount is too large");

// Future date validation
export const futureDateSchema = z.date().refine(
  (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
  { message: "Date must be today or in the future" }
);

// Invoice number validation
export const invoiceNumberSchema = z
  .string()
  .min(1, "Invoice number is required")
  .regex(/^INV-\d{8}-\d{3}$/, "Invalid invoice number format");

// Common form schemas
export const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema.optional(),
  phone_number: kenyanPhoneSchema,
  business_name: z.string().optional(),
});

export const invoiceFormSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  amount: positiveAmountSchema,
  currency: z.string().default("KES"),
  description: z.string().optional(),
  due_date: futureDateSchema,
});

export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupFormSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    phoneNumber: kenyanPhoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports
export type ClientFormValues = z.infer<typeof clientFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
