import { Order } from '@spartacus/order/root';

export interface ApplePayPaymentRequest {
  currencyCode?: string;
  countryCode?: string;
  supportedNetworks?: string[];
  merchantCapabilities?: string[];
  total?: {
    type?: string;
    label?: string;
    amount?: string;
  };
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
}

export interface ApplePayAuthorization {
  status?: string;
  orderData?: Order;
}

export interface ApplePayPaymentMethod {
  displayName?: string;
  network?: string;
  type?: string;
  billingContact?: ApplePayPaymentContact;
}

export enum ApplePayPaymentType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  PREPAID = 'prepaid',
  STORE = 'store',
}

export interface ApplePayPaymentContact {
  phoneNumber?: string;
  emailAddress?: string;
  givenName?: string;
  familyName?: string;
  phoneticGivenName?: string;
  phoneticFamilyName?: string;
  addressLines?: string[];
  subLocality?: string;
  locality?: string;
  postalCode?: string;
  subAdministrativeArea?: string;
  administrativeArea?: string;
  country?: string;
  countryCode?: string;
}

export interface ApplePayShippingMethod {
  label?: string;
  detail?: string;
  identifier?: string;
  amount?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dateComponentsRange?: any;
}

export interface ApplePayShippingContactUpdate {
  newTotal?: ApplePayLineItem;
  newLineItems?: ApplePayLineItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
  newShippingMethods?: ApplePayShippingMethod[];
}

export interface ApplePayShippingMethodUpdate {
  newTotal?: ApplePayLineItem;
  newLineItems?: ApplePayLineItem[];
}

export interface ApplePayLineItem {
  type?: string;
  label?: string;
  amount?: string;
}

export interface ApplepaySession {
  applePayPaymentRequest?: ApplePayPaymentRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applePayMerchantSession?: any;
  applePayAuthorization?: ApplePayAuthorization;
  applePayShippingContactUpdate?: ApplePayShippingContactUpdate;
  applePayShippingMethodUpdate?: ApplePayShippingMethodUpdate;
}