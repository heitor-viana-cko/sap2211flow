import { OrderAdapter } from '@spartacus/order/core';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';

export abstract class CheckoutComOrderAdapter extends OrderAdapter {

  /**
 * Place order. Might return a redirect.
 *
 * @param userId - The ID of the user.
 * @param cartId - The ID of the cart.
 * @param termsChecked - Indicates if the terms and conditions are checked. Needs validation in backend.
 * @returns An Observable that emits the placed order.
   * @since 2211.31.1
 */
abstract override placeOrder(userId: string, cartId: string, termsChecked: boolean): Observable<Order>;

/**
 * Authorize place order after redirect.
 *
 * @param userId - The ID of the current user.
 * @param cartId - The ID of the current cart.
 * @param sessionId - The checkout.com session ID.
 * @returns An Observable that emits the authorized order.
 * @since 2211.31.1
 */
abstract authorizeRedirectPlaceOrder(userId: string, cartId: string, sessionId: string): Observable<Order>;
}
