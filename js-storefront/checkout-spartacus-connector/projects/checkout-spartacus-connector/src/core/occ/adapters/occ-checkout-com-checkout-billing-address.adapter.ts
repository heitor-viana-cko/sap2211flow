import { Injectable } from '@angular/core';
import { CheckoutComCheckoutBillingAddressAdapter } from '@checkout-adapters/checkout-com-billing-address/checkout-com-checkout-billing-address.adapter';
import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { OccCheckoutBillingAddressAdapter } from '@spartacus/checkout/base/occ';
import { Address, backOff, HttpErrorModel, isJaloError, tryNormalizeHttpError } from '@spartacus/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class OccCheckoutComCheckoutBillingAddressAdapter extends OccCheckoutBillingAddressAdapter implements CheckoutComCheckoutBillingAddressAdapter {
  /**
   * Retrieves the billing address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {Observable<Address>} An observable that emits the billing address.
   * @throws {HttpErrorModel | Error} Throws a normalized HTTP error if the request fails.
   * @since 2211.32.1
   */
  public requestBillingAddress(
    userId: string,
    cartId: string
  ): Observable<Address> {
    return this.http.get<Address>(this.getRequestBillingAddressEndpoint(userId, cartId)).pipe(
      catchError((error: unknown): Observable<never> =>
        throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger))
      ),
      backOff({
        shouldRetry: isJaloError
      })
    );
  }

  /**
   * Updates the delivery address for the specified user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {Address} address - The ID of the address to set as the delivery address.
   * @returns {Observable<Address>} An observable that emits the updated delivery address.
   * @since 2211.32.1
   */
  public setDeliveryAddressAsBillingAddress(
    userId: string,
    cartId: string,
    address: Address
  ): Observable<Address> {
    return this.http.put<Address>(
      this.getSetDeliveryAddressAsBillingAddressEndpoint(userId, cartId),
      address.id,
      { headers: getHeadersForUserId(userId) }
    ).pipe(
      catchError((error: unknown): Observable<never> =>
        throwError((): HttpErrorModel | Error => tryNormalizeHttpError(error, this.logger))
      ),
      backOff({
        shouldRetry: isJaloError
      })
    );
  }

  /**
   * Constructs the endpoint URL for retrieving the billing address of a specific user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {string} The constructed endpoint URL.
   * @since 2211.32.1
   */
  protected getRequestBillingAddressEndpoint(
    userId: string,
    cartId: string
  ): string {
    return this.occEndpoints.buildUrl('requestBillingAddress', {
      urlParams: {
        userId,
        cartId
      }
    });
  }

  /**
   * Constructs the endpoint URL for setting the delivery address as the billing address
   * for a specific user and cart.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @returns {string} The constructed endpoint URL.
   * @since 2211.32.1
   */
  protected getSetDeliveryAddressAsBillingAddressEndpoint(
    userId: string,
    cartId: string
  ): string {
    return this.occEndpoints.buildUrl('setDeliveryAddressAsBillingAddress', {
      urlParams: {
        userId,
        cartId
      }
    }
    );
  }
}
