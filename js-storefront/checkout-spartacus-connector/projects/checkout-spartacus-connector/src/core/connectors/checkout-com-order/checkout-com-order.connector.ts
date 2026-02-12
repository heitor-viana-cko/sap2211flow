import { Injectable } from '@angular/core';
import { CheckoutComOrderAdapter } from '@checkout-adapters/checkout-com-order/checkout-com-order.adapter';
import { OrderConnector } from '@spartacus/order/core';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComOrderConnector extends OrderConnector {

  /**
   * Constructor for CheckoutComOrderConnector.
   *
   * @param {CheckoutComOrderAdapter} adapter - The adapter for Checkout.com orders.
   */
  constructor(
    protected override adapter: CheckoutComOrderAdapter
  ) {
    super(adapter);
  }

  /**
   * Places an order for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {boolean} termsChecked - Whether the terms and conditions are checked.
   * @returns {Observable<Order>} An observable that emits the order.
   */
  override placeOrder(
    userId: string,
    cartId: string,
    termsChecked: boolean
  ): Observable<Order> {
    return this.adapter.placeOrder(userId, cartId, termsChecked);
  }

  /**
   * Authorizes the redirect place order for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} sessionId - The session ID.
   * @returns {Observable<Order>} An observable that emits the order.
   */
  authorizeRedirectPlaceOrder(userId: string, cartId: string, sessionId: string): Observable<Order> {
    return this.adapter.authorizeRedirectPlaceOrder(userId, cartId, sessionId);
  }
}
