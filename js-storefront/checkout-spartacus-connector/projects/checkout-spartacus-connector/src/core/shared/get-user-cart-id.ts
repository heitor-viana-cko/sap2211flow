import { ActiveCartService, getCartIdByUserId } from '@spartacus/cart/base/core';
import { ActiveCartFacade, Cart } from '@spartacus/cart/base/root';
import { UserIdService } from '@spartacus/core';
import { Observable } from 'rxjs';
import { first, map, take, withLatestFrom } from 'rxjs/operators';

/**
 * Retrieves the user ID and cart ID for the active cart.
 *
 * @param {UserIdService} userIdService - The service to get the user ID.
 * @param {ActiveCartFacade | ActiveCartService} activeCartService - The service to get the active cart.
 * @returns {Observable<{ userId: string, cartId: string }>} - An observable emitting an object containing the user ID and cart ID.
 */
export function getUserIdCartId(
  userIdService: UserIdService,
  activeCartService: ActiveCartFacade | ActiveCartService,
): Observable<{ userId: string, cartId: string }> {
  return activeCartService.getActive().pipe(
    first((cart: Cart): boolean => cart != null && typeof cart === 'object' && Object.keys(cart).length > 0),
    withLatestFrom(userIdService.getUserId()),
    map(([cart, userId]: [Cart, string]): { cartId: string, userId: string } => ({
      userId,
      cartId: getCartIdByUserId(cart, userId)
    })),
    take(1)
  );
}
