import { CheckoutBillingAddressAdapter } from '@spartacus/checkout/base/core';
import { Address } from '@spartacus/core';
import { Observable } from 'rxjs';

export abstract class CheckoutComCheckoutBillingAddressAdapter extends CheckoutBillingAddressAdapter {
  /**
   * Abstract method used to set address for billing
   *
   * @param userId
   * @param cartId
   * @since 2211.32.1
   */
  abstract requestBillingAddress(
    userId: string,
    cartId: string
  ): Observable<Address>;

  /*
   * Sets the delivery address as the billing address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} addressId - The ID of the delivery address to set as the billing address.
   * @returns {Observable<Address>} An observable that emits the updated billing address.
   * @since 2211.31.1
   */
  abstract setDeliveryAddressAsBillingAddress(
    userId: string,
    cartId: string,
    address: Address
  ): Observable<Address>;
}
