import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import { Address, QueryState } from '@spartacus/core';
import { EMPTY, Observable, of } from 'rxjs';
import createSpy = jasmine.createSpy;

const mockDeliveryAddress: Address = generateOneAddress();

export class MockCheckoutDeliveryAddressFacade implements Partial<CheckoutDeliveryAddressFacade> {
  getAddressVerificationResults = createSpy().and.returnValue(EMPTY);
  verifyAddress = createSpy();
  clearAddressVerificationResults = createSpy();

  getDeliveryAddressState(): Observable<QueryState<Address | undefined>> {
    return of({
      loading: false,
      data: mockDeliveryAddress,
      error: false
    });
  }
}

export class MockCheckoutDeliveryAddressService extends MockCheckoutDeliveryAddressFacade {
  constructor() {
    super();
  }
}