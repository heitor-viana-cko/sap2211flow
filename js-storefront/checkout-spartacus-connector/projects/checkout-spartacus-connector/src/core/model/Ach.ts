import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorModel } from '@spartacus/core';
import { Order } from '@spartacus/order/root';

export interface AchLinkToken {
  SERIALIZED_NAME_LINK_TOKEN?: string;
  SERIALIZED_NAME_EXPIRATION?: string;
  SERIALIZED_NAME_REQUEST_ID?: string;
  expiration?: string;
  linkToken?: string;
  requestId?: string;
  httpError?: HttpErrorResponse;
  success?: boolean;
}

export interface AchSuccessPopup {
  public_token?: string;
  metadata?: AchSuccessMetadata;
}

export interface AchSuccessMetadata {
  status?: string;
  link_session_id?: string;
  institution?: InstitutionMeta;
  accounts?: AccountMeta[];
  account?: AccountMeta;
  account_id?: string;
  transfer_status?: string;
  public_token?: string;
}

export interface InstitutionMeta {
  name?: string;
  institution_id?: string;
}

export interface AccountMeta {
  id?: string;
  name?: string;
  mask?: string;
  type?: string;
  subtype?: string;
  verification_status?: string;
  class_type?: string;
}

export interface AchSuccessOrder {
  order?: Order,
  error?: HttpErrorModel
}

