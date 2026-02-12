import { Injectable } from '@angular/core';
import { GooglePayMerchantConfiguration, GooglePayPaymentExpressIntents, GooglePayPaymentRequest, IntermediatePaymentData } from '@checkout-model/GooglePay';
import { facadeFactory } from '@spartacus/core';
import { OrderFacade } from '@spartacus/order/root';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_GOOGLEPAY } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComGooglepayFacade =>
    facadeFactory({
      facade: CheckoutComGooglepayFacade,
      feature: CHECKOUT_COM_GOOGLEPAY,
      methods: [
        'getMerchantConfigurationFromState',
        'requestMerchantConfiguration',
        'authoriseOrder',
        'updatePaymentData',
        'createInitialPaymentRequest',
        'createFullPaymentRequest',
        'addPaymentExpressIntents',
        'onPaymentAuthorized',
        'onPaymentDataChanged',
      ],
    }),
})
export abstract class CheckoutComGooglepayFacade extends OrderFacade {
  /**
   * Retrieve the Google Pay merchant configuration from the state.
   *
   * @returns {Observable<GooglePayMerchantConfiguration>} - An observable of the Google Pay merchant configuration.
   * @since 2211.31.1
   */
  abstract getMerchantConfigurationFromState(): Observable<GooglePayMerchantConfiguration>;

  /**
   * Dispatches a request to retrieve the Google Pay merchant configuration from OCC.
   *
   * @since 2211.31.1
   */
  abstract requestMerchantConfiguration(): void;

  /**
   * Authorizes a Google Pay order by dispatching an action with the payment details.
   *
   * @param {GooglePayPaymentRequest} paymentRequest - The Google Pay payment request containing payment method data.
   * @param {boolean} savePaymentMethod - Indicates whether to save the payment method for future use.
   * @sinve 2211.31.1
   */
  abstract authoriseOrder(paymentRequest: GooglePayPaymentRequest, savePaymentMethod: boolean): void;

  /**
   * Updates the payment data by dispatching an action with the provided payment data.
   *
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data to be updated.
   * @since 2211.31.1
   */
  abstract updatePaymentData(paymentData: IntermediatePaymentData): void;

  /**
   * Creates an initial Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} merchantConfiguration - The Google Pay merchant configuration.
   * @param {boolean} shippingAddressRequired - Indicates whether a shipping address is required.
   * @returns {any} - The initial Google Pay payment request object.
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract createInitialPaymentRequest(merchantConfiguration: GooglePayMerchantConfiguration, shippingAddressRequired: boolean,): any;

  /**
   * Creates a full Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} merchantConfiguration - The Google Pay merchant configuration.
   * @returns {any} - The full Google Pay payment request object.
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract createFullPaymentRequest(merchantConfiguration: GooglePayMerchantConfiguration): any;

  /**
   * Adds payment express intents to the Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} paymentRequest - The Google Pay merchant configuration.
   * @returns {GooglePayPaymentExpressIntents} - The updated Google Pay payment request with express intents.
   */
  abstract addPaymentExpressIntents(paymentRequest: GooglePayMerchantConfiguration): GooglePayPaymentExpressIntents;

  /**
   * Handles the payment authorization by dispatching an action with the provided payment data.
   *
   * @param {GooglePayPaymentRequest} paymentData - The Google Pay payment request containing payment method data.
   * @returns {Promise<any>} - A promise that resolves when the payment authorization result is available.
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract onPaymentAuthorized(paymentData: GooglePayPaymentRequest): Promise<any>;

  /**
   * Updates the payment data by dispatching an action with the provided payment data.
   *
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data to be updated.
   * @returns {Promise<any>} - A promise that resolves when the payment data update result is available.
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract onPaymentDataChanged(paymentData: IntermediatePaymentData): Promise<any>;
}
