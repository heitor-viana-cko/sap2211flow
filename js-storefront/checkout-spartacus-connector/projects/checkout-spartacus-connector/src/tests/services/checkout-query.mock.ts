import { CheckoutQueryFacade, CheckoutState } from '@spartacus/checkout/base/root';
import { QueryState } from '@spartacus/core';
import { Observable, of } from 'rxjs';

export class MockCheckoutQueryFacade implements Partial<CheckoutQueryFacade> {
  getCheckoutDetailsState(): Observable<QueryState<CheckoutState>> {
    return of({
      loading: false,
      error: false,
      data: undefined
    });
  }
}