import { inject, TestBed } from '@angular/core/testing';
import { CheckoutComCheckoutBillingAddressConnector } from '@checkout-core/connectors/checkout-com-checkout-billing-address/checkout-com-checkout-billing-address.connector';
import { CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import { CheckoutComCheckoutBillingAddressFacade } from '@checkout-facades/checkout-com-checkout-billing-address.facade';
import { MockCheckoutComCheckoutBillingAddressFacade } from '@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressCreatedEvent, CheckoutDeliveryAddressSetEvent, CheckoutPaymentDetailsCreatedEvent, CheckoutQueryFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  OCC_USER_ID_CURRENT,
  QueryState,
  UserIdService
} from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { of, throwError } from 'rxjs';
import { CheckoutComCheckoutBillingAddressService } from './checkout-com-checkout-billing-address.service';
import createSpy = jasmine.createSpy;

const mockUserId = OCC_USER_ID_CURRENT;
const mockCartId = 'cartID';
const mockAddress: Partial<Address> = {
  id: 'test-address-id'
};

class MockActiveCartService implements Partial<ActiveCartFacade> {
  takeActiveCartId = createSpy().and.returnValue(of(mockCartId));
  isGuestCart = createSpy().and.returnValue(of(false));
}

class MockUserIdService implements Partial<UserIdService> {
  takeUserId = createSpy().and.returnValue(of(mockUserId));
}

class MockCheckoutBillingAddressConnector implements Partial<CheckoutComCheckoutBillingAddressConnector> {
  requestBillingAddress = createSpy().and.returnValue(of('setAddress'));
  setBillingAddress = createSpy().and.returnValue(of({}));
  setDeliveryAddressAsBillingAddress = createSpy().and.returnValue(of({}));
}

class MockCheckoutQueryFacade implements Partial<CheckoutQueryFacade> {
  getCheckoutDetailsState = createSpy().and.returnValue(
    of({
      loading: false,
      error: false,
      data: undefined
    })
  );
}

describe(`CheckoutComCheckoutBillingAddressService`, () => {
  let service: CheckoutComCheckoutBillingAddressService;
  let connector: CheckoutComCheckoutBillingAddressConnector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutComCheckoutBillingAddressService,
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartService
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComCheckoutBillingAddressConnector,
          useClass: MockCheckoutBillingAddressConnector
        },
        {
          provide: CheckoutQueryFacade,
          useClass: MockCheckoutQueryFacade
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    });

    service = TestBed.inject(CheckoutComCheckoutBillingAddressService);
    connector = TestBed.inject(CheckoutComCheckoutBillingAddressConnector);
  });

  it(`should inject CheckoutBillingAddressService`, inject(
    [CheckoutComCheckoutBillingAddressService],
    (checkoutBillingAddressService: CheckoutComCheckoutBillingAddressService) => {
      expect(checkoutBillingAddressService).toBeTruthy();
    }
  ));

  describe('requestBillingAddressReloadOn', () => {
    it('should return an array of query notifiers', () => {
      const result = service.requestBillingAddressReloadOn();
      expect(result).toEqual([
        CheckoutPaymentDetailsCreatedEvent,
        CheckoutDeliveryAddressSetEvent,
        CheckoutDeliveryAddressCreatedEvent,
        CheckoutComBillingAddressUpdatedEvent
      ]);
    });

    it('should return an empty array if no events are defined', () => {
      spyOn(service, 'requestBillingAddressReloadOn').and.returnValue([]);
      const result = service.requestBillingAddressReloadOn();
      expect(result).toEqual([]);
    });
  });

  describe('requestBillingAddressResetOn', () => {
    it('should return an array of reset notifiers', () => {
      const result = service.requestBillingAddressResetOn();
      expect(result).toEqual([OrderPlacedEvent, LogoutEvent, LoginEvent, CheckoutDeliveryAddressSetEvent, CheckoutDeliveryAddressCreatedEvent]);
    });

    it('should return an empty array if no reset events are defined', () => {
      spyOn(service, 'requestBillingAddressResetOn').and.returnValue([]);
      const result = service.requestBillingAddressResetOn();
      expect(result).toEqual([]);
    });
  });

  describe('requestBillingAddress', () => {
    it('should request billing address and set it on success', (doneFn) => {
      const billingAddress = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as Address;
      connector.requestBillingAddress = createSpy().and.returnValue(of(billingAddress));

      service['requestBillingAddress$'].getState().subscribe((state) => {
        expect(state.data).toEqual(billingAddress);
        doneFn();
      });
    });

    it('should handle error when requesting billing address fails', (doneFn) => {
      const error = new Error('error');
      spyOn(service['logger'], 'error');
      connector.requestBillingAddress = createSpy().and.returnValue(throwError(() => error));

      service['requestBillingAddress$'].getState().subscribe({
        next: (response) => {
          expect(response.error).toBe(error);
          doneFn();
        }
      });
    });

    it('should handle undefined state when no billing address is available', (doneFn) => {
      const billingAddress = undefined;
      connector.requestBillingAddress = createSpy().and.returnValue(of(billingAddress));

      service['requestBillingAddress$'].getState().subscribe((state) => {
        expect(state.data).toEqual(undefined);
        doneFn();
      });
    });
  });

  describe('setDeliveryAddressAsBillingAddress', () => {
    const mockQuery = {
      getState: jasmine.createSpy('getState')
    };

    it('should execute the command with the provided address', () => {
      const mockAddress = { id: 'test-address-id' } as Address;
      spyOn(service['setDeliveryAddressAsBillingAddressCommand'], 'execute').and.returnValue(of(mockAddress));

      service.setDeliveryAddressAsBillingAddress(mockAddress);

      expect(service['setDeliveryAddressAsBillingAddressCommand'].execute).toHaveBeenCalledWith({ address: mockAddress });
    });

    it('should return observable from requestBillingAddress$ getState()', (done) => {
      const mockQueryState: QueryState<Address> = {
        loading: false,
        error: false,
        data: mockAddress
      };

      mockQuery.getState.and.returnValue(of(mockQueryState));

      (service as any).requestBillingAddress$ = mockQuery;

      service.requestBillingAddress().subscribe((state) => {
        expect(state).toEqual(mockQueryState);
        expect(state.data).toEqual(mockAddress);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(false);
        expect(mockQuery.getState).toHaveBeenCalled();
        done();
      });
    });

    it('should return observable with loading state', (done) => {
      const mockQueryState: QueryState<Address | undefined> = {
        loading: true,
        error: false,
        data: undefined
      };

      mockQuery.getState.and.returnValue(of(mockQueryState));
      (service as any).requestBillingAddress$ = mockQuery;

      service.requestBillingAddress().subscribe((state) => {
        expect(state.loading).toBe(true);
        expect(state.data).toBeUndefined();
        done();
      });
    });

    it('should handle errors when setting the address fails', (doneFn) => {
      const mockError = new Error('Command failed');
      const mockAddress = { id: 'test-address-id' } as Address;
      const userId = 'user123';
      const cartId = 'cart123';
      service['checkoutComBillingAddressConnector'].setDeliveryAddressAsBillingAddress = createSpy().and.returnValue(throwError(() => mockError));
      spyOn<any>(service, 'handleError').and.callThrough();

      service['checkoutComBillingAddressConnector'].setDeliveryAddressAsBillingAddress(userId, cartId, mockAddress).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          doneFn();
        }
      });
    });
  });

  describe('checkoutPreconditions', () => {
    it('should return userId and cartId when conditions are met', (doneFn) => {
      service['userIdService'].takeUserId = createSpy().and.returnValue(of('user123'));
      service['activeCartFacade'].takeActiveCartId = createSpy().and.returnValue(of('cart123'));
      service['activeCartFacade'].isGuestCart = createSpy().and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe(([userId, cartId]) => {
        expect(userId).toBe('user123');
        expect(cartId).toBe('cart123');
        doneFn();
      });
    });

    it('should throw an error if userId is undefined', (doneFn) => {
      service['userIdService'].takeUserId = createSpy().and.returnValue(of(undefined));
      service['activeCartFacade'].takeActiveCartId = createSpy().and.returnValue(of('cart123'));
      service['activeCartFacade'].isGuestCart = createSpy().and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        error: (error) => {
          expect(error.message).toBe('Checkout conditions not met');
          doneFn();
        }
      });
    });

    it('should throw an error if cartId is undefined', (doneFn) => {
      service['userIdService'].takeUserId = createSpy().and.returnValue(of('user123'));
      service['activeCartFacade'].takeActiveCartId = createSpy().and.returnValue(of(undefined));
      service['activeCartFacade'].isGuestCart = createSpy().and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        error: (error) => {
          expect(error.message).toBe('Checkout conditions not met');
          doneFn();
        }
      });
    });

    it('should throw an error if userId is anonymous and isGuestCart is false', (doneFn) => {
      service['userIdService'].takeUserId = createSpy().and.returnValue(of(OCC_USER_ID_ANONYMOUS));
      service['activeCartFacade'].takeActiveCartId = createSpy().and.returnValue(of('cart123'));
      service['activeCartFacade'].isGuestCart = createSpy().and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        error: (error) => {
          expect(error.message).toBe('Checkout conditions not met');
          doneFn();
        }
      });
    });
  });

  describe('handleError', () => {
    it('should log the error and add a global message with the error details', () => {
      const mockError = { details: [{ message: 'Error occurred' }] } as HttpErrorModel;
      spyOn(service['logger'], 'error');
      spyOn<any>(service, 'handleError').and.callThrough();

      service['handleError'](mockError).subscribe({
        error: (error) => {
          expect(service['logger'].error).toHaveBeenCalledWith('createPaymentDetails with errors', { error: mockError });
          expect(service['globalMessageService'].add).toHaveBeenCalledWith(
            { raw: 'Error occurred' },
            GlobalMessageType.MSG_TYPE_ERROR
          );
          expect(error).toEqual(mockError);
        }
      });
    });

    it('should handle errors without details gracefully', () => {
      const mockError = { details: [{ message: 'Error' }] };
      spyOn(service['logger'], 'error');
      spyOn<any>(service, 'handleError').and.callThrough();

      service['handleError'](mockError).subscribe({
        error: (error) => {
          expect(service['logger'].error).toHaveBeenCalledWith('createPaymentDetails with errors', { error: mockError });
          expect(service['globalMessageService'].add).toHaveBeenCalledWith(
            { raw: 'Error' },
            GlobalMessageType.MSG_TYPE_ERROR
          );
          expect(error).toEqual(mockError);
        }
      });
    });

    it('should handle non-HttpErrorModel errors', () => {
      const mockError: HttpErrorModel = new Error('Some error');
      spyOn(service['logger'], 'error');
      spyOn<any>(service, 'handleError').and.callThrough();

      service['handleError'](mockError).subscribe({
        error: (error) => {
          expect(service['logger'].error).toHaveBeenCalledWith('createPaymentDetails with errors', { error: mockError });
          expect(service['globalMessageService'].add).toHaveBeenCalledWith({ raw: undefined }, GlobalMessageType.MSG_TYPE_ERROR);
          expect(error).toEqual(mockError);
        }
      });
    });
  });
});
