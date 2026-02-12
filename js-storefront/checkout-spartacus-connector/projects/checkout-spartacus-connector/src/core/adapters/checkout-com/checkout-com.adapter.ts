import { Observable } from 'rxjs';

export abstract class CheckoutComAdapter {

  /**
   * Get the merchant key for the current base store
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<string>} An observable that emits the merchant key as a string.
   * @since 4.7.2
   */
  abstract getMerchantKey(userId: string): Observable<string>;

  /**
   * Get the isAbc flag for the current user
   *
   * @param {string} userId - The ID of the user.
   * @returns {Observable<boolean>} An observable that emits a boolean indicating the isAbc flag.
   * @since 4.7.2
   */
  abstract getIsABC(userId: string): Observable<boolean>;
}
