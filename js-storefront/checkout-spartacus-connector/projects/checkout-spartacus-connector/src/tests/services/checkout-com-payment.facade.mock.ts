import { HttpResponse } from '@angular/common/http';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { Address, CardType, PaymentDetails, QueryState } from '@spartacus/core';
import { Observable, of } from 'rxjs';

const merchantKey = 'merchantKey';
const environment = 'sandbox';
const isABCState = {
  loading: false,
  data: false,
  error: false
};
const address = {
  id: 'b9679f0b-5e53-49c1-9f24-7ed57a8cf3a3',
  title: 'Miss',
  titleCode: 'Mr.',
  email: 'Heath61@hotmail.com',
  firstName: 'Polly',
  lastName: 'Dibbert',
  companyName: 'Turcotte - Pfannerstill',
  line1: '2639 Marcelo Street',
  line2: 'Suite 219',
  postalCode: '66491-6807',
  town: 'Racine',
  country: {
    isocode: 'US',
    name: 'United States'
  },
  region:
    {
      isocode: 'IL',
      name: 'Kentucky',
      isocodeShort: 'NH'
    },
  cellphone: '417-437-0050 x77699',
  defaultAddress: false,
  shippingAddress: true,
  formattedAddress: '2639 Marcelo Street Suite 219, Racine, Brazil, 66491-6807',
  visibleInAddressBook: true
};
const cardTypes: CardType[] = [{
  code: 'visa',
  name: 'Visa'
}];
export const checkoutComMockPaymentDetails = {
  id: '0001',
  accountHolderName: 'John Doe',
  cardNumber: '123456789',
  cardType: {
    code: 'Visa',
    name: 'Visa'
  },
  expiryMonth: '01',
  expiryYear: '2022',
  cvn: '123',
  billingAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: '2343 test address',
    town: 'Montreal',
    region: {
      isocode: 'QC'
    },
    country: {
      isocode: 'CAN'
    },
    postalCode: 'H2N 1E3'
  }
};

export class MockCheckoutComPaymentFacade implements CheckoutComPaymentFacade {
  canSaveCard(userId: string): boolean {
    return false;
  }

  createPaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<PaymentDetails> {
    return undefined;
  }

  getIsABC(): Observable<QueryState<boolean>> {
    return of(isABCState as QueryState<boolean>);
  }

  getIsABCFromState(): Observable<boolean> {
    return of(isABCState.data);
  }

  getOccMerchantKeyFromState(): Observable<string> {
    return of(merchantKey);
  }

  getPaymentAddressFromState(): Observable<Address> {
    return of(address);
  }

  getPaymentCardTypes(): Observable<CardType[]> {
    return of(cardTypes);
  }

  getPaymentCardTypesState(): Observable<QueryState<CardType[] | undefined>> {
    return of({
      loading: false,
      data: cardTypes,
      error: false
    });
  }

  getPaymentDetailsFromState(): Observable<PaymentDetails> {
    return of(checkoutComMockPaymentDetails);
  }

  getPaymentDetailsState(): Observable<QueryState<PaymentDetails | undefined>> {
    return of({
      loading: false,
      data: checkoutComMockPaymentDetails,
      error: false
    });
  }

  requestOccMerchantConfiguration(userId: string): Observable<string> {
    return of(JSON.stringify({
      merchantKey,
      environment
    }));
  }

  setPaymentAddress(address: Address, userId: string, cartId: string): void {
  }

  setPaymentDetails(checkoutComMockPaymentDetails: PaymentDetails): Observable<unknown> {
    return of({});
  }

  updatePaymentAddress(address: Address): Observable<Address> {
    return of(address);
  }

  updatePaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<HttpResponse<void>> {
    return of({} as HttpResponse<void>);
  }

  getPaymentDetails(): Observable<PaymentDetails> {
    return of(checkoutComMockPaymentDetails);
  }

  paymentProcessSuccess() {
  }
}