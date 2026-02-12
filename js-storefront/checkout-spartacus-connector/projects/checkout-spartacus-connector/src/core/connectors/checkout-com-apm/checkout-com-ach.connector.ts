import { Injectable } from '@angular/core';
import { CheckoutComAchAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-ach.adapter';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComAchConnector {
  /**
   * Constructor for the CheckoutComAchConnector class.
   *
   * @param {CheckoutComApmAdapter} adapter - The adapter used for payment operations.
   * @since 2211.31.1
   */
  constructor(
    protected adapter: CheckoutComAchAdapter
  ) {
  }

  /**
   * Get AchLink Token for the given cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<string>} An observable that emits the created APM payment details.
   * @since 2211.31.1
   */
  public getAchLinkToken(
    userId: string,
    cartId: string,
  ): Observable<string> {
    return this.adapter.getAchLinkToken(userId, cartId);
  }

  /**
   * Sets the ACH order success details.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} publicToken - The public token for the ACH transaction.
   * @param {AchSuccessMetadata} metadata - The metadata for the ACH success.
   * @param {boolean} customerConsents - Indicates if the customer consents to the transaction.
   * @returns {Observable<Order>} An observable that emits the order details.
   * @since 2211.31.1
   */
  setAchOrderSuccess(
    userId: string,
    cartId: string,
    publicToken: string,
    metadata: AchSuccessMetadata,
    customerConsents: boolean,
  ): Observable<Order> {
    return this.adapter.setAchOrderSuccess(userId, cartId, publicToken, metadata, customerConsents);
  }
}
