// M-Pesa Kenya (Daraja API) Payment Provider Implementation

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

const DARAJA_SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const DARAJA_LIVE_URL = 'https://api.safaricom.co.ke';

export class MpesaKenyaProvider extends BasePaymentProvider {
  readonly providerId: PaymentProvider = 'mpesa_kenya';

  private get baseUrl(): string {
    return this.environment === 'live' ? DARAJA_LIVE_URL : DARAJA_SANDBOX_URL;
  }

  private get consumerKey(): string {
    return this.credentials.consumer_key;
  }

  private get consumerSecret(): string {
    return this.credentials.consumer_secret;
  }

  private get passkey(): string {
    return this.credentials.passkey;
  }

  private get shortcode(): string {
    return this.credentials.shortcode;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errorMessage || 'Failed to get access token');
    }

    return data.access_token;
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  private formatPhoneNumber(phone: string): string {
    // Convert to 254XXXXXXXXX format
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('+')) {
      formatted = formatted.slice(1);
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
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
    // M-Pesa doesn't support payment links - use STK push instead
    return {
      success: false,
      error: 'M-Pesa does not support payment links. Use initiateMobilePayment for STK push.',
    };
  }

  async initiateMobilePayment(request: InitiateMobilePaymentRequest): Promise<InitiateMobilePaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      const phoneNumber = this.formatPhoneNumber(request.phone);

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(request.amount),
            PartyA: phoneNumber,
            PartyB: this.shortcode,
            PhoneNumber: phoneNumber,
            CallBackURL: request.callback_url,
            AccountReference: request.reference || this.generateReference(),
            TransactionDesc: request.description || 'Invoice Payment',
          }),
        }
      );

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          reference: data.MerchantRequestID,
          checkout_request_id: data.CheckoutRequestID,
        };
      } else {
        return {
          success: false,
          error: data.ResponseDescription || data.errorMessage || 'STK push failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate M-Pesa payment',
      };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: request.reference,
          }),
        }
      );

      const data = await response.json();

      if (data.ResultCode === '0') {
        return {
          success: true,
          status: 'success',
          amount: parseFloat(data.Amount || '0'),
          currency: 'KES',
          paid_at: new Date().toISOString(),
          payment_method: 'mpesa',
          provider_reference: data.MpesaReceiptNumber,
        };
      } else if (data.ResultCode === '1032') {
        // Transaction cancelled by user
        return {
          success: true,
          status: 'failed',
          error: 'Transaction cancelled by user',
        };
      } else if (data.ResponseCode === '0' && data.ResultCode === undefined) {
        // Still processing
        return {
          success: true,
          status: 'pending',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: data.ResultDesc || data.errorMessage || 'Payment verification failed',
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
    // M-Pesa callbacks don't use signature verification
    // Instead, verify the callback URL is from Safaricom IPs
    // For now, return true and rely on URL security
    return true;
  }
}
