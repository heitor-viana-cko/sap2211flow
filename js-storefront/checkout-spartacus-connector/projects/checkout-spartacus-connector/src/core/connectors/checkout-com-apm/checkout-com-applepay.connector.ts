import { Injectable } from '@angular/core';
import { CheckoutComApplepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-applepay.adapter';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { OrderConnector } from '@spartacus/order/core';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComApplepayConnector extends OrderConnector {

  /**
   * Constructor for the CheckoutComApplepayConnector.
   *
   * @param {CheckoutComApplepayAdapter} adapter - The adapter for Checkout.com Apple Pay.
   */
  constructor(
    protected override adapter: CheckoutComApplepayAdapter
  ) {
    super(adapter);
  }

  /**
   * Requests the Apple Pay payment request for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} [productCode] - The optional product code.
   * @returns {Observable<ApplePayPaymentRequest>} An observable that emits the Apple Pay payment request.
   * @since 2211.31.1
   */
  public requestApplePayPaymentRequest(
    userId: string,
    cartId: string,
    productCode?: string
  ): Observable<ApplePayPaymentRequest> {
    return this.adapter.requestApplePayPaymentRequest(userId, cartId, productCode);
  }

  /**
   * Validates the Apple Pay merchant for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} validationURL - The validation URL for Apple Pay.
   * @returns {Observable<any>} An observable that emits the validation result.
   * @since 2211.31.1
   */
  validateApplePayMerchant(
    userId: string,
    cartId: string,
    validationURL: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<any> {
    return this.adapter.validateApplePayMerchant(userId, cartId, validationURL);
  }

  /**
   * Authorizes the Apple Pay payment for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {any} request - The authorization request data.
   * @returns {Observable<ApplePayAuthorization>} An observable that emits the Apple Pay authorization result.
   * @since 2211.31.1
   */
  authorizeApplePayPayment(
    userId: string,
    cartId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any
  ): Observable<ApplePayAuthorization> {
    return this.adapter.authorizeApplePayPayment(userId, cartId, request);
  }

  /**
   * Selects the Apple Pay delivery address for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {ApplePayPaymentContact} shippingContact - The shipping contact information.
   * @returns {Observable<ApplePayShippingContactUpdate>} An observable that emits the shipping contact update.
   * @since 2211.31.1
   */
  selectApplePayDeliveryAddress(
    userId: string,
    cartId: string,
    shippingContact: ApplePayPaymentContact
  ): Observable<ApplePayShippingContactUpdate> {
    return this.adapter.selectApplePayDeliveryAddress(userId, cartId, shippingContact);
  }

  /**
   * Selects the Apple Pay delivery method for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {ApplePayShippingMethod} shippingMethod - The selected shipping method.
   * @returns {Observable<ApplePayShippingMethodUpdate>} An observable that emits the shipping method update.
   * @since 2211.31.1
   */
  selectApplePayDeliveryMethod(
    userId: string,
    cartId: string,
    shippingMethod: ApplePayShippingMethod
  ): Observable<ApplePayShippingMethodUpdate> {
    return this.adapter.selectApplePayDeliveryMethod(userId, cartId, shippingMethod);
  }
}
