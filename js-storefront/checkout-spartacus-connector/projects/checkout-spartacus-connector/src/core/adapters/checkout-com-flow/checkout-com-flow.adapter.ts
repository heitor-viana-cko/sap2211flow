import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { Observable } from 'rxjs';

export abstract class CheckoutComFlowAdapter {
  /**
   * Checks if the flow feature is enabled.
   *
   * This method determines whether the flow feature is enabled for the Checkout.com integration.
   *
   * @returns {Observable<boolean>} An observable that emits a boolean indicating if the flow feature is enabled.
   * @since 2211.32.1
   */
  abstract requestIsFlowEnabled(): Observable<FlowEnabledDataResponseDTO>;

  /**
   * Requests the flow configuration for the Checkout.com integration.
   *
   * This method retrieves the flow configuration, which contains settings
   * and parameters defining the behavior of the Checkout.com integration.
   *
   * @returns {Observable<CheckoutComFlowUIConfigurationData>} An observable that emits the flow configuration.
   * @since 2211.32.1
   */
  abstract requestFlowUIConfiguration(): Observable<CheckoutComFlowUIConfigurationData>;

  /**
   * Requests the payment session for the Checkout.com flow.
   *
   * This method retrieves the payment session details required
   * for processing payments in the Checkout.com integration.
   *
   * @returns {Observable<CheckoutComPaymentSession>} An observable that emits the payment session details.
   * @since 2211.32.1
   */
  abstract requestFlowPaymentSession(userId: string, cartId: string): Observable<CheckoutComPaymentSession>;
}
