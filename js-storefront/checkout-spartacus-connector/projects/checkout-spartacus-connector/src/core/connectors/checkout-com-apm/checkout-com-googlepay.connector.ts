import { Injectable } from '@angular/core';
import { CheckoutComGooglepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-googlepay.adapter';
import { GooglePayMerchantConfiguration, IntermediatePaymentData, PaymentDataRequestUpdate, PlaceOrderResponse } from '@checkout-model/GooglePay';
import { OrderConnector } from '@spartacus/order/core';
import { Observable } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable()
export class CheckoutComGooglepayConnector extends OrderConnector {

  /**
   * Constructor for CheckoutComGooglepayConnector.
   *
   * @param {CheckoutComGooglepayAdapter} adapter - The adapter for Google Pay.
   */
  constructor(
    protected override adapter: CheckoutComGooglepayAdapter
  ) {
    super(adapter);
  }

  /**
   * Retrieves the Google Pay merchant configuration for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<GooglePayMerchantConfiguration>} An observable that emits the Google Pay merchant configuration.
   */
  getGooglePayMerchantConfiguration(
    userId: string,
    cartId: string
  ): Observable<GooglePayMerchantConfiguration> {
    return this.adapter.getGooglePayMerchantConfiguration(userId, cartId);
  }

  /**
   * Authorizes the Google Pay payment for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {any} token - The payment token.
   * @param {any} billingAddress - The billing address.
   * @param {boolean} savePaymentMethod - Whether to save the payment method.
   * @param {any} shippingAddress - The shipping address.
   * @param {string} email - The email address.
   * @returns {Observable<PlaceOrderResponse>} An observable that emits the place order response.
   */
  public authoriseGooglePayPayment(
    userId: string,
    cartId: string,
    token: any,
    billingAddress: any,
    savePaymentMethod: boolean,
    shippingAddress: any,
    email: string
  ): Observable<PlaceOrderResponse> {
    return this.adapter.authoriseGooglePayPayment(userId, cartId, token, billingAddress, savePaymentMethod, shippingAddress, email);
  }

  /**
   * Sets the Google Pay delivery information for the given user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data.
   * @returns {Observable<PaymentDataRequestUpdate>} An observable that emits the payment data request update.
   */
  public setGooglePayDeliveryInfo(
    userId: string,
    cartId: string,
    paymentData: IntermediatePaymentData,
  ): Observable<PaymentDataRequestUpdate> {
    return this.adapter.setGooglePayDeliveryInfo(userId, cartId, paymentData);
  }
}
