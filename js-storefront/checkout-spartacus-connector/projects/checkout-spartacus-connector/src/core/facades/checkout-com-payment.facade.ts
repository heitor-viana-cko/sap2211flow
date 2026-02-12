import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutPaymentFacade } from '@spartacus/checkout/base/root';
import { Address, facadeFactory, PaymentDetails, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_PAYMENT } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComPaymentFacade =>
    facadeFactory({
      facade: CheckoutComPaymentFacade,
      feature: CHECKOUT_COM_PAYMENT,
      methods: [
        'getOccMerchantKeyFromState',
        'requestOccMerchantConfiguration',
        'canSaveCard',
        'getPaymentDetailsFromState',
        'createPaymentDetails',
        'getPaymentAddressFromState',
        'updatePaymentAddress',
        'setPaymentAddress',
        'updatePaymentDetails',
        'getIsABC',
        'getIsABCFromState',
        'getPaymentDetailsState'
      ]
    })
})
export abstract class CheckoutComPaymentFacade extends CheckoutPaymentFacade {
  /**
   * Retrieves the OCC merchant key from the state.
   *
   * @returns {Observable<string>} - An observable containing the OCC merchant key.
   * @since 2211.30.1
   */
  abstract getOccMerchantKeyFromState(): Observable<string>;

  /**
   * Dispatches an action to request the OCC merchant configuration for the given user ID.
   *
   * @param {string} userId - The ID of the user for whom the merchant configuration is requested.
   * @returns {Observable<string>} - An observable containing the merchant configuration.
   * @since 2211.32.1
   */
  abstract requestOccMerchantConfiguration(userId: string): Observable<string>;

  /**
   * Checks if the card can be saved based on the user ID.
   *
   * @param {string} userId - The ID of the user.
   * @returns {boolean} - Returns true if the card can be saved, false otherwise.
   * @since 2211.30.1
   */
  abstract canSaveCard(userId: string): boolean;

  /**
   * Retrieves the payment details from the state.
   *
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details or an error.
   * @since 2211.30.1
   */
  abstract getPaymentDetailsFromState(): Observable<PaymentDetails>;

  /**
   * Creates payment details and dispatches an action to store them.
   *
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be created.
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details.
   * @since 2211.30.1
   */
  abstract override createPaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<PaymentDetails>;

  /**
   * Retrieves the payment address from the state.
   *
   * @returns {Observable<Address>} - An observable containing the payment address or an error.
   * @since 2211.30.1
   */
  abstract getPaymentAddressFromState(): Observable<Address>;

  /**
   * Updates the payment address and dispatches an action to store it.
   *
   * @param {Address} address - The payment address to be updated.
   * @returns {Observable<Address>} - An observable containing the updated payment address.
   * @since 2211.30.1
   */
  abstract updatePaymentAddress(address: Address): Observable<Address>;

  /**
   * Dispatches an action to set the payment address.
   *
   * @param {Address} address - The payment address to be set.
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @since 2211.30.1
   */
  abstract setPaymentAddress(address: Address, userId: string, cartId: string): void;

  /**
   * Updates the payment details and dispatches an action to store them.
   *
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be updated.
   * @returns {Observable<HttpResponse<void>>} - An observable that completes when the action is dispatched.
   * @since 2211.30.1
   */
  abstract updatePaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<HttpResponse<void>>;

  /**
   * Dispatches an action to set the OCC IsABC flag for the given user ID.
   *
   * @since 2211.30.1
   */
  abstract getIsABC(): Observable<QueryState<boolean>>;

  /**
   * Retrieves the OCC IsABC flag from the state.
   *
   * @returns {Observable<boolean>} - An observable containing the OCC IsABC flag.
   * @since 2211.30.1
   */
  abstract getIsABCFromState(): Observable<boolean>;

  /**
   * Returns the payment details state
   *
   * @returns {Observable<QueryState<PaymentDetails | undefined>>} - An observable containing the payment details state.
   * @since 2211.30.1
   */
  abstract override getPaymentDetailsState(): Observable<QueryState<PaymentDetails | undefined>>;
}
