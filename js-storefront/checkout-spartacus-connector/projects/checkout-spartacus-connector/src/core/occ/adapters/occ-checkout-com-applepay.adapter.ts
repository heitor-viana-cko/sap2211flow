import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutComApplepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-applepay.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { ConverterService, LoggerService, OccEndpointsService } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable, of } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComApplepayAdapter implements CheckoutComApplepayAdapter {

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
   * Requests the Apple Pay payment request for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<ApplePayPaymentRequest>} An observable that emits the Apple Pay payment request.
   * @since 4.7.2
   */
  public requestApplePayPaymentRequest(
    userId: string,
    cartId: string,
  ): Observable<ApplePayPaymentRequest> {
    return this.http.get<ApplePayPaymentRequest>(
      this.occEndpoints.buildUrl('applePayPaymentRequest', {
        urlParams: {
          cartId,
          userId
        }
      }),
      { headers: getHeadersForUserId(userId) },
    );
  }

  /**
   * Validates the Apple Pay merchant for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {string} validationURL - The validation URL for the Apple Pay session.
   * @returns {Observable<any>} An observable that emits the result of the validation.
   * @since 4.7.2
   */
  validateApplePayMerchant(
    userId: string,
    cartId: string,
    validationURL: string
  ): Observable<any> {
    return this.http.post<any>(
      this.occEndpoints.buildUrl('applePayRequestSession', {
        urlParams: {
          cartId,
          userId
        },
      }),
      {
        validationURL
      },
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Authorizes an Apple Pay payment for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {any} request - The Apple Pay payment request.
   * @returns {Observable<ApplePayAuthorization>} An observable that emits the Apple Pay authorization.
   * @since 4.7.2
   */
  authorizeApplePayPayment(
    userId: string,
    cartId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any
  ): Observable<ApplePayAuthorization> {
    return this.http.post<ApplePayAuthorization>(
      this.occEndpoints.buildUrl('applePayPlaceOrder', {
        urlParams: {
          cartId,
          userId
        },
      }),
      {
        ...request
      },
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Selects the Apple Pay delivery address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {ApplePayPaymentContact} shippingContact - The Apple Pay shipping contact.
   * @returns {Observable<ApplePayShippingContactUpdate>} An observable that emits the Apple Pay shipping contact update.
   * @since 4.7.2
   */
  selectApplePayDeliveryAddress(
    userId: string,
    cartId: string,
    shippingContact: ApplePayPaymentContact
  ): Observable<ApplePayShippingContactUpdate> {
    return this.http.post<ApplePayShippingContactUpdate>(
      this.occEndpoints.buildUrl('applePaySetDeliveryAddress', {
        urlParams: {
          cartId,
          userId
        },
      }),
      {
        ...shippingContact
      },
      { headers: getHeadersForUserId(userId) }
    );
  }

  /**
   * Selects the Apple Pay delivery method for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {ApplePayShippingMethod} shippingMethod - The Apple Pay shipping method.
   * @returns {Observable<ApplePayShippingMethodUpdate>} An observable that emits the Apple Pay shipping method update.
   * @since 4.7.2
   */
  selectApplePayDeliveryMethod(
    userId: string,
    cartId: string,
    shippingMethod: ApplePayShippingMethod
  ): Observable<ApplePayShippingMethodUpdate> {
    return this.http.post<ApplePayShippingMethodUpdate>(
      this.occEndpoints.buildUrl('applePaySetDeliveryMethod', {
        urlParams: {
          cartId,
          userId
        },
      }),
      {
        ...shippingMethod
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