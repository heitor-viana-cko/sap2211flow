import { Injectable } from '@angular/core';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { facadeFactory, QueryState } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_ACH } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComAchFacade =>
    facadeFactory({
      facade: CheckoutComAchFacade,
      feature: CHECKOUT_COM_ACH,
      methods: [
        'requestPlaidLinkToken',
        'getPlaidLinkToken',
        'setPlaidLinkMetadata',
        'getPlaidLinkMetadata',
        'requestPlaidSuccessOrder',
        'getPlaidOrder',
      ],
    }),
})
export abstract class CheckoutComAchFacade {
  /**
   * Requests a Plaid Link token for the current user.
   * The token is used to open the Plaid Link widget.
   *
   * @returns {Observable<QueryState<string>>} - The Plaid Link token.
   * @since 2211.31.1
   */
  abstract requestPlaidLinkToken(): Observable<QueryState<string>>;

  /**
   * Retrieves the Plaid Link token from the store.
   *
   * @returns {Observable<string>} - The Plaid Link token.
   * @since 2211.31.1
   */
  abstract getPlaidLinkToken(): Observable<string>;

  /**
   * Dispatches an action to set the ACH account list success metadata.
   *
   * @param {AchSuccessMetadata} achSuccessMetadata - The metadata for the ACH account list success.
   * @returns {void}
   * @since 2211.31.1
   */
  abstract setPlaidLinkMetadata(achSuccessMetadata: AchSuccessMetadata): void;

  /**
   * Retrieves the Plaid Link metadata from the store.
   *
   * @returns {Observable<AchSuccessMetadata>} - The Plaid Link metadata.
   * @since 2211.31.1
   */
  abstract getPlaidLinkMetadata(): Observable<AchSuccessMetadata>;

  /**
   * Requests a Plaid success order for the current user.
   * Dispatches an action to set the ACH order success and retrieves the order.
   *
   * @param {string} publicToken - The public token from Plaid.
   * @param {AchSuccessMetadata} metadata - The metadata for the ACH success.
   * @param {boolean} customerConsents - Indicates if the customer consents.
   * @returns {Observable<Order>} - The Plaid success order.
   * @since 2211.31.1
   */
  abstract requestPlaidSuccessOrder(publicToken: string, metadata: AchSuccessMetadata, customerConsents: boolean): Observable<Order>;

  /**
   * Retrieves the ACH success order from the store.
   *
   * @returns {Observable<Order>} - The ACH success order.
   * @since 2211.31.1
   */
  abstract getPlaidOrder(): Observable<Order>;
}
