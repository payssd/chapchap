-- PHASE 1: Subscription Management Database Schema
-- Run this migration to add subscription management tables

-- Subscription Plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Starter', 'Professional', 'Enterprise'
  slug TEXT UNIQUE NOT NULL, -- 'starter', 'professional', 'enterprise'
  price_usd DECIMAL(10,2) NOT NULL,
  price_kes DECIMAL(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
  invoice_limit INTEGER, -- NULL means unlimited
  features JSONB NOT NULL, -- Array of feature names
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  paystack_subscription_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  invoices_created INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  clients_added INTEGER DEFAULT 0,
  UNIQUE(user_id, period_start, period_end)
);

-- Enterprise Inquiries table
CREATE TABLE enterprise_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  team_size INTEGER,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'demo_scheduled', 'closed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_enterprise_inquiries_status ON enterprise_inquiries(status);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active plans" ON subscription_plans 
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON user_subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert subscriptions" ON user_subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_tracking 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert usage" ON usage_tracking 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for enterprise_inquiries (anyone can insert, only admins can view)
CREATE POLICY "Anyone can submit inquiry" ON enterprise_inquiries 
  FOR INSERT WITH CHECK (true);

-- Insert default plans
INSERT INTO subscription_plans (name, slug, price_usd, price_kes, invoice_limit, features) VALUES
('Starter', 'starter', 10.00, 1300.00, 50, 
  '["Up to 50 invoices/month", "Automated reminders", "Email & SMS notifications", "Paystack integration", "Client management", "Basic analytics", "14-day free trial"]'::jsonb
),
('Professional', 'professional', 20.00, 2600.00, NULL, 
  '["Unlimited invoices", "All Starter features", "WhatsApp notifications", "Advanced analytics", "Recurring invoices", "Payment plans/installments", "Multi-currency support", "Invoice templates", "Bulk operations", "Expense tracking", "PDF invoice generation", "Priority support"]'::jsonb
),
('Enterprise', 'enterprise', 0.00, 0.00, NULL, 
  '["All Professional features", "Multi-user/team access", "Role-based permissions", "Client portal", "White-label branding", "Custom domain", "API access", "Dedicated account manager", "Custom integrations", "SLA guarantee"]'::jsonb
);

-- Function to check if user has exceeded plan limits
CREATE OR REPLACE FUNCTION check_invoice_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
  v_period_start TIMESTAMP;
BEGIN
  -- Get user's plan limit
  SELECT sp.invoice_limit, us.current_period_start
  INTO v_limit, v_period_start
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
  AND us.status IN ('active', 'trial')
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- NULL limit means unlimited
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- No subscription found, deny
  IF v_period_start IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Count invoices in current period
  SELECT COUNT(*)
  INTO v_current_count
  FROM invoices
  WHERE user_id = p_user_id
  AND created_at >= v_period_start;
  
  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_slug TEXT,
  status TEXT,
  invoice_limit INTEGER,
  features JSONB,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  price_usd DECIMAL(10,2),
  price_kes DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.slug,
    us.status,
    sp.invoice_limit,
    sp.features,
    us.trial_ends_at,
    us.current_period_end,
    sp.price_usd,
    sp.price_kes
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.status IN ('active', 'trial')
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's usage for current period
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE (
  invoices_created INTEGER,
  reminders_sent INTEGER,
  clients_added INTEGER,
  invoice_limit INTEGER,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ut.invoices_created, 0),
    COALESCE(ut.reminders_sent, 0),
    COALESCE(ut.clients_added, 0),
    sp.invoice_limit,
    us.current_period_start::DATE,
    us.current_period_end::DATE
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN usage_tracking ut ON ut.user_id = us.user_id 
    AND ut.period_start = us.current_period_start::DATE
  WHERE us.user_id = p_user_id
  AND us.status IN ('active', 'trial')
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create trial subscription on user signup
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_starter_plan_id UUID;
BEGIN
  -- Get Starter plan ID
  SELECT id INTO v_starter_plan_id
  FROM subscription_plans
  WHERE slug = 'starter'
  LIMIT 1;
  
  -- Create trial subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    trial_ends_at,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    v_starter_plan_id,
    'trial',
    NOW() + INTERVAL '14 days',
    NOW(),
    NOW() + INTERVAL '14 days'
  );
  
  -- Initialize usage tracking
  INSERT INTO usage_tracking (
    user_id,
    period_start,
    period_end,
    invoices_created,
    reminders_sent,
    clients_added
  ) VALUES (
    NEW.id,
    NOW()::DATE,
    (NOW() + INTERVAL '14 days')::DATE,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to create trial on signup (drop if exists first)
DROP TRIGGER IF EXISTS on_user_created_trial ON users;
CREATE TRIGGER on_user_created_trial
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();

-- Function to update usage tracking for invoices
CREATE OR REPLACE FUNCTION update_invoice_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Get current billing period
  SELECT current_period_start::DATE, current_period_end::DATE
  INTO v_period_start, v_period_end
  FROM user_subscriptions
  WHERE user_id = NEW.user_id
  AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no subscription found, skip
  IF v_period_start IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update or insert usage tracking
  INSERT INTO usage_tracking (user_id, period_start, period_end, invoices_created)
  VALUES (NEW.user_id, v_period_start, v_period_end, 1)
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET invoices_created = usage_tracking.invoices_created + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to track invoice creation
DROP TRIGGER IF EXISTS track_invoice_creation ON invoices;
CREATE TRIGGER track_invoice_creation
  AFTER INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_usage();

-- Function to update usage tracking for reminders
CREATE OR REPLACE FUNCTION update_reminder_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_user_id UUID;
BEGIN
  -- Get user_id from invoice
  SELECT user_id INTO v_user_id
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Get current billing period
  SELECT current_period_start::DATE, current_period_end::DATE
  INTO v_period_start, v_period_end
  FROM user_subscriptions
  WHERE user_id = v_user_id
  AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no subscription found, skip
  IF v_period_start IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update or insert usage tracking
  INSERT INTO usage_tracking (user_id, period_start, period_end, reminders_sent)
  VALUES (v_user_id, v_period_start, v_period_end, 1)
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET reminders_sent = usage_tracking.reminders_sent + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to track reminder sending
DROP TRIGGER IF EXISTS track_reminder_sent ON reminders;
CREATE TRIGGER track_reminder_sent
  AFTER INSERT ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_reminder_usage();

-- Function to update usage tracking for clients
CREATE OR REPLACE FUNCTION update_client_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Get current billing period
  SELECT current_period_start::DATE, current_period_end::DATE
  INTO v_period_start, v_period_end
  FROM user_subscriptions
  WHERE user_id = NEW.user_id
  AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no subscription found, skip
  IF v_period_start IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update or insert usage tracking
  INSERT INTO usage_tracking (user_id, period_start, period_end, clients_added)
  VALUES (NEW.user_id, v_period_start, v_period_end, 1)
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET clients_added = usage_tracking.clients_added + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to track client creation
DROP TRIGGER IF EXISTS track_client_creation ON clients;
CREATE TRIGGER track_client_creation
  AFTER INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION update_client_usage();

-- Add role column to users table for admin access
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
