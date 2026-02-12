import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { Address } from '@spartacus/core';
import { Observable, of } from 'rxjs';

const address = generateOneAddress();
const environment = 'sandbox';
const merchantKey = 'merchantKey';
const isABCState = {
  loading: false,
  data: false,
  error: false
};

export class MockCheckoutComConnector implements Partial<CheckoutComConnector> {
  getMerchantKey(userId: string): Observable<string> {
    return of(JSON.stringify({
      merchantKey,
      environment
    }));
  }

  getIsABC(userId: string): Observable<boolean> {
    return of(isABCState.data);
  }

  requestBillingAddress(userId: string, cartId: string): Observable<Address> {
    return of(address);
  }

  setDeliveryAddressAsBillingAddress(userId: string, cartId: string, addressId: string): Observable<Address> {
    return of(address);
  }
}