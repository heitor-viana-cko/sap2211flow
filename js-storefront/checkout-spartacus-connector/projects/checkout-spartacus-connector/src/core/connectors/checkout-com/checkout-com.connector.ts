import { Injectable } from '@angular/core';
import { CheckoutComAdapter } from '@checkout-adapters/checkout-com/checkout-com.adapter';
import { Observable } from 'rxjs';

@Injectable()
export class CheckoutComConnector {
  /**
   * Constructor for the CheckoutComConnector class.
   *
   * @param {CheckoutComAdapter} adapter - The adapter used for payment operations.
   * @since 2211.31.1
   */
  constructor(
    protected adapter: CheckoutComAdapter
  ) {
  }

  /**
   * Retrieves the merchant key for the given user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<string>} An observable that emits the merchant key.
   * @since 2211.31.1
   */
  public getMerchantKey(userId: string): Observable<string> {
    return this.adapter.getMerchantKey(userId);
  }

  /**
   * Checks if the user has ABC enabled.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<boolean>} An observable that emits a boolean indicating if ABC is enabled.
   * @since 2211.31.1
   */
  public getIsABC(userId: string): Observable<boolean> {
    return this.adapter.getIsABC(userId);
  }
}
