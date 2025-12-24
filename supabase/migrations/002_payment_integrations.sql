-- Migration: Add payment integrations support for multiple gateways and mobile money
-- This allows users to configure their own payment provider credentials

-- Payment Integrations table
CREATE TABLE payment_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Integration type: 'gateway' for payment gateways, 'mobile_money' for direct mobile money
  integration_type TEXT NOT NULL CHECK (integration_type IN ('gateway', 'mobile_money')),
  
  -- Provider identifier
  -- Gateways: 'paystack', 'flutterwave', 'pesapal', 'dpo'
  -- Mobile Money: 'mpesa_kenya', 'mpesa_tanzania', 'airtel_money', 'mtn_momo', 'tigo_pesa'
  provider TEXT NOT NULL,
  
  -- Display name for the integration (user can customize)
  display_name TEXT,
  
  -- Encrypted credentials stored as JSONB
  -- Structure varies by provider (see comments below)
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Configuration options
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  
  -- Supported currencies for this integration
  supported_currencies TEXT[] DEFAULT ARRAY['KES'],
  
  -- Supported payment methods (for gateways that support multiple)
  supported_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Webhook URL for this integration (auto-generated)
  webhook_url TEXT,
  
  -- Last verification status
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique provider per user
  UNIQUE(user_id, provider)
);

-- Credential structure documentation (stored encrypted in credentials JSONB):
-- 
-- PAYSTACK:
-- { "public_key": "pk_...", "secret_key": "sk_..." }
--
-- FLUTTERWAVE:
-- { "public_key": "FLWPUBK_...", "secret_key": "FLWSECK_...", "encryption_key": "..." }
--
-- PESAPAL:
-- { "consumer_key": "...", "consumer_secret": "...", "environment": "sandbox|live" }
--
-- DPO:
-- { "company_token": "...", "service_type": "...", "environment": "sandbox|live" }
--
-- M-PESA KENYA (Daraja):
-- { "consumer_key": "...", "consumer_secret": "...", "passkey": "...", "shortcode": "...", "environment": "sandbox|live" }
--
-- AIRTEL MONEY:
-- { "client_id": "...", "client_secret": "...", "environment": "sandbox|live" }
--
-- MTN MOMO:
-- { "subscription_key": "...", "api_user": "...", "api_key": "...", "environment": "sandbox|live" }

-- Payment methods available for invoices
CREATE TABLE invoice_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES payment_integrations(id) ON DELETE CASCADE,
  
  -- Payment link generated for this method
  payment_link TEXT,
  payment_reference TEXT,
  
  -- Status of this payment method for the invoice
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(invoice_id, integration_id)
);

-- Update payments table to track which integration was used
ALTER TABLE payments ADD COLUMN integration_id UUID REFERENCES payment_integrations(id);
ALTER TABLE payments ADD COLUMN provider TEXT;
ALTER TABLE payments ADD COLUMN payment_method TEXT; -- 'card', 'mpesa', 'bank_transfer', etc.
ALTER TABLE payments ADD COLUMN provider_reference TEXT; -- Provider's transaction ID
ALTER TABLE payments ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb; -- Additional provider data

-- Make paystack_reference nullable since we now support multiple providers
ALTER TABLE payments ALTER COLUMN paystack_reference DROP NOT NULL;

-- Update invoices table to support multiple payment options
ALTER TABLE invoices ADD COLUMN payment_methods TEXT[] DEFAULT ARRAY[]::TEXT[]; -- ['card', 'mpesa', 'bank_transfer']
ALTER TABLE invoices ADD COLUMN default_integration_id UUID REFERENCES payment_integrations(id);

-- Rename paystack-specific columns to be more generic (keep for backward compatibility)
ALTER TABLE invoices RENAME COLUMN paystack_payment_link TO payment_link;
ALTER TABLE invoices RENAME COLUMN paystack_reference TO payment_reference;

-- Create indexes
CREATE INDEX idx_payment_integrations_user_id ON payment_integrations(user_id);
CREATE INDEX idx_payment_integrations_provider ON payment_integrations(provider);
CREATE INDEX idx_payment_integrations_active ON payment_integrations(is_active);
CREATE INDEX idx_invoice_payment_methods_invoice_id ON invoice_payment_methods(invoice_id);
CREATE INDEX idx_payments_integration_id ON payments(integration_id);

-- Enable RLS
ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_integrations
CREATE POLICY "Users can view own integrations" ON payment_integrations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations" ON payment_integrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON payment_integrations 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON payment_integrations 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoice_payment_methods
CREATE POLICY "Users can view own invoice payment methods" ON invoice_payment_methods 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_payment_methods.invoice_id AND invoices.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own invoice payment methods" ON invoice_payment_methods 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_payment_methods.invoice_id AND invoices.user_id = auth.uid())
  );
CREATE POLICY "Users can update own invoice payment methods" ON invoice_payment_methods 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_payment_methods.invoice_id AND invoices.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own invoice payment methods" ON invoice_payment_methods 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_payment_methods.invoice_id AND invoices.user_id = auth.uid())
  );

-- Add trigger for updated_at
CREATE TRIGGER update_payment_integrations_updated_at 
  BEFORE UPDATE ON payment_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default integration per type per user
CREATE OR REPLACE FUNCTION ensure_single_default_integration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_integrations 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND integration_type = NEW.integration_type 
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_integration_trigger
  BEFORE INSERT OR UPDATE ON payment_integrations
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_integration();

-- Remove paystack_secret_key from user_settings (now in payment_integrations)
-- We keep it for backward compatibility but mark as deprecated
COMMENT ON COLUMN user_settings.paystack_secret_key IS 'DEPRECATED: Use payment_integrations table instead';
