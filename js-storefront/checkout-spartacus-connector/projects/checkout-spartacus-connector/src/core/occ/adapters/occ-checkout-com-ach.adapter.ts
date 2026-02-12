import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComAchAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-ach.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { ConverterService, LoggerService, OccEndpointsService } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComAchAdapter implements CheckoutComAchAdapter {

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
   * Retrieves the ACH link token for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<any>} An observable that emits the ACH link token.
   * @since 4.7.2
   */
  getAchLinkToken(userId: string, cartId: string): Observable<string> {
    return this.http.post<string>(
      this.occEndpoints.buildUrl('achPlaidLinkToken', {
        urlParams: {
          cartId,
          userId
        },
      }),
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Retrieves the ACH order success for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} publicToken - The public token for the ACH order.
   * @param {AchSuccessMetadata} metadata - The metadata for the ACH order success.
   * @param {boolean} customerConsents - Indicates if the customer consents.
   * @returns {Observable<Order>} An observable that emits the order.
   * @since 4.7.2
   */
  setAchOrderSuccess(
    userId: string,
    cartId: string,
    publicToken: string,
    metadata: AchSuccessMetadata,
    customerConsents: boolean,
  ): Observable<Order> {
    return this.http.post<Order>(
      this.occEndpoints.buildUrl('achOrderSuccess', {
        urlParams: {
          cartId,
          userId
        },
      }), {
        publicToken,
        metadata,
        customerConsents
      },
      { headers: getHeadersForUserId(userId) });
  }
}
