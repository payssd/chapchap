// Payment Providers Index - Factory for creating provider instances

import { PaymentProvider } from '../types';
import { IPaymentProvider } from '../base-provider';
import { PaystackProvider } from './paystack';
import { FlutterwaveProvider } from './flutterwave';
import { MpesaKenyaProvider } from './mpesa-kenya';
import { AirtelMoneyProvider } from './airtel-money';

export { PaystackProvider } from './paystack';
export { FlutterwaveProvider } from './flutterwave';
export { MpesaKenyaProvider } from './mpesa-kenya';
export { AirtelMoneyProvider } from './airtel-money';

type ProviderConstructor = new (credentials: Record<string, string>) => IPaymentProvider;

const providerMap: Record<PaymentProvider, ProviderConstructor> = {
  paystack: PaystackProvider,
  flutterwave: FlutterwaveProvider,
  mpesa_kenya: MpesaKenyaProvider,
  mpesa_tanzania: MpesaKenyaProvider, // TODO: Create separate provider
  airtel_money: AirtelMoneyProvider,
  mtn_momo: AirtelMoneyProvider, // TODO: Create MTN MoMo provider
  tigo_pesa: AirtelMoneyProvider, // TODO: Create Tigo Pesa provider
  pesapal: PaystackProvider, // TODO: Create Pesapal provider
  dpo: PaystackProvider, // TODO: Create DPO provider
};

export function createPaymentProvider(
  providerId: PaymentProvider,
  credentials: Record<string, string>
): IPaymentProvider {
  const ProviderClass = providerMap[providerId];
  
  if (!ProviderClass) {
    throw new Error(`Unknown payment provider: ${providerId}`);
  }

  return new ProviderClass(credentials);
}

export function isProviderSupported(providerId: string): providerId is PaymentProvider {
  return providerId in providerMap;
}
