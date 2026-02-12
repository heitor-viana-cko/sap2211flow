import { HttpErrorResponse } from '@angular/common/http';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { ApmData } from '@checkout-model/ApmData';
import { KlarnaInitParams } from '@checkout-model/Klarna';
import { PaymentDetails } from '@spartacus/core';
import { Observable } from 'rxjs';

export abstract class CheckoutComApmAdapter {

  /**
   * Create the APM Payment Details.
   *
   * @param {string} userId - The ID of the current user.
   * @param {string} cartId - The ID of the current cart.
   * @param {ApmPaymentDetails} paymentDetails - The APM payment details.
   * @returns {Observable<PaymentDetails>} An observable that emits the payment details.
   * @since 2211.31.1
   */
  abstract createApmPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: ApmPaymentDetails
  ): Observable<PaymentDetails>;

  /**
   * Requests the available APMs (Alternative Payment Methods) for the given user and cart.
   *
   * @param {string} userId - The ID of the current user.
   * @param {string} cartId - The ID of the current cart.
   * @returns {Observable<ApmData[]>} An observable that emits an array of APM data.
   * @since 2211.31.1
   */
  abstract requestAvailableApms(
    userId: string,
    cartId: string,
  ): Observable<ApmData[]>;

  /**
   * Retrieves the initialization parameters for Klarna for the given user and cart.
   *
   * @param {string} userId - The ID of the current user.
   * @param {string} cartId - The ID of the current cart.
   * @returns {Observable<KlarnaInitParams>} An observable that emits the Klarna initialization parameters.
   * @since 2211.31.1
   */
  abstract getKlarnaInitParams(
    userId: string,
    cartId: string,
  ): Observable<KlarnaInitParams | HttpErrorResponse>
}
