import { inject, Injectable } from '@angular/core';
import { CheckoutComCheckoutBillingAddressAdapter } from '@checkout-adapters/checkout-com-billing-address/checkout-com-checkout-billing-address.adapter';
import { Address } from '@spartacus/core';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComCheckoutBillingAddressConnector {
  protected adapter: CheckoutComCheckoutBillingAddressAdapter = inject(CheckoutComCheckoutBillingAddressAdapter);

  /**
   * Requests the billing address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<Address>} An observable that emits the requested billing address.
   */
  public requestBillingAddress(userId: string, cartId: string): Observable<Address> {
    return this.adapter.requestBillingAddress(userId, cartId);
  }

  /*
   * Updates the delivery address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} address - The ID of the address to update.
   * @returns {Observable<Address>} An observable that emits the updated delivery address.
   */
  public setDeliveryAddressAsBillingAddress(userId: string, cartId: string, address: Address): Observable<Address> {
    return this.adapter.setDeliveryAddressAsBillingAddress(userId, cartId, address);
  }
}
