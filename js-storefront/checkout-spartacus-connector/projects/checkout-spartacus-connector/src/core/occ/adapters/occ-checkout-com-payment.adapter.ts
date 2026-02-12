import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CheckoutComPaymentAdapter } from '@checkout-adapters/checkout-com-payment/checkout-com-payment.adapter';
import { APM_PAYMENT_DETAILS_NORMALIZER } from '@checkout-adapters/converters';
import { ApmPaymentDetails, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { PAYMENT_DETAILS_SERIALIZER } from '@spartacus/checkout/base/core';
import { OccCheckoutPaymentAdapter } from '@spartacus/checkout/base/occ';
import { Address, HttpErrorModel, PAYMENT_DETAILS_NORMALIZER, PaymentDetails, tryNormalizeHttpError } from '@spartacus/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OccCheckoutComPaymentAdapter extends OccCheckoutPaymentAdapter implements CheckoutComPaymentAdapter {

  /**
   * Sets the payment address for the specified cart and user.
   *
   * @param {string} cartId - The ID of the cart.
   * @param {string} userId - The ID of the user.
   * @param {Address} address - The payment address to set.
   * @returns {Observable<any>} An observable that emits the result of the operation.
   * @since 2211.31.1
   */
  setPaymentAddress(
    userId: string,
    cartId: string,
    address: Address
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<any> {
    return this.http.post(
      this.occEndpoints.buildUrl('setPaymentAddress', {
        urlParams: {
          userId,
          cartId,
        },
      }),
      { ...address },
      { headers: getHeadersForUserId(userId) }
    ).pipe(
      catchError((error: unknown): Observable<never> => throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger)))
    );
  }

  /**
   * Creates payment details for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to create.
   * @returns {Observable<PaymentDetails>} An observable that emits the created payment details.
   * @since 2211.31.1
   */
  override createPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<PaymentDetails> {
    return this.http.post<CheckoutComPaymentDetails>(
      this.occEndpoints.buildUrl('setPaymentDetails', {
        urlParams: {
          userId,
          cartId
        },
      }),
      this.converter.convert(paymentDetails, PAYMENT_DETAILS_SERIALIZER),
      { headers: getHeadersForUserId(userId) }
    ).pipe(
      map((response: CheckoutComPaymentDetails): PaymentDetails => this.converter.convert(response, PAYMENT_DETAILS_NORMALIZER)),
      catchError((error: unknown): Observable<never> => throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger)))
    );
  }

  /**
   * Creates APM (Alternative Payment Method) payment details for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {ApmPaymentDetails} paymentDetails - The APM payment details to create.
   * @returns {Observable<PaymentDetails>} An observable that emits the created payment details.
   * @since 2211.31.1
   */
  createApmPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: ApmPaymentDetails
  ): Observable<PaymentDetails> {
    return this.http.post<ApmPaymentDetails>(
      this.occEndpoints.buildUrl('setApmPaymentDetails', {
        urlParams: {
          userId,
          cartId
        },
      }),
      paymentDetails,
      { headers: getHeadersForUserId(userId) }
    ).pipe(
      map((): PaymentDetails => this.converter.convert(paymentDetails, APM_PAYMENT_DETAILS_NORMALIZER)),
      catchError((error: unknown): Observable<never> => throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger)))
    );
  }

  /**
   * Updates the payment details for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to update.
   * @returns {Observable<HttpResponse<void>>} An observable that emits the updated payment details.
   * @since 2211.31.1
   */
  updatePaymentDetails(
    userId: string,
    paymentDetails: CheckoutComPaymentDetails
  ): Observable<HttpResponse<void>> {
    return this.http.put<void>(
      this.occEndpoints.buildUrl('updatePaymentDetails', {
        urlParams: {
          userId,
          paymentDetailsId: paymentDetails.id
        },
      }),
      {
        ...paymentDetails
      },
      {
        headers: getHeadersForUserId(userId),
        observe: 'response'
      }
    ).pipe(
      catchError((error: unknown): Observable<never> => throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger)))
    );
  }

}
