export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone_number: string | null
          business_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone_number?: string | null
          business_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone_number?: string | null
          business_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          invoice_number: string
          amount: number
          currency: string
          description: string | null
          due_date: string
          status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
          paystack_payment_link: string | null
          paystack_reference: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          invoice_number: string
          amount: number
          currency?: string
          description?: string | null
          due_date: string
          status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
          paystack_payment_link?: string | null
          paystack_reference?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          invoice_number?: string
          amount?: number
          currency?: string
          description?: string | null
          due_date?: string
          status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
          paystack_payment_link?: string | null
          paystack_reference?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          paystack_reference: string
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          paystack_reference: string
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          paystack_reference?: string
          paid_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          invoice_id: string
          reminder_type: "EMAIL" | "SMS" | "WHATSAPP"
          scheduled_at: string
          sent_at: string | null
          status: "PENDING" | "SENT" | "FAILED"
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          reminder_type: "EMAIL" | "SMS" | "WHATSAPP"
          scheduled_at: string
          sent_at?: string | null
          status?: "PENDING" | "SENT" | "FAILED"
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          reminder_type?: "EMAIL" | "SMS" | "WHATSAPP"
          scheduled_at?: string
          sent_at?: string | null
          status?: "PENDING" | "SENT" | "FAILED"
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          business_name: string | null
          phone_number: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          business_name?: string | null
          phone_number?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string | null
          phone_number?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          auto_reminders_enabled: boolean
          reminder_days_before: Json
          reminder_days_after: Json
          email_notifications: boolean
          sms_notifications: boolean
          paystack_secret_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          auto_reminders_enabled?: boolean
          reminder_days_before?: Json
          reminder_days_after?: Json
          email_notifications?: boolean
          sms_notifications?: boolean
          paystack_secret_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          auto_reminders_enabled?: boolean
          reminder_days_before?: Json
          reminder_days_after?: Json
          email_notifications?: boolean
          sms_notifications?: boolean
          paystack_secret_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_integrations: {
        Row: {
          id: string
          user_id: string
          integration_type: "gateway" | "mobile_money"
          provider: string
          display_name: string | null
          credentials: Json
          is_active: boolean
          is_default: boolean
          supported_currencies: string[]
          supported_methods: string[]
          webhook_url: string | null
          last_verified_at: string | null
          verification_status: "pending" | "verified" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_type: "gateway" | "mobile_money"
          provider: string
          display_name?: string | null
          credentials?: Json
          is_active?: boolean
          is_default?: boolean
          supported_currencies?: string[]
          supported_methods?: string[]
          webhook_url?: string | null
          last_verified_at?: string | null
          verification_status?: "pending" | "verified" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_type?: "gateway" | "mobile_money"
          provider?: string
          display_name?: string | null
          credentials?: Json
          is_active?: boolean
          is_default?: boolean
          supported_currencies?: string[]
          supported_methods?: string[]
          webhook_url?: string | null
          last_verified_at?: string | null
          verification_status?: "pending" | "verified" | "failed"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_payment_methods: {
        Row: {
          id: string
          invoice_id: string
          integration_id: string
          payment_link: string | null
          payment_reference: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          integration_id: string
          payment_link?: string | null
          payment_reference?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          integration_id?: string
          payment_link?: string | null
          payment_reference?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payment_methods_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payment_methods_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "payment_integrations"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          filter_criteria: Json
          message_template: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
          metrics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filter_criteria?: Json
          message_template?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filter_criteria?: Json
          message_template?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recurring_invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          amount: number
          currency: string
          description: string | null
          frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
          next_invoice_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          amount: number
          currency?: string
          description?: string | null
          frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
          next_invoice_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          amount?: number
          currency?: string
          description?: string | null
          frequency?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
          next_invoice_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_plans: {
        Row: {
          id: string
          invoice_id: string
          installment_number: number
          amount: number
          due_date: string
          status: "PENDING" | "PAID" | "OVERDUE"
          payment_link: string | null
          payment_reference: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          installment_number: number
          amount: number
          due_date: string
          status?: "PENDING" | "PAID" | "OVERDUE"
          payment_link?: string | null
          payment_reference?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          installment_number?: number
          amount?: number
          due_date?: string
          status?: "PENDING" | "PAID" | "OVERDUE"
          payment_link?: string | null
          payment_reference?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: "owner" | "admin" | "member"
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          team_id: string
          user_id: string
          role?: "owner" | "admin" | "member"
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          team_id?: string
          user_id?: string
          role?: "owner" | "admin" | "member"
          invited_at?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      client_portal_tokens: {
        Row: {
          id: string
          client_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          category: string
          description: string | null
          date: string
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          category: string
          description?: string | null
          date: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          category?: string
          description?: string | null
          date?: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_usd: number
          price_kes: number
          billing_period: string
          invoice_limit: number | null
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_usd: number
          price_kes: number
          billing_period?: string
          invoice_limit?: number | null
          features: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price_usd?: number
          price_kes?: number
          billing_period?: string
          invoice_limit?: number | null
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          trial_ends_at: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          paystack_subscription_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          paystack_subscription_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          paystack_subscription_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          period_start: string
          period_end: string
          invoices_created: number
          reminders_sent: number
          clients_added: number
        }
        Insert: {
          id?: string
          user_id: string
          period_start: string
          period_end: string
          invoices_created?: number
          reminders_sent?: number
          clients_added?: number
        }
        Update: {
          id?: string
          user_id?: string
          period_start?: string
          period_end?: string
          invoices_created?: number
          reminders_sent?: number
          clients_added?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          company: string | null
          team_size: number | null
          message: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string | null
          team_size?: number | null
          message?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string | null
          team_size?: number | null
          message?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

// Convenience type aliases
export type User = Tables<"users">
export type Client = Tables<"clients">
export type Invoice = Tables<"invoices">
export type Reminder = Tables<"reminders">
export type Payment = Tables<"payments">
export type UserSettings = Tables<"user_settings">
export type PaymentIntegration = Tables<"payment_integrations">
export type InvoicePaymentMethod = Tables<"invoice_payment_methods">

export type InsertUser = InsertTables<"users">
export type InsertClient = InsertTables<"clients">
export type InsertInvoice = InsertTables<"invoices">
export type InsertReminder = InsertTables<"reminders">
export type InsertPayment = InsertTables<"payments">
export type InsertUserSettings = InsertTables<"user_settings">
export type InsertPaymentIntegration = InsertTables<"payment_integrations">
export type InsertInvoicePaymentMethod = InsertTables<"invoice_payment_methods">

export type UpdateUser = UpdateTables<"users">
export type UpdateClient = UpdateTables<"clients">
export type UpdateInvoice = UpdateTables<"invoices">
export type UpdateReminder = UpdateTables<"reminders">
export type UpdatePayment = UpdateTables<"payments">
export type UpdateUserSettings = UpdateTables<"user_settings">
export type UpdatePaymentIntegration = UpdateTables<"payment_integrations">
export type UpdateInvoicePaymentMethod = UpdateTables<"invoice_payment_methods">

export type Campaign = Tables<"campaigns">
export type RecurringInvoice = Tables<"recurring_invoices">
export type PaymentPlan = Tables<"payment_plans">
export type Team = Tables<"teams">
export type TeamMember = Tables<"team_members">
export type ClientPortalToken = Tables<"client_portal_tokens">
export type Expense = Tables<"expenses">

export type InsertCampaign = InsertTables<"campaigns">
export type InsertRecurringInvoice = InsertTables<"recurring_invoices">
export type InsertPaymentPlan = InsertTables<"payment_plans">
export type InsertTeam = InsertTables<"teams">
export type InsertTeamMember = InsertTables<"team_members">
export type InsertClientPortalToken = InsertTables<"client_portal_tokens">
export type InsertExpense = InsertTables<"expenses">

export type UpdateCampaign = UpdateTables<"campaigns">
export type UpdateRecurringInvoice = UpdateTables<"recurring_invoices">
export type UpdatePaymentPlan = UpdateTables<"payment_plans">
export type UpdateTeam = UpdateTables<"teams">
export type UpdateTeamMember = UpdateTables<"team_members">
export type UpdateClientPortalToken = UpdateTables<"client_portal_tokens">
export type UpdateExpense = UpdateTables<"expenses">

// Subscription types
export type SubscriptionPlan = Tables<"subscription_plans">
export type UserSubscription = Tables<"user_subscriptions">
export type UsageTracking = Tables<"usage_tracking">
export type EnterpriseInquiry = Tables<"enterprise_inquiries">

export type InsertSubscriptionPlan = InsertTables<"subscription_plans">
export type InsertUserSubscription = InsertTables<"user_subscriptions">
export type InsertUsageTracking = InsertTables<"usage_tracking">
export type InsertEnterpriseInquiry = InsertTables<"enterprise_inquiries">

export type UpdateSubscriptionPlan = UpdateTables<"subscription_plans">
export type UpdateUserSubscription = UpdateTables<"user_subscriptions">
export type UpdateUsageTracking = UpdateTables<"usage_tracking">
export type UpdateEnterpriseInquiry = UpdateTables<"enterprise_inquiries">

// Invoice status type
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"

// Reminder type
export type ReminderType = "EMAIL" | "SMS" | "WHATSAPP"

// Reminder status type
export type ReminderStatus = "PENDING" | "SENT" | "FAILED"

// Subscription status type
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial"

// Plan slug type
export type PlanSlug = "starter" | "professional" | "enterprise"
