import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { OrderAdapter } from '@spartacus/order/core';
import { Observable } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class CheckoutComApplepayAdapter extends OrderAdapter {

  /**
   * Requests an Apple Pay payment request.
   *
   * @param userId - The ID of the user.
   * @param cartId - The ID of the cart.
   * @param productCode - (Optional) The product code.
   * @returns An Observable that emits the Apple Pay payment request.
   * @since 2211.31.1
   */
  abstract requestApplePayPaymentRequest(
    userId: string,
    cartId: string,
    productCode?: string
  ): Observable<ApplePayPaymentRequest>;

  /**
   * Validates the Apple Pay merchant.
   *
   * @param userId - The ID of the user.
   * @param cartId - The ID of the cart.
   * @param validationURL - The validation URL.
   * @returns An Observable that emits the validation result.
   * @since 2211.31.1
   */
  abstract validateApplePayMerchant(
    userId: string,
    cartId: string,
    validationURL: string
  ): Observable<any>;

  /**
   * Authorizes an Apple Pay payment.
   *
   * @param userId - The ID of the user.
   * @param cartId - The ID of the cart.
   * @param request - The authorization request.
   * @returns An Observable that emits the Apple Pay authorization.
   * @since 2211.31.1
   */
  abstract authorizeApplePayPayment(
    userId: string,
    cartId: string,
    request: any
  ): Observable<ApplePayAuthorization>;

  /**
   * Set the delivery address given the shipping contact from ApplePay
   *
   * @param userId - The ID of the user.
   * @param cartId - The ID of the cart.
   * @param shippingContact - The shipping contact information from ApplePay.
   * @returns An Observable that emits the Apple Pay shipping contact update.
   * @since 2211.31.1
   */
  abstract selectApplePayDeliveryAddress(
    userId: string,
    cartId: string,
    shippingContact: ApplePayPaymentContact
  ): Observable<ApplePayShippingContactUpdate>

  /**
   * Set the delivery method (Shipping Method) given the shipping Method
   *
   * @param userId - The ID of the user.
   * @param cartId - The ID of the cart.
   * @param shippingMethod - The shipping method information from ApplePay.
   * @returns An Observable that emits the Apple Pay shipping method update.
   * @since 2211.31.1
   */
  abstract selectApplePayDeliveryMethod(
    userId: string,
    cartId: string,
    shippingMethod: ApplePayShippingMethod
  ): Observable<ApplePayShippingMethodUpdate>;
}
