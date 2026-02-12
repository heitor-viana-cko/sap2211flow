import { of } from 'rxjs';
import { ActiveCartService, getCartIdByUserId } from '@spartacus/cart/base/core';
import { ActiveCartFacade, Cart } from '@spartacus/cart/base/root';
import { UserIdService } from '@spartacus/core';
import { getUserIdCartId } from './get-user-cart-id';

describe('getUserIdCartId', () => {
  let userIdService: jasmine.SpyObj<UserIdService>;
  let activeCartService: jasmine.SpyObj<ActiveCartFacade | ActiveCartService>;
  let mockCart: Cart;
  let mockUserId: string;

  beforeEach(() => {
    userIdService = jasmine.createSpyObj('UserIdService', ['getUserId']);
    activeCartService = jasmine.createSpyObj('ActiveCartFacade', ['getActive']);

    mockCart = { code: 'cart123' } as Cart; // Mock cart object
    mockUserId = 'user123';
  });

  it('should return an object with userId and cartId when both are available', (done) => {
    activeCartService.getActive.and.returnValue(of(mockCart));
    userIdService.getUserId.and.returnValue(of(mockUserId));

    // @ts-ignore
    spyOn(getCartIdByUserId, 'bind').and.callFake(() => {
      return (cart: Cart, userId: string) => cart.code; // Simulate `getCartIdByUserId` logic
    });

    getUserIdCartId(userIdService, activeCartService).subscribe((result) => {
      expect(result).toEqual({
        userId: mockUserId,
        cartId: mockCart.code,
      });
      done();
    });
  });

  it('should complete and return nothing if userId is missing', (done) => {
    activeCartService.getActive.and.returnValue(of(mockCart));
    userIdService.getUserId.and.returnValue(of(null));

    getUserIdCartId(userIdService, activeCartService).subscribe({
      next: (response) => {
        expect(response.userId).toBeNull();
        expect(response.cartId).toBe(mockCart.code);
      },
      complete: () => {
        expect(activeCartService.getActive).toHaveBeenCalled();
        expect(userIdService.getUserId).toHaveBeenCalled();
        done();
      },
    });
  });
});