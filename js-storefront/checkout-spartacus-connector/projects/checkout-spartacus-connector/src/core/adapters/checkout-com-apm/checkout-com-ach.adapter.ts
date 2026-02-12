import { AchSuccessMetadata } from '@checkout-model/Ach';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';

export abstract class CheckoutComAchAdapter {
  /**
   * Create the APM Payment Details.
   *
   * @param {string} userId - The ID of the current user.
   * @param {string} cartId - The ID of the current cart.
   * @returns {Observable<PaymentDetails>} An observable that emits the payment details.
   * @since 2211.31.1
   */
  abstract getAchLinkToken(
    userId: string,
    cartId: string,
  ): Observable<string>;

  /**
   * Retrieves the ACH (Automated Clearing House) order success details.
   *
   * @param {string} userId - The ID of the current user.
   * @param {string} cartId - The ID of the current cart.
   * @param {string} publicToken - The public token for the ACH transaction.
   * @param {AchSuccessMetadata} metadata - The metadata for the ACH success.
   * @param {boolean} customerConsents - Indicates whether the customer has given consent.
   * @returns {Observable<Order>} An observable that emits the order details.
   * @since 2211.31.1
   */
  abstract setAchOrderSuccess(
    userId: string,
    cartId: string,
    publicToken: string,
    metadata: AchSuccessMetadata,
    customerConsents: boolean,
  ): Observable<Order>
}
