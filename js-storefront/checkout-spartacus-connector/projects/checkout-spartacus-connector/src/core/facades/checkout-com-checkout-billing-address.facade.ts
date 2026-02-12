import { Injectable } from '@angular/core';
import { CheckoutBillingAddressFacade } from '@spartacus/checkout/base/root';
import { Address, facadeFactory, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_CHECKOUT_BILLING_ADDRESS } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComCheckoutBillingAddressFacade =>
    facadeFactory({
      facade: CheckoutComCheckoutBillingAddressFacade,
      feature: CHECKOUT_COM_CHECKOUT_BILLING_ADDRESS,
      methods: [
        'setBillingAddress',
        'requestBillingAddress',
        'updateBillingAddress',
        'setDeliveryAddressAsBillingAddress'
      ]
    })
})
export abstract class CheckoutComCheckoutBillingAddressFacade extends CheckoutBillingAddressFacade {
  /**
   * Updates the billing address with the provided address.
   *
   * @param {Address} address - The new billing address to be updated.
   * @returns {Observable<Address>} An observable that emits the updated billing address.
   * @since 2211.32.1
   */
  abstract updateBillingAddress(address: Address): Observable<Address>;

  /**
   * Retrieves the billing address state.
   *
   * @returns {Observable<QueryState<Address | undefined>>} An observable that emits the billing address
   * or undefined if no billing address is set.
   * @since 2211.32.1
   */
  abstract requestBillingAddress(): Observable<QueryState<Address | undefined>>;

  /**
   * Sets the delivery address as the billing address.
   *
   * @param {Address | undefined} address - The address to set as the billing address.
   * @since 2211.32.1
   */
  abstract setDeliveryAddressAsBillingAddress(address: Address): void;
}
