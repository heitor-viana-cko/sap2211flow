import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComAdapter } from '@checkout-adapters/checkout-com/checkout-com.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { ConverterService, LoggerService, OccEndpointsService } from '@spartacus/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComAdapter implements CheckoutComAdapter {

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
    protected converter: ConverterService
  ) {
  }

  /**
   * Constructor for the CheckoutComOccAdapter.
   * Initializes the adapter with the provided HTTP client, OCC endpoints service, and converter service.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<string>} An observable that emits the merchant key as a string.
   * @since 4.7.2
   */
  getMerchantKey(userId: string): Observable<string> {
    return this.http.get<string>(
      this.occEndpoints.buildUrl('merchantKey'),
      {
        responseType: 'text' as 'json',
        headers: getHeadersForUserId(userId)
      }
    );
  }

  /**
   * Checks if the user has ABC enabled.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<boolean>} An observable that emits a boolean indicating if ABC is enabled.
   * @since 4.7.2
   */
  getIsABC(userId: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.occEndpoints.buildUrl('isABC'),
      {
        headers: getHeadersForUserId(userId)
      }
    );
  }
}
