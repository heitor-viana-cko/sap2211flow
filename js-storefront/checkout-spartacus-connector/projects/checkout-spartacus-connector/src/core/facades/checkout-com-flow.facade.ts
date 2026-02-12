import { Injectable } from '@angular/core';
import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentDetails, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { CheckoutWebComponents, Options } from '@checkout.com/checkout-web-components';
import { facadeFactory, QueryNotifier, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_FLOW } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComFlowFacade =>
    facadeFactory({
      facade: CheckoutComFlowFacade,
      feature: CHECKOUT_COM_FLOW,
      methods: [
        'reloadOnPaymentSessionEvents',
        'resetOnPaymentSessionEvents',
        'getIsProcessing',
        'getIsFlowEnabled',
        'getIsProcessingFlowEnabled',
        'getIsProcessingFlowUIConfiguration',
        'getIsProcessingRequestPaymentSession',
        'getFlowUIConfiguration',
        'getFlowPublicKey',
        'initializeFlow',
        'requestPaymentSession',
        'createPaymentSessions',
        'setLocale',
        'requestIsFlowEnabled',
        'getDisableModalActions',
      ]
    })
})
export abstract class CheckoutComFlowFacade extends CheckoutComPaymentFacade {

  /**
   * Retrieves the list of query notifiers for reloading payment session events.
   *
   * This method provides the necessary query notifiers that can be used
   * to reload payment session events in the Checkout Flow feature.
   *
   * @returns {QueryNotifier[]} An array of query notifiers for reloading payment session events.
   */
  abstract reloadOnPaymentSessionEvents(): QueryNotifier[];

  /**
   * Retrieves the list of query notifiers for resetting payment session events.
   *
   * This method provides the necessary query notifiers that can be used
   * to reset payment session events in the Checkout Flow feature.
   *
   * @returns {QueryNotifier[]} An array of query notifiers for resetting payment session events.
   */
  abstract resetOnPaymentSessionEvents(): QueryNotifier[];

  /**
   * Requests the current state of whether the Checkout Flow feature is enabled.
   *
   * This method initiates a request to determine if the Checkout Flow feature
   * is enabled and provides an observable that emits the state of the request.
   *
   * @returns {Observable<QueryState<FlowEnabledDataResponseDTO>>} An observable that emits the state of the flow-enabled request.
   */
  abstract requestIsFlowEnabled(): Observable<QueryState<FlowEnabledDataResponseDTO>>;

  /**
   * Initializes the Checkout Flow feature.
   *
   * This method is responsible for setting up and preparing the Checkout Flow
   * feature for use. It should be called before interacting with any other
   * flow-related methods.
   */
  abstract initializeFlow(): void;

  /**
   * Indicates whether a process related to the Checkout Flow feature is currently active.
   *
   * This method provides an observable that emits a boolean value representing
   * the processing state of the Checkout Flow feature.
   *
   * @returns {Observable<boolean>} An observable that emits true if a process is active, otherwise false.
   */
  abstract getIsProcessing(): Observable<boolean>;

  /**
   * Retrieves the current state of whether the Checkout Flow feature is enabled.
   *
   * This method provides an observable that emits a boolean indicating
   * the enabled state of the Checkout Flow feature.
   *
   * @returns {Observable<boolean>} An observable that emits a boolean indicating if the Checkout Flow feature is enabled.
   */
  abstract getIsFlowEnabled(): Observable<boolean>;

  /**
   * Indicates whether the processing state for the Checkout Flow feature is enabled.
   *
   * This method provides an observable that emits a boolean value representing
   * whether the processing state for the Checkout Flow feature is currently enabled.
   *
   * @returns {Observable<boolean>} An observable that emits true if the processing state is enabled, otherwise false.
   */
  abstract getIsProcessingFlowEnabled(): Observable<boolean>;

  /**
   * Retrieves the flow configuration for the Checkout Flow feature.
   *
   * This method fetches the Checkout Flow configuration, which includes the necessary
   * settings and parameters for the Checkout Flow feature.
   *
   * @returns {Observable<QueryState<CheckoutComFlowUIConfigurationData>>} An observable that emits the Checkout Flow configuration state.
   * @since 2211.31.1
   */
  abstract getFlowUIConfiguration(): CheckoutComFlowUIConfigurationData;

  /**
   * Retrieves the public key for the Checkout Flow feature.
   *
   * This method provides an observable that emits the public key
   * required for initializing and interacting with the Checkout Flow feature.
   *
   * @returns {Observable<string>} An observable that emits the public key as a string.
   * @since 2211.31.1
   */
  abstract getFlowPublicKey(): Observable<string>;

  /**
   * Indicates whether the processing state for the Checkout Flow UI configuration is active.
   *
   * This method provides an observable that emits a boolean value representing
   * whether the processing state for the Checkout Flow UI configuration is currently active.
   *
   * @returns {Observable<boolean>} An observable that emits true if the processing state is active, otherwise false.
   * @since 2211.31.1
   */
  abstract getIsProcessingFlowUIConfiguration(): Observable<boolean>;

  /**
   * Requests a payment session for the Checkout Flow feature.
   *
   * This method initiates a request to create a payment session and provides
   * an observable that emits the state of the payment session request.
   *
   * @returns {Observable<QueryState<CheckoutComPaymentDetails>>} An observable that emits the state of the payment session request.
   * @since 2211.31.1
   */
  abstract requestPaymentSession(): Observable<QueryState<CheckoutComPaymentDetails>>;

  /**
   * Indicates whether the processing state for requesting a payment session is active.
   *
   * This method provides an observable that emits a boolean value representing
   * whether the processing state for requesting a payment session is currently active.
   *
   * @returns {Observable<boolean>} An observable that emits true if the processing state is active, otherwise false.
   * @since 2211.31.1
   */
  abstract getIsProcessingRequestPaymentSession(): Observable<boolean>;

  /**
   * Creates payment sessions for the Checkout Flow feature.
   *
   * This method initiates the creation of payment sessions and provides
   * an observable that emits the resulting Checkout Web Components.
   *
   * @returns {Observable<CheckoutWebComponents>} An observable that emits the created Checkout Web Components.
   * @since 2211.31.1
   */
  abstract createPaymentSessions(customOptions: Partial<Options>): Observable<CheckoutWebComponents>;

  /**
   * Sets the locale for the Checkout Flow feature.
   *
   * This method allows specifying a locale to be used for the Checkout Flow feature,
   * enabling localization of the user interface and related components.
   *
   * @param {string} locale - The locale string to set (e.g., 'en-US', 'fr-FR').
   */
  abstract setLocale(locale: string): void;

  /**
   * Indicates whether modal actions are currently disabled.
   *
   * This method provides an observable that emits a boolean value representing
   * the state of modal actions. It emits `true` if modal actions are disabled,
   * otherwise `false`.
   *
   * @returns {Observable<boolean>} An observable that emits the disabled state of modal actions.
   */
  abstract getDisableModalActions(): Observable<boolean>;
}
