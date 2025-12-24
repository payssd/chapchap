// Base Payment Provider Interface

import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  InitiateMobilePaymentRequest,
  InitiateMobilePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentProvider,
} from './types';

export interface IPaymentProvider {
  readonly providerId: PaymentProvider;
  
  // Verify credentials are valid
  verifyCredentials(): Promise<boolean>;
  
  // Create a payment link (for gateways)
  createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse>;
  
  // Initiate mobile money payment (STK push, USSD prompt, etc.)
  initiateMobilePayment(request: InitiateMobilePaymentRequest): Promise<InitiateMobilePaymentResponse>;
  
  // Verify payment status
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  
  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export abstract class BasePaymentProvider implements IPaymentProvider {
  abstract readonly providerId: PaymentProvider;
  protected credentials: Record<string, string>;
  protected environment: 'sandbox' | 'live';

  constructor(credentials: Record<string, string>) {
    this.credentials = credentials;
    this.environment = (credentials.environment as 'sandbox' | 'live') || 'sandbox';
  }

  abstract verifyCredentials(): Promise<boolean>;
  
  abstract createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse>;
  
  abstract initiateMobilePayment(request: InitiateMobilePaymentRequest): Promise<InitiateMobilePaymentResponse>;
  
  abstract verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  
  abstract verifyWebhookSignature(payload: string, signature: string): boolean;

  protected generateReference(): string {
    return `CC_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
