import { HttpResponse } from '@angular/common/http';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutPaymentAdapter } from '@spartacus/checkout/base/core';
import { Address, PaymentDetails } from '@spartacus/core';
import { Observable } from 'rxjs';

export abstract class CheckoutComPaymentAdapter extends CheckoutPaymentAdapter {
  /**
   * Creates the payment details for the given cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be created.
   * @returns {Observable<PaymentDetails>} An observable that emits the created payment details.
   * @since 2211.31.1
   */
  abstract override createPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<PaymentDetails>;

  /**
   * Updates the payment details for the given cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be updated.
   * @returns {Observable<HttpResponse<void>>} An observable that emits the updated payment details.
   * @since 2211.31.1
   */
  abstract updatePaymentDetails(
    userId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<HttpResponse<void>>;

  /**
   * Abstract method used to set the payment address on the cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {Address} address - The payment address to be set.
   * @returns {Observable<Address>} An observable that emits the set address.
   * @since 2211.31.1
   */
  abstract setPaymentAddress(
    userId: string,
    cartId: string,
    address: Address
  ): Observable<Address>;

}
