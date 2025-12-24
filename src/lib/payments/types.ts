// Payment Integration Types

export type IntegrationType = 'gateway' | 'mobile_money';

export type GatewayProvider = 'paystack' | 'flutterwave' | 'pesapal' | 'dpo';

export type MobileMoneyProvider = 
  | 'mpesa_kenya' 
  | 'mpesa_tanzania' 
  | 'airtel_money' 
  | 'mtn_momo' 
  | 'tigo_pesa';

export type PaymentProvider = GatewayProvider | MobileMoneyProvider;

export type PaymentMethod = 'card' | 'mpesa' | 'airtel' | 'mtn' | 'bank_transfer' | 'ussd';

export type VerificationStatus = 'pending' | 'verified' | 'failed';

export interface PaymentIntegration {
  id: string;
  user_id: string;
  integration_type: IntegrationType;
  provider: PaymentProvider;
  display_name: string | null;
  credentials: Record<string, string>;
  is_active: boolean;
  is_default: boolean;
  supported_currencies: string[];
  supported_methods: PaymentMethod[];
  webhook_url: string | null;
  last_verified_at: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

// Provider-specific credential types
export interface PaystackCredentials {
  public_key: string;
  secret_key: string;
}

export interface FlutterwaveCredentials {
  public_key: string;
  secret_key: string;
  encryption_key: string;
}

export interface PesapalCredentials {
  consumer_key: string;
  consumer_secret: string;
  environment: 'sandbox' | 'live';
}

export interface DPOCredentials {
  company_token: string;
  service_type: string;
  environment: 'sandbox' | 'live';
}

export interface MpesaKenyaCredentials {
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  shortcode: string;
  environment: 'sandbox' | 'live';
}

export interface AirtelMoneyCredentials {
  client_id: string;
  client_secret: string;
  environment: 'sandbox' | 'live';
}

export interface MTNMomoCredentials {
  subscription_key: string;
  api_user: string;
  api_key: string;
  environment: 'sandbox' | 'live';
}

// Payment request/response types
export interface CreatePaymentLinkRequest {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  reference: string;
  description?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  payment_link?: string;
  reference?: string;
  error?: string;
}

export interface InitiateMobilePaymentRequest {
  amount: number;
  currency: string;
  phone: string;
  reference: string;
  description?: string;
  callback_url?: string;
}

export interface InitiateMobilePaymentResponse {
  success: boolean;
  reference?: string;
  checkout_request_id?: string;
  error?: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: 'success' | 'pending' | 'failed';
  amount?: number;
  currency?: string;
  paid_at?: string;
  payment_method?: PaymentMethod;
  provider_reference?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  event: string;
  data: Record<string, unknown>;
  signature?: string;
}

// Provider configuration
export interface ProviderConfig {
  id: PaymentProvider;
  name: string;
  type: IntegrationType;
  logo: string;
  description: string;
  countries: string[];
  currencies: string[];
  supported_methods: PaymentMethod[];
  credential_fields: CredentialField[];
  docs_url: string;
  signup_url: string;
}

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  help_text?: string;
}
