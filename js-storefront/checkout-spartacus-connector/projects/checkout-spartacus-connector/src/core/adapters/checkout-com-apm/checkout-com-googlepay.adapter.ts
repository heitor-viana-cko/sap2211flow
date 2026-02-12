import { GooglePayMerchantConfiguration, IntermediatePaymentData, PaymentDataRequestUpdate, PlaceOrderResponse } from '@checkout-model/GooglePay';
import { OrderAdapter } from '@spartacus/order/core';
import { Observable } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class CheckoutComGooglepayAdapter extends OrderAdapter {

  /**
   * Request current merchant configuration
   *
   * @param userId - The ID of the current user.
   * @param cartId - The ID of the current cart.
   * @returns An Observable that emits the Google Pay merchant configuration.
   * @since 2211.31.1
   */
  abstract getGooglePayMerchantConfiguration(
    userId: string,
    cartId: string
  ): Observable<GooglePayMerchantConfiguration>;

  /**
   * Authorise GooglePay payment
   *
   * @param userId - The ID of the current user.
   * @param cartId - The ID of the current cart.
   * @param token - The tokenized payment details.
   * @param billingAddress - The billing address.
   * @param savePaymentMethod - Whether to save the payment method or not.
   * @param shippingAddress - The optional shipping address (required for GooglePay express button).
   * @param email - The optional email address.
   * @returns An Observable that emits the response of the place order request.
   * @since 2211.31.1
   */
  abstract authoriseGooglePayPayment(
    userId: string,
    cartId: string,
    token: string,
    billingAddress: any,
    savePaymentMethod: boolean,
    shippingAddress: any,
    email: string
  ): Observable<PlaceOrderResponse>;

  /**
   * Set the delivery address for GooglePay and get updated order lines back
   *
   * @param userId - The ID of the current user.
   * @param cartId - The ID of the current cart.
   * @param paymentData - The intermediate payment data.
   * @returns An Observable that emits the updated payment data request.
   * @since 2211.31.1
   */
  abstract setGooglePayDeliveryInfo(
    userId: string,
    cartId: string,
    paymentData: IntermediatePaymentData,
  ): Observable<PaymentDataRequestUpdate>;
}
