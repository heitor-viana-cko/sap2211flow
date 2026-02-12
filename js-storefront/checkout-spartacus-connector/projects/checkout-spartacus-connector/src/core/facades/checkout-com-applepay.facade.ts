import { Injectable } from '@angular/core';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { facadeFactory } from '@spartacus/core';
import { OrderFacade } from '@spartacus/order/root';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_APPLEPAY } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComApplepayFacade =>
    facadeFactory({
      facade: CheckoutComApplepayFacade,
      feature: CHECKOUT_COM_APPLEPAY,
      methods: [
        'createSession',
        'getPaymentRequestFromState',
        'getMerchantSessionFromState',
        'getPaymentAuthorizationFromState',
        'getDeliveryAddressUpdateFromState',
        'getDeliveryMethodUpdateFromState',
        'requestApplePayPaymentRequest',
        'onValidateMerchant',
        'onShippingMethodSelected',
        'onShippingContactSelected',
        'onPaymentAuthorized',
        'onPaymentError',
        'resetApplepaySession',
      ],
    }),
})
export abstract class CheckoutComApplepayFacade extends OrderFacade {
  /**
   * Creates an Apple Pay session and initializes event handlers.
   *
   * @param {ApplePayPaymentRequest} paymentRequest - The payment request object for Apple Pay.
   * @param {string} [cartId] - The ID of the cart (optional).
   * @param {string} [userId] - The ID of the user (optional).
   * @returns {any} - The initialized Apple Pay session.
   * @since 2211.31.1
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract createSession(paymentRequest: ApplePayPaymentRequest, cartId?: string, userId?: string): any;

  /**
   * Create observable for ApplePay Payment Request.
   *
   * @returns {Observable<ApplePayPaymentRequest>} - An observable that emits the Apple Pay payment request.
   * @since 2211.31.1
   */
  abstract getPaymentRequestFromState(): Observable<ApplePayPaymentRequest>;

  /**
   * Retrieves the Apple Pay merchant session from the state.
   *
   * @returns {Observable<any>} - An observable that emits the Apple Pay merchant session.
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getMerchantSessionFromState(): Observable<any>;

  /**
   * Retrieves the Apple Pay payment authorization from the state.
   *
   * @returns {Observable<ApplePayAuthorization>} - An observable that emits the Apple Pay payment authorization.
   * @since 2211.31.1
   */
  abstract getPaymentAuthorizationFromState(): Observable<ApplePayAuthorization>;

  /**
   * Retrieves the Apple Pay delivery address update from the state.
   *
   * @returns {Observable<ApplePayShippingContactUpdate>} - An observable that emits the Apple Pay delivery address update.
   * @since 2211.31.1
   */
  abstract getDeliveryAddressUpdateFromState(): Observable<ApplePayShippingContactUpdate>;

  /**
   * Retrieves the Apple Pay delivery method update from the state.
   *
   * @returns {Observable<ApplePayShippingMethodUpdate>} - An observable that emits the Apple Pay delivery method update.
   * @since 2211.31.1
   */
  abstract getDeliveryMethodUpdateFromState(): Observable<ApplePayShippingMethodUpdate>;

  /**
   * Dispatches an action to request the Apple Pay payment request that can be used to initialize the ApplePaySession.
   *
   * @param {string} [multiCardId] - The ID of the multi-card (optional).
   * @returns {void}
   * @since 2211.31.1
   */
  abstract requestApplePayPaymentRequest(multiCardId?: string): void;

  /**
   * Dispatches an action to validate the Apple Pay merchant.
   *
   * @param {Object} event - The event object containing the validation URL.
   * @param {string} event.validationURL - The URL to validate the Apple Pay merchant.
   * @returns {void}
   * @since 2211.31.1
   */
  abstract onValidateMerchant(event: { validationURL: string }): void;

  /**
   * Called when the Apple Pay user selects a different shipping method.
   *
   * @param {Object} event - The event object containing the selected shipping method.
   * @param {ApplePayShippingMethod} event.shippingMethod - The selected shipping method.
   * @returns {void}
   * @since 2211.31.1
   */
  abstract onShippingMethodSelected(event: { shippingMethod: ApplePayShippingMethod }): void;

  /**
   * Called when the Apple Pay user selects a different delivery address.
   *
   * @param {Object} event - The event object containing the selected delivery address.
   * @param {ApplePayPaymentContact} event.shippingContact - The selected delivery address.
   * @returns {void}
   * @since 2211.31.1
   */
  abstract onShippingContactSelected(event: { shippingContact: ApplePayPaymentContact }): void;

  /**
   * Dispatches an action to authorize the Apple Pay payment.
   *
   * @param {Object} event - The event object containing the payment information.
   * @param {any} event.payment - The payment information.
   * @returns {void}
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract onPaymentAuthorized(event: { payment: any }): void;

  /**
   * Handles the payment error by displaying an error message and unsubscribing from observables.
   *
   * @returns {void}
   * @since 2211.31.1
   */
  abstract onPaymentError(): void;

  /**
 * Resets the Apple Pay session.
 *
 * @returns {void}
 * @since 2211.31.1
 */
abstract resetApplepaySession(): void;
}
