import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComGooglepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-googlepay.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { GooglePayMerchantConfiguration, IntermediatePaymentData, PaymentDataRequestUpdate, PlaceOrderResponse } from '@checkout-model/GooglePay';
import { ConverterService, LoggerService, OccEndpointsService } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable, of } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComGooglePayAdapter implements CheckoutComGooglepayAdapter {

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
    protected converter: ConverterService,
  ) {
  }

  /**
   * Retrieves the Google Pay merchant configuration for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<GooglePayMerchantConfiguration>} An observable that emits the Google Pay merchant configuration.
   * @since 4.7.2
   */
  getGooglePayMerchantConfiguration(
    userId: string,
    cartId: string
  ): Observable<GooglePayMerchantConfiguration> {
    return this.http.get<GooglePayMerchantConfiguration>(
      this.occEndpoints.buildUrl(
        'googlePayMerchantConfig',
        {
          urlParams: {
            cartId,
            userId
          },
        },
      ),
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Authorizes a Google Pay payment for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} token - The Google Pay token.
   * @param {any} billingAddress - The billing address.
   * @param {boolean} saved - Indicates if the payment details are saved.
   * @param {any} shippingAddress - The shipping address.
   * @param {string} email - The email address.
   * @returns {Observable<PlaceOrderResponse>} An observable that emits the place order response.
   * @since 4.7.2
   */
  authoriseGooglePayPayment(
    userId: string,
    cartId: string,
    token: string,
    billingAddress: any,
    saved: boolean,
    shippingAddress: any,
    email: string
  ): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>(
      this.occEndpoints.buildUrl('googlePayPlaceOrder', {
        urlParams: {
          userId,
          cartId
        },
      }),
      {
        token,
        billingAddress,
        saved,
        shippingAddress,
        email
      },
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Sets the Google Pay delivery information for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data.
   * @returns {Observable<PaymentDataRequestUpdate>} An observable that emits the payment data request update.
   * @since 4.7.2
   */
  setGooglePayDeliveryInfo(userId: string, cartId: string, paymentData: IntermediatePaymentData): Observable<PaymentDataRequestUpdate> {
    return this.http.post<PaymentDataRequestUpdate>(
      this.occEndpoints.buildUrl('googlePaySetDeliveryInfo', {
        urlParams: {
          cartId,
          userId
        },
      }),
      {
        ...paymentData
      },
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Places an order.
   *
   * This method is not implemented and logs an error message.
   *
   * @returns {Observable<Order>} An observable that emits undefined.
   * @since 2211.32.1
   */
  placeOrder(): Observable<Order> {
    this.logger.error('Method not implemented.');
    return of(undefined);
  }

  /**
   * Places a payment authorized order.
   *
   * This method is not implemented and logs an error message.
   *
   * @returns {Observable<Order>} An observable that emits undefined.
   * @since 2211.32.1
   */
  placePaymentAuthorizedOrder(): Observable<Order> {
    this.logger.error('Method not implemented.');
    return of(undefined);
  }
}