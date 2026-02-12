import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CheckoutComPaymentAdapter } from '@checkout-adapters/checkout-com-payment/checkout-com-payment.adapter';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutPaymentConnector } from '@spartacus/checkout/base/core';
import { Address } from '@spartacus/core';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComPaymentConnector extends CheckoutPaymentConnector {

  /**
   * Constructor for CheckoutComPaymentConnector.
   *
   * @param {CheckoutComPaymentAdapter} adapter - The adapter for Checkout.com payments.
   */
  constructor(
    protected override adapter: CheckoutComPaymentAdapter
  ) {
    super(adapter);
  }

  /**
   * Creates payment details for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be created.
   * @returns {Observable<CheckoutComPaymentDetails>} An observable that emits the created payment details.
   */
  public override createPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<CheckoutComPaymentDetails> {
    return this.adapter.createPaymentDetails(userId, cartId, paymentDetails);
  }

  /**
   * Updates payment details for the given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be updated.
   * @returns {Observable<HttpResponse<void>>} An observable that completes when the payment details are updated.
   * @since 2211.31.1
   */
  updatePaymentDetails(
    userId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<HttpResponse<void>> {
    return this.adapter.updatePaymentDetails(userId, paymentDetails);
  }

  /**
   * Sets the payment address for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {Address} address - The address to be set as the payment address.
   * @returns {Observable<Address>} An observable that emits the set address.
   */
  public setPaymentAddress(
    userId: string,
    cartId: string,
    address: Address
  ): Observable<Address> {
    return this.adapter.setPaymentAddress(userId, cartId, address);
  }
}
