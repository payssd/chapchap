-- Phase 16: Advanced Features Migration

-- =====================================================
-- CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filter_criteria JSONB DEFAULT '{}'::jsonb,
  message_template TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED')),
  metrics JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "paid": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECURRING INVOICES TABLE
-- =====================================================
CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
  next_invoice_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENT PLANS TABLE
-- =====================================================
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  payment_link TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (team_id, user_id)
);

-- =====================================================
-- CLIENT PORTAL TOKENS TABLE
-- =====================================================
CREATE TABLE client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UPDATE USER_SETTINGS TABLE
-- =====================================================
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'KES',
ADD COLUMN IF NOT EXISTS business_logo_url TEXT;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX idx_recurring_invoices_active ON recurring_invoices(is_active);
CREATE INDEX idx_payment_plans_invoice_id ON payment_plans(invoice_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_client_portal_tokens_token ON client_portal_tokens(token);
CREATE INDEX idx_client_portal_tokens_client_id ON client_portal_tokens(client_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Campaigns RLS
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);

-- Recurring Invoices RLS
CREATE POLICY "Users can view own recurring invoices" ON recurring_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring invoices" ON recurring_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring invoices" ON recurring_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring invoices" ON recurring_invoices FOR DELETE USING (auth.uid() = user_id);

-- Payment Plans RLS
CREATE POLICY "Users can view own payment plans" ON payment_plans FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_plans.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can insert own payment plans" ON payment_plans FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_plans.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can update own payment plans" ON payment_plans FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_plans.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can delete own payment plans" ON payment_plans FOR DELETE 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_plans.invoice_id AND invoices.user_id = auth.uid()));

-- Teams RLS
CREATE POLICY "Users can view teams they belong to" ON teams FOR SELECT 
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()));
CREATE POLICY "Users can insert own teams" ON teams FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Team owners can update teams" ON teams FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Team owners can delete teams" ON teams FOR DELETE USING (auth.uid() = owner_id);

-- Team Members RLS
CREATE POLICY "Team members can view team members" ON team_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND (teams.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()))));
CREATE POLICY "Team owners and admins can insert members" ON team_members FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "Team owners and admins can update members" ON team_members FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "Team owners and admins can delete members" ON team_members FOR DELETE 
  USING (EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));

-- Client Portal Tokens RLS (public read for token validation)
CREATE POLICY "Users can view own client portal tokens" ON client_portal_tokens FOR SELECT 
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_tokens.client_id AND clients.user_id = auth.uid()));
CREATE POLICY "Users can insert own client portal tokens" ON client_portal_tokens FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_tokens.client_id AND clients.user_id = auth.uid()));
CREATE POLICY "Users can delete own client portal tokens" ON client_portal_tokens FOR DELETE 
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_tokens.client_id AND clients.user_id = auth.uid()));

-- Expenses RLS
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_invoices_updated_at BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
