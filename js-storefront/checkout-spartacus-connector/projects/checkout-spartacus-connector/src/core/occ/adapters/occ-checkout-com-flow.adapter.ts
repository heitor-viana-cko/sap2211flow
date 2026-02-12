import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComFlowAdapter } from '@checkout-adapters/checkout-com-flow/checkout-com-flow.adapter';
import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { ConverterService, LoggerService, OccEndpointsService } from '@spartacus/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComFlowAdapter implements CheckoutComFlowAdapter {

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
   * Checks if the flow feature is enabled.
   *
   * This method sends a GET request to the OCC endpoint to determine
   * if the flow feature is enabled for the Checkout.com integration.
   *
   * @returns {Observable<boolean>} An observable that emits a boolean indicating if the flow feature is enabled.
   * @since 2211.32.1
   */
  requestIsFlowEnabled(): Observable<FlowEnabledDataResponseDTO> {
    return this.http.get<FlowEnabledDataResponseDTO>(
      this.occEndpoints.buildUrl('requestIsFlowEnabled')
    );
  }

  /**
   * Requests the flow configuration for the Checkout.com integration.
   *
   * This method sends a GET request to the OCC endpoint to retrieve the
   * flow configuration for the Checkout.com integration. The flow configuration
   * contains settings and parameters that define the behavior of the integration.
   *
   * @returns {Observable<CheckoutComFlowUIConfigurationData>} An observable that emits the flow configuration.
   * @since 2211.32.1
   */
  requestFlowUIConfiguration(): Observable<CheckoutComFlowUIConfigurationData> {
    return this.http.get<CheckoutComFlowUIConfigurationData>(
      this.occEndpoints.buildUrl('requestFlowUIConfiguration')
    );
  }

  /**
   * Requests a payment session for the Checkout.com flow.
   *
   * This method sends a GET request to the OCC endpoint to retrieve the payment session
   * associated with the specified user and cart. The payment session contains details
   * required for processing payments in the Checkout.com integration.
   *
   * @param {string} userId - The ID of the user for whom the payment session is requested.
   * @param {string} cartId - The ID of the cart associated with the payment session.
   * @returns {Observable<CheckoutComPaymentSession>} An observable that emits the payment session details.
   * @since 2211.32.1
   */
  requestFlowPaymentSession(userId: string, cartId: string): Observable<CheckoutComPaymentSession> {
    return this.http.get<CheckoutComPaymentSession>(
      this.occEndpoints.buildUrl('requestFlowPaymentSession', {
        urlParams: {
          userId,
          cartId
        }
      }),
      { headers: getHeadersForUserId(userId) }
    );
  }
}
