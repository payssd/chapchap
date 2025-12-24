// Payment Provider Registry and Configuration

import { ProviderConfig } from './types';

export const PAYMENT_PROVIDERS: ProviderConfig[] = [
  // Payment Gateways
  {
    id: 'paystack',
    name: 'Paystack',
    type: 'gateway',
    logo: '/images/providers/paystack.svg',
    description: 'Accept payments via cards, bank transfers, and mobile money',
    countries: ['KE', 'NG', 'GH', 'ZA'],
    currencies: ['KES', 'NGN', 'GHS', 'ZAR', 'USD'],
    supported_methods: ['card', 'bank_transfer', 'mpesa', 'ussd'],
    credential_fields: [
      { key: 'public_key', label: 'Public Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
    ],
    docs_url: 'https://paystack.com/docs',
    signup_url: 'https://dashboard.paystack.com/#/signup',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    type: 'gateway',
    logo: '/images/providers/flutterwave.svg',
    description: 'Pan-African payment gateway with 30+ countries support',
    countries: ['KE', 'NG', 'GH', 'ZA', 'TZ', 'UG', 'RW'],
    currencies: ['KES', 'NGN', 'GHS', 'ZAR', 'TZS', 'UGX', 'USD'],
    supported_methods: ['card', 'bank_transfer', 'mpesa', 'ussd'],
    credential_fields: [
      { key: 'public_key', label: 'Public Key', type: 'text', placeholder: 'FLWPUBK_...', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'FLWSECK_...', required: true },
      { key: 'encryption_key', label: 'Encryption Key', type: 'password', required: true },
    ],
    docs_url: 'https://developer.flutterwave.com/docs',
    signup_url: 'https://dashboard.flutterwave.com/signup',
  },
  {
    id: 'pesapal',
    name: 'Pesapal',
    type: 'gateway',
    logo: '/images/providers/pesapal.svg',
    description: 'East African payment gateway with M-Pesa and card support',
    countries: ['KE', 'UG', 'TZ', 'RW', 'MW', 'ZM', 'ZW'],
    currencies: ['KES', 'UGX', 'TZS', 'USD'],
    supported_methods: ['card', 'mpesa', 'airtel', 'bank_transfer'],
    credential_fields: [
      { key: 'consumer_key', label: 'Consumer Key', type: 'text', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://developer.pesapal.com/how-to-integrate/api-30-json/api-reference',
    signup_url: 'https://www.pesapal.com/dashboard/account/register',
  },
  {
    id: 'dpo',
    name: 'DPO Group',
    type: 'gateway',
    logo: '/images/providers/dpo.svg',
    description: 'Payment gateway covering 40+ African countries',
    countries: ['KE', 'TZ', 'UG', 'ZA', 'GH', 'NG', 'ZM', 'ZW', 'MW', 'BW'],
    currencies: ['KES', 'TZS', 'UGX', 'ZAR', 'USD', 'GBP', 'EUR'],
    supported_methods: ['card', 'mpesa', 'bank_transfer'],
    credential_fields: [
      { key: 'company_token', label: 'Company Token', type: 'text', required: true },
      { key: 'service_type', label: 'Service Type', type: 'text', required: true, help_text: 'Your DPO service type ID' },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://directpay.online/developers/',
    signup_url: 'https://directpay.online/contact/',
  },
  
  // Mobile Money Direct Integrations
  {
    id: 'mpesa_kenya',
    name: 'M-Pesa Kenya (Daraja)',
    type: 'mobile_money',
    logo: '/images/providers/mpesa.svg',
    description: 'Direct M-Pesa integration via Safaricom Daraja API',
    countries: ['KE'],
    currencies: ['KES'],
    supported_methods: ['mpesa'],
    credential_fields: [
      { key: 'consumer_key', label: 'Consumer Key', type: 'text', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
      { key: 'passkey', label: 'Passkey', type: 'password', required: true, help_text: 'Lipa Na M-Pesa passkey' },
      { key: 'shortcode', label: 'Business Shortcode', type: 'text', required: true, help_text: 'Paybill or Till number' },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://developer.safaricom.co.ke/APIs',
    signup_url: 'https://developer.safaricom.co.ke/',
  },
  {
    id: 'mpesa_tanzania',
    name: 'M-Pesa Tanzania (Vodacom)',
    type: 'mobile_money',
    logo: '/images/providers/mpesa.svg',
    description: 'Direct M-Pesa integration via Vodacom Tanzania API',
    countries: ['TZ'],
    currencies: ['TZS'],
    supported_methods: ['mpesa'],
    credential_fields: [
      { key: 'api_key', label: 'API Key', type: 'text', required: true },
      { key: 'public_key', label: 'Public Key', type: 'password', required: true },
      { key: 'service_provider_code', label: 'Service Provider Code', type: 'text', required: true },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://openapiportal.m-pesa.com/',
    signup_url: 'https://openapiportal.m-pesa.com/',
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    type: 'mobile_money',
    logo: '/images/providers/airtel.svg',
    description: 'Direct Airtel Money integration across 14 African countries',
    countries: ['KE', 'UG', 'TZ', 'RW', 'ZM', 'MW', 'NG', 'GH', 'GA', 'NE', 'CD', 'TD', 'MG', 'SC'],
    currencies: ['KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'MWK', 'NGN', 'GHS', 'XAF', 'XOF', 'CDF', 'MGA', 'SCR'],
    supported_methods: ['airtel'],
    credential_fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://developers.airtel.africa/documentation',
    signup_url: 'https://developers.airtel.africa/',
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    logo: '/images/providers/mtn.svg',
    description: 'Direct MTN MoMo integration across 15+ African countries',
    countries: ['UG', 'GH', 'CI', 'CM', 'BJ', 'CG', 'GN', 'LR', 'RW', 'ZA', 'ZM', 'SZ'],
    currencies: ['UGX', 'GHS', 'XOF', 'XAF', 'GNF', 'LRD', 'RWF', 'ZAR', 'ZMW', 'SZL'],
    supported_methods: ['mtn'],
    credential_fields: [
      { key: 'subscription_key', label: 'Subscription Key', type: 'text', required: true },
      { key: 'api_user', label: 'API User', type: 'text', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://momodeveloper.mtn.com/api-documentation',
    signup_url: 'https://momodeveloper.mtn.com/',
  },
  {
    id: 'tigo_pesa',
    name: 'Tigo Pesa',
    type: 'mobile_money',
    logo: '/images/providers/tigo.svg',
    description: 'Direct Tigo Pesa integration for Tanzania',
    countries: ['TZ'],
    currencies: ['TZS'],
    supported_methods: ['mpesa'],
    credential_fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'biller_code', label: 'Biller Code', type: 'text', required: true },
      { 
        key: 'environment', 
        label: 'Environment', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'live', label: 'Live (Production)' },
        ]
      },
    ],
    docs_url: 'https://tigo.co.tz/business/tigo-pesa',
    signup_url: 'https://tigo.co.tz/business/tigo-pesa',
  },
];

// Helper functions
export function getProviderConfig(providerId: string): ProviderConfig | undefined {
  return PAYMENT_PROVIDERS.find(p => p.id === providerId);
}

export function getGatewayProviders(): ProviderConfig[] {
  return PAYMENT_PROVIDERS.filter(p => p.type === 'gateway');
}

export function getMobileMoneyProviders(): ProviderConfig[] {
  return PAYMENT_PROVIDERS.filter(p => p.type === 'mobile_money');
}

export function getProvidersByCountry(countryCode: string): ProviderConfig[] {
  return PAYMENT_PROVIDERS.filter(p => p.countries.includes(countryCode));
}

export function getProvidersByCurrency(currency: string): ProviderConfig[] {
  return PAYMENT_PROVIDERS.filter(p => p.currencies.includes(currency));
}
