import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { ApmData, PaymentType } from '@checkout-model/ApmData';
import { KlarnaInitParams } from '@checkout-model/Klarna';
import { facadeFactory, PaymentDetails, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_APM } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComApmFacade =>
    facadeFactory({
      facade: CheckoutComApmFacade,
      feature: CHECKOUT_COM_APM,
      methods: [
        'getApmByComponent',
        'requestAvailableApms',
        'selectApm',
        'getAvailableApmsFromState',
        'getSelectedApmFromState',
        'getIsApmLoadingFromState',
        'createApmPaymentDetails',
        'getKlarnaInitParams',
      ],
    }),
})
export abstract class CheckoutComApmFacade {
  /**
   * Retrieves the APM (Alternative Payment Method) data by component UID and payment type.
   *
   * @param {string} componentUid - The UID of the CMS component.
   * @param {PaymentType} paymentType - The type of payment.
   * @returns {Observable<ApmData>} - An observable containing the APM data.
   * @since 2211.31.1
   */
  abstract getApmByComponent(componentUid: string, paymentType: PaymentType): Observable<ApmData>;

  /**
   * Requests the available APMs (Alternative Payment Methods) by dispatching an action with the user and cart IDs.
   *
   * @returns {Observable<QueryState<ApmData[]>>} - An observable containing the list of available APMs.
   * @since 2211.31.1
   */
  abstract requestAvailableApms(): Observable<QueryState<ApmData[]>>;

  /**
   * Dispatches an action to set the selected APM (Alternative Payment Method).
   *
   * @param {ApmData} apm - The APM data to be set as selected.
   * @since 2211.31.1
   */
  abstract selectApm(apm: ApmData): void;

  /**
   * Retrieves the available APMs (Alternative Payment Methods) from the state.
   *
   * @returns {Observable<ApmData[]>} - An observable containing the list of available APMs.
   * @since 2211.31.1
   */
  abstract getAvailableApmsFromState(): Observable<ApmData[]>;

  /**
   * Retrieves the selected APM (Alternative Payment Method) from the state.
   *
   * @returns {Observable<ApmData>} - An observable containing the selected APM data.
   * @since 2211.31.1
   */
  abstract getSelectedApmFromState(): Observable<ApmData> ;

  /**
   * Retrieves the loading state of APMs (Alternative Payment Methods) from the state.
   *
   * @returns {Observable<boolean>} - An observable containing the loading state of APMs.
   * @since 2211.31.1
   */
  abstract getIsApmLoadingFromState(): Observable<boolean>;

  /** Creates APM (Alternative Payment Method) payment details and dispatches an action to store them.
   *
   * @param {ApmPaymentDetails} apmPaymentDetails - The APM payment details to be created.
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details.
   * @since 2211.31.1
   */
  abstract createApmPaymentDetails(apmPaymentDetails: ApmPaymentDetails): Observable<PaymentDetails>

  /**
   * Retrieves the Klarna initialization parameters by dispatching an action with the user and cart IDs.
   *
   * @returns {Observable<KlarnaInitParams | HttpErrorResponse>} - An observable containing the Klarna initialization parameters or an HTTP error response.
   * @since 2211.31.1
   */
  abstract getKlarnaInitParams(): Observable<KlarnaInitParams | HttpErrorResponse>;
}
