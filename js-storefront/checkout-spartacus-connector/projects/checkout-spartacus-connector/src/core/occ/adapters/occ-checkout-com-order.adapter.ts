import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComOrderAdapter } from '@checkout-adapters/checkout-com-order/checkout-com-order.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { ConverterService, LoggerService, Occ, OccEndpointsService } from '@spartacus/core';
import { Order, ORDER_NORMALIZER } from '@spartacus/order/root';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComOrderAdapter implements CheckoutComOrderAdapter {

  protected logger: LoggerService = inject(LoggerService);

  /**
   * Constructor for the CheckoutComOccAdapter.
   * Initializes the adapter with the provided HTTP client, OCC endpoints service, and converter service.
   *
   * @param {HttpClient} http - The HTTP client service.
   * @param {OccEndpointsService} occEndpoints - The OCC endpoints service.
   * @param {ConverterService} converter - The converter service.
   * @since 4.7.2
   */
  constructor(
    protected http: HttpClient,
    protected occEndpoints: OccEndpointsService,
    protected converter: ConverterService,
  ) {
  }

  /**
   * Places an order for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {boolean} termsChecked - Indicates if the terms and conditions have been accepted.
   * @returns {Observable<Order>} An observable that emits the placed order.
   * @since 4.7.2
   */
  placeOrder(userId: string, cartId: string, termsChecked: boolean): Observable<Order> {
    const params: HttpParams = new HttpParams()
      .set('fields', 'FULL')
      .set('termsChecked', termsChecked.toString());

    return this.http
      .post<Occ.Order>(
        this.occEndpoints.buildUrl('directPlaceOrder', {
          urlParams: {
            cartId,
            userId
          },
        }),
        {},
        {
          headers: getHeadersForUserId(userId),
          params
        }
      )
      .pipe(this.converter.pipeable(ORDER_NORMALIZER));
  }

  /**
   * Authorizes and places an order for the specified user and cart using a redirect session.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} sessionId - The session ID for the redirect.
   * @returns {Observable<Order>} An observable that emits the placed order.
   * @since 4.7.2
   */
  authorizeRedirectPlaceOrder(userId: string, cartId: string, sessionId: string): Observable<Order> {
    return this.http.post<Occ.Order>(
      this.occEndpoints.buildUrl('redirectPlaceOrder', {
        urlParams: {
          cartId,
          userId
        },
      }),
      { 'cko-session-id': sessionId },
      { headers: getHeadersForUserId(userId) }
    ).pipe(this.converter.pipeable(ORDER_NORMALIZER));
  }

  /**
 * Places a payment authorized order.
 *
 * This method is not implemented and logs an error message.
 *
 * @returns {Observable<Order>} An observable that emits undefined.
 * @since 2211.32.1
 */
  placePaymentAuthorizedOrder(): Observable<Order> {
    this.logger.error('Method not implemented.');
    return of(undefined);
  }
}
