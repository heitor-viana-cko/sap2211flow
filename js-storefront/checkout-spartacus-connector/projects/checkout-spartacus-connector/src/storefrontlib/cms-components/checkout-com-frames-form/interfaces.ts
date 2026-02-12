/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FramesLocalization {
  cardNumberPlaceholder?: string;
  expiryMonthPlaceholder?: string;
  expiryYearPlaceholder?: string;
  cvvPlaceholder?: string;
}

export type FramesLanguages =
  'EN-GB'
  | 'ES-ES'
  | 'FR-FR'
  | 'DE-DE'
  | 'KR-KR'
  | 'IT-IT'
  | 'NL-NL';

export type PaymentMethod =
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Diners Club'
  | 'Maestro'
  | 'Discover';

export type Scheme =
  | 'Visa'
  | 'Mastercard'
  | 'AMERICAN EXPRESS'
  | 'Diners Club International'
  | 'Maestro'
  | 'Discover';

export type CardType =
  'Credit'
  | 'Debit'
  | 'Prepaid'
  | 'Charge';
export type CardCategory =
  'Consumer'
  | 'Commercial';

export type FramesModes =
  | 'RIGHT_TO_LEFT'
  | 'CVV_OPTIONAL'
  | 'CVV_HIDDEN'
  | 'DISABLE_COPY_PASTE';

export interface FramesBillingAddress {
  addressLine1?: string;
  addressLine2?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface GatewayBillingAddress {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface GatewayPhone {
  number?: string;
}

export interface FramesCardholder {
  name?: string | null;
  billingAddress?: FramesBillingAddress | null;
  phone?: string | null;
}

export interface FramesStyle {
  base?: any;
  valid?: any;
  invalid?: any;
  focus?: any;
  autofill?: any;
  hover?: any;
  placeholder?: {
    base?: any;
    valid?: any;
    invalid?: any;
    focus?: any;
  };
}

export enum FrameElementIdentifier {
  CardNumber = 'card-number',
  ExpiryDate = 'expiry-date',
  Cvv = 'cvv'
}

export interface FrameElement {
  element?: FrameElementIdentifier;
}

export interface FramesElementsValidity {
  cardNumber?: boolean;
  expiryDate?: boolean;
  cvv?: boolean;
}

export interface FrameCardValidationChangedEvent {
  isValid?: boolean;
  isElementValid?: FramesElementsValidity;
}

export interface FrameValidationChangedEvent {
  element?: FrameElementIdentifier;
  isValid?: boolean;
  isEmpty?: boolean;
}

export interface FramePaymentMethodChangedEvent {
  isValid?: boolean;
  paymentMethod?: PaymentMethod;
}

export interface FrameCardTokenizedEvent {
  billing_address?: GatewayBillingAddress;
  bin?: string;
  card_category?: CardCategory;
  card_type?: CardType;
  expires_on?: string;
  expiry_month?: string;
  expiry_year?: string;
  issuer?: string;
  issuer_country?: string;
  last4?: string;
  name?: string;
  phone?: GatewayPhone;
  preferred_scheme?: string;
  product_id?: string;
  product_type?: string;
  scheme?: Scheme;
  token?: string;
  type?: string;
}

export interface FrameCardTokenizationFailedEvent {
  errorCode?: string;
  message?: string;
}

export interface FrameCardBindChangedEvent {
  bin?: string;
  isCoBadged?: boolean;
  scheme?: string;
}

export interface FramesConfig {
  publicKey?: string;
  debug?: boolean;
  style?: FramesStyle;
  cardholder?: FramesCardholder;
  localization?: FramesLanguages | FramesLocalization;

  ///   Events   ///

  // Triggered when Frames is registered on the global namespace and safe to use.
  ready?: () => void;

  // Triggered when the form is rendered.
  frameActivated?: (e: FrameElement) => void;

  // Triggered when an input field receives focus. Use it to check the validation status and apply the wanted UI changes.
  frameFocus?: (e: FrameElement) => void;

  // Triggered after an input field loses focus. Use it to check the validation status and apply the wanted UI changes.
  frameBlur?: (e: FrameElement) => void;

  // Triggered when a field's validation status has changed. Use it to show error messages or update the UI.
  frameValidationChanged?: (e: FrameValidationChangedEvent) => void;

  // Triggered when a valid payment method is detected based on the card number being entered. Use this event to change the card icon.
  paymentMethodChanged?: (e: FramePaymentMethodChangedEvent) => void;

  // Triggered when the state of the card validation changes.
  cardValidationChanged?: (e: FrameCardValidationChangedEvent) => void;

  // Triggered when the card form has been submitted.
  cardSubmitted?: () => void;

  // Triggered after a card is tokenized.
  cardTokenized?: (e: FrameCardTokenizedEvent) => void;

  // Triggered if the card tokenization fails.
  cardTokenizationFailed?: (e: FrameCardTokenizationFailedEvent) => void;

  cardBinChanged?: (e: FrameCardBindChangedEvent) => void;

  schemeChoice?: boolean;

  modes?: Array<FramesModes>;
}
