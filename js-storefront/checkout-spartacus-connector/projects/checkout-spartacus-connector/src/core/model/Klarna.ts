import { HttpErrorResponse } from '@angular/common/http';

export interface KlarnaInitParams {
  clientToken?: string;
  paymentContext?: string;
  instanceId?: string;
  success?: boolean;
  httpError?: HttpErrorResponse;
}

export enum KlarnaPaymentMethodCategory {
  payNow = 'pay_now',
  payLater = 'pay_later',
  payOverTime = 'pay_over_time',
}


export interface KlarnaLoadError {
  invalid_fields?: string[];
}

export interface KlarnaLoadResponse {
  show_form?: boolean;
  error?: KlarnaLoadError;
}

export interface KlarnaAuthResponse {
  authorization_token?: string;
  payment_context?: string;
  show_form?: boolean;
  approved?: boolean;
  finalize_required?: boolean;
  error?: KlarnaLoadError;
}

export interface KlarnaAddress {
  given_name?: string;
  family_name?: string;
  email?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  country?: string;
}
