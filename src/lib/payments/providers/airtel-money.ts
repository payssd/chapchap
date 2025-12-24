// Airtel Money Payment Provider Implementation

import { BasePaymentProvider } from '../base-provider';
import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  InitiateMobilePaymentRequest,
  InitiateMobilePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentProvider,
} from '../types';

const AIRTEL_SANDBOX_URL = 'https://openapiuat.airtel.africa';
const AIRTEL_LIVE_URL = 'https://openapi.airtel.africa';

export class AirtelMoneyProvider extends BasePaymentProvider {
  readonly providerId: PaymentProvider = 'airtel_money';

  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private get baseUrl(): string {
    return this.environment === 'live' ? AIRTEL_LIVE_URL : AIRTEL_SANDBOX_URL;
  }

  private get clientId(): string {
    return this.credentials.client_id;
  }

  private get clientSecret(): string {
    return this.credentials.client_secret;
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to get access token');
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

    return this.accessToken;
  }

  private formatPhoneNumber(phone: string, countryCode: string = 'KE'): string {
    // Remove non-digits
    let formatted = phone.replace(/\D/g, '');
    
    // Country code mapping
    const countryCodes: Record<string, string> = {
      'KE': '254',
      'UG': '256',
      'TZ': '255',
      'RW': '250',
      'ZM': '260',
      'MW': '265',
      'NG': '234',
      'GH': '233',
    };

    const code = countryCodes[countryCode] || '254';

    if (formatted.startsWith('0')) {
      formatted = code + formatted.slice(1);
    } else if (!formatted.startsWith(code)) {
      formatted = code + formatted;
    }

    return formatted;
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  async createPaymentLink(_request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return {
      success: false,
      error: 'Airtel Money does not support payment links. Use initiateMobilePayment instead.',
    };
  }

  async initiateMobilePayment(request: InitiateMobilePaymentRequest): Promise<InitiateMobilePaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const reference = request.reference || this.generateReference();
      const phoneNumber = this.formatPhoneNumber(request.phone);

      const response = await fetch(
        `${this.baseUrl}/merchant/v1/payments/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Country': 'KE', // Should be dynamic based on phone number
            'X-Currency': request.currency,
          },
          body: JSON.stringify({
            reference: reference,
            subscriber: {
              country: 'KE',
              currency: request.currency,
              msisdn: phoneNumber,
            },
            transaction: {
              amount: request.amount,
              country: 'KE',
              currency: request.currency,
              id: reference,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.status?.success || data.data?.transaction?.status === 'TS') {
        return {
          success: true,
          reference: reference,
          checkout_request_id: data.data?.transaction?.id,
        };
      } else {
        return {
          success: false,
          error: data.status?.message || 'Failed to initiate Airtel Money payment',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate Airtel Money payment',
      };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/standard/v1/payments/${request.reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Country': 'KE',
            'X-Currency': 'KES',
          },
        }
      );

      const data = await response.json();

      if (data.status?.success) {
        const txStatus = data.data?.transaction?.status;
        const paymentStatus = txStatus === 'TS' ? 'success' 
          : txStatus === 'TIP' ? 'pending' 
          : 'failed';

        return {
          success: true,
          status: paymentStatus,
          amount: parseFloat(data.data?.transaction?.amount || '0'),
          currency: data.data?.transaction?.currency || 'KES',
          paid_at: new Date().toISOString(),
          payment_method: 'airtel',
          provider_reference: data.data?.transaction?.airtel_money_id,
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: data.status?.message || 'Payment verification failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // Airtel Money uses callback URL security
    return true;
  }
}
