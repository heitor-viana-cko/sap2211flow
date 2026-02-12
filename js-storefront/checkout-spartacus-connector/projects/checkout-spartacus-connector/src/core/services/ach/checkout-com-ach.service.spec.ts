import { TestBed } from '@angular/core/testing';
import { CheckoutComAchConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-ach.connector';
import { CheckoutComApmAchRequestPlaidLinkTokeSetEvent, CheckoutComApmAchRequestPlaidSuccessOrderSetEvent } from '@checkout-core/events/apm-ach.events';
import { AccountMeta, AchSuccessMetadata } from '@checkout-model/Ach';
import { CheckoutComOrderService } from '@checkout-services/order/checkout-com-order.service';
import { generateAccountMeta, generateAchSuccessMetadata, generateInstitutionMeta } from '@checkout-tests/fake-data/apm-ach/apm-ach.mock';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import {
  CommandService,
  EventService,
  GlobalMessageService,
  GlobalMessageType,
  OCC_USER_ID_ANONYMOUS,
  QueryService,
  QueryState,
  Translatable,
  UserIdService
} from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable, of, throwError } from 'rxjs';
import { CheckoutComAchService } from './checkout-com-ach.service';
import createSpy = jasmine.createSpy;

const userId = 'testUserId';
const cartId = 'testCartId';
const publicToken = 'public-sandbox-294f20db-2531-44a6-a2f0-136506c963a6';
const orderSuccess: Order = generateOrder();

const institutionMeta = generateInstitutionMeta();
const accountMeta: AccountMeta = generateAccountMeta();
const metadata: AchSuccessMetadata = generateAchSuccessMetadata(institutionMeta, [accountMeta]);
let customerConsents = true;

describe('CheckoutComAchService', () => {
  let checkoutComAchService: CheckoutComAchService;
  let activeCartFacade: ActiveCartFacade;
  let userIdService: jasmine.SpyObj<UserIdService>;
  let globalMessageService: GlobalMessageService;
  let eventService: EventService;
  let commandService: CommandService;
  let queryService: QueryService;
  let orderService: jasmine.SpyObj<CheckoutComOrderService>;
  let checkoutComAchConnector: jasmine.SpyObj<CheckoutComAchConnector>;

  beforeEach(() => {
    class ActiveCartServiceStub implements Partial<ActiveCartFacade> {
      cartId = cartId;

      public takeActiveCartId() {
        return of(this.cartId);
      }

      isGuestCart(): Observable<boolean> {
        return of(false);
      }
    }

    class UserIdServiceStub implements Partial<UserIdService> {
      takeUserId = createSpy('getUserId').and.returnValue(of(userId));
    }

    class MockGlobalMessageService implements Partial<GlobalMessageService> {
      add(text: string | Translatable, type: GlobalMessageType, timeout?: number): void {
      }
    }

    const spyOrderService = jasmine.createSpyObj('OrderService', ['setPlacedOrder', 'getOrderDetails']);
    const spyCheckoutComAchConnector = jasmine.createSpyObj('CheckoutComAchConnector', ['getAchLinkToken', 'setAchOrderSuccess']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EventService,
        CommandService,
        QueryService,
        {
          provide: ActiveCartFacade,
          useClass: ActiveCartServiceStub
        },
        {
          provide: UserIdService,
          useClass: UserIdServiceStub
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComOrderService,
          useValue: spyOrderService
        },
        {
          provide: CheckoutComAchConnector,
          useValue: spyCheckoutComAchConnector
        }
      ]
    });

    checkoutComAchService = TestBed.inject(CheckoutComAchService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    userIdService = TestBed.inject(UserIdService) as jasmine.SpyObj<UserIdService>;
    globalMessageService = TestBed.inject(GlobalMessageService);
    eventService = TestBed.inject(EventService);
    commandService = TestBed.inject(CommandService);
    queryService = TestBed.inject(QueryService);
    orderService = TestBed.inject(CheckoutComOrderService) as jasmine.SpyObj<CheckoutComOrderService>;
    checkoutComAchConnector = TestBed.inject(CheckoutComAchConnector) as jasmine.SpyObj<CheckoutComAchConnector>;
  });

  it('should be created', () => {
    expect(checkoutComAchService).toBeTruthy();
  });

  describe('requestPlaidLinkToken', () => {
    it('should return the Plaid Link token state', (done) => {
      const queryState: QueryState<string> = {
        data: 'link-sandbox-123',
        loading: false,
        error: false
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService.requestPlaidLinkToken().subscribe((state) => {
        expect(state).toEqual(queryState);
        done();
      });
    });

    it('should handle empty token state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: false,
        error: false
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService.requestPlaidLinkToken().subscribe((state) => {
        expect(state.data).toBe('');
        done();
      });
    });

    it('should handle loading state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: true,
        error: false
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService.requestPlaidLinkToken().subscribe((state) => {
        expect(state.loading).toBeTrue();
        done();
      });
    });

    it('should handle error state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: false,
        error: new Error('error')
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService.requestPlaidLinkToken().subscribe((state) => {
        expect(state.error).toBeTruthy();
        done();
      });
    });
  });

  describe('getPlaidLinkToken', () => {
    it('should return the Plaid Link token', (done) => {
      const queryState: QueryState<string> = {
        data: 'link-sandbox-123',
        loading: false,
        error: false
      };
      spyOn(checkoutComAchService, 'requestPlaidLinkToken').and.returnValue(of(queryState));

      checkoutComAchService.getPlaidLinkToken().subscribe((token) => {
        expect(token).toBe('link-sandbox-123');
        done();
      });
    });

    it('should return an empty string if token is not available', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: false,
        error: false
      };
      spyOn(checkoutComAchService, 'requestPlaidLinkToken').and.returnValue(of(queryState));

      checkoutComAchService.getPlaidLinkToken().subscribe((token) => {
        expect(token).toBe('');
        done();
      });
    });

    it('should handle loading state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: true,
        error: false
      };
      spyOn(checkoutComAchService, 'requestPlaidLinkToken').and.returnValue(of(queryState));

      checkoutComAchService.getPlaidLinkToken().subscribe((token) => {
        expect(token).toBe('');
        done();
      });
    });

    it('should handle error state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: false,
        error: new Error('error')
      };
      spyOn(checkoutComAchService, 'requestPlaidLinkToken').and.returnValue(of(queryState));

      checkoutComAchService.getPlaidLinkToken().subscribe((token) => {
        expect(token).toBe('');
        done();
      });
    });
  });

  describe('setPlaidLinkMetadata', () => {
    it('should set the Plaid Link metadata', () => {
      checkoutComAchService.setPlaidLinkMetadata(metadata);

      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toEqual(metadata);
      });
    });

    it('should handle null metadata', () => {
      checkoutComAchService.setPlaidLinkMetadata(null);

      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toBeNull();
      });
    });

    it('should update metadata when called multiple times', () => {
      const institutionMeta2 = generateInstitutionMeta();
      const accountMeta2: AccountMeta = generateAccountMeta();
      const metadata2: AchSuccessMetadata = generateAchSuccessMetadata(institutionMeta2, [accountMeta2]);

      checkoutComAchService.setPlaidLinkMetadata(metadata);
      checkoutComAchService.setPlaidLinkMetadata(metadata2);

      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toEqual(metadata2);
      });
    });
  });

  describe('getPlaidLinkMetadata', () => {
    it('should return the Plaid Link metadata', (done) => {
      checkoutComAchService.setPlaidLinkMetadata(metadata);

      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toEqual(metadata);
        done();
      });
    });

    it('should return null if metadata is not set', (done) => {
      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should return updated metadata when set multiple times', (done) => {
      const institutionMeta2 = generateInstitutionMeta();
      const accountMeta2: AccountMeta = generateAccountMeta();
      const metadata2: AchSuccessMetadata = generateAchSuccessMetadata(institutionMeta2, [accountMeta2]);

      checkoutComAchService.setPlaidLinkMetadata(metadata);
      checkoutComAchService.setPlaidLinkMetadata(metadata2);

      checkoutComAchService.getPlaidLinkMetadata().subscribe((result) => {
        expect(result).toEqual(metadata2);
        done();
      });
    });
  });

  describe('requestPlaidSuccessOrder', () => {
    it('should request Plaid success order and return the order', (done) => {
      const order: Order = generateOrder();
      spyOn(checkoutComAchService['requestPlaidSuccessOrderCommand$'], 'execute').and.returnValue(of(order));
      spyOn(eventService, 'dispatch').and.callThrough();

      checkoutComAchService.requestPlaidSuccessOrder(publicToken, metadata, customerConsents).subscribe((result) => {
        expect(result).toEqual(order);
        done();
      });
    });

    it('should handle error when requesting Plaid success order', (done) => {
      const error = new Error('error');
      spyOn(checkoutComAchService['requestPlaidSuccessOrderCommand$'], 'execute').and.returnValue(throwError(() => error));

      checkoutComAchService.requestPlaidSuccessOrder(publicToken, metadata, customerConsents).subscribe({
        next: () => fail('expected an error, not order'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should handle null metadata when requesting Plaid success order', (done) => {
      const order: Order = generateOrder();
      spyOn(checkoutComAchService['requestPlaidSuccessOrderCommand$'], 'execute').and.returnValue(of(order));

      checkoutComAchService.requestPlaidSuccessOrder(publicToken, null, customerConsents).subscribe((result) => {
        expect(result).toEqual(order);
        done();
      });
    });

    it('should handle false customer consents when requesting Plaid success order', (done) => {
      const order: Order = generateOrder();
      spyOn(checkoutComAchService['requestPlaidSuccessOrderCommand$'], 'execute').and.returnValue(of(order));

      checkoutComAchService.requestPlaidSuccessOrder(publicToken, metadata, false).subscribe((result) => {
        expect(result).toEqual(order);
        done();
      });
    });
  });

  describe('getPlaidOrder', () => {
    it('should return the ACH success order', (done) => {
      const order: Order = generateOrder();
      orderService.getOrderDetails.and.returnValue(of(order));

      checkoutComAchService.getPlaidOrder().subscribe((result) => {
        expect(result).toEqual(order);
        done();
      });
    });

    it('should handle empty order', (done) => {
      orderService.getOrderDetails.and.returnValue(of(null));

      checkoutComAchService.getPlaidOrder().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle error when retrieving order', (done) => {
      const error = new Error('error');
      orderService.getOrderDetails.and.returnValue(throwError(() => error));

      checkoutComAchService.getPlaidOrder().subscribe({
        next: () => fail('expected an error, not order'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('checkoutPreconditions', () => {
    it('should return userId and cartId if conditions are met', (done) => {
      userIdService.takeUserId.and.returnValue(of(userId));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of(cartId));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(false));

      checkoutComAchService['checkoutPreconditions']().subscribe(([resultUserId, resultCartId]) => {
        expect(resultUserId).toBe(userId);
        expect(resultCartId).toBe(cartId);
        done();
      });
    });

    it('should throw error if userId is not available', (done) => {
      userIdService.takeUserId.and.returnValue(of(null));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of(cartId));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(false));

      checkoutComAchService['checkoutPreconditions']().subscribe({
        next: () => fail('expected an error, not userId and cartId'),
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should throw error if cartId is not available', (done) => {
      userIdService.takeUserId.and.returnValue(of(userId));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of(null));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(false));

      checkoutComAchService['checkoutPreconditions']().subscribe({
        next: () => fail('expected an error, not userId and cartId'),
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should throw error if userId is anonymous and cart is not guest', (done) => {
      userIdService.takeUserId.and.returnValue(of(OCC_USER_ID_ANONYMOUS));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of(cartId));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(false));

      checkoutComAchService['checkoutPreconditions']().subscribe({
        next: () => fail('expected an error, not userId and cartId'),
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should return userId and cartId if userId is anonymous and cart is guest', (done) => {
      userIdService.takeUserId.and.returnValue(of(OCC_USER_ID_ANONYMOUS));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of(cartId));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(true));

      checkoutComAchService['checkoutPreconditions']().subscribe(([resultUserId, resultCartId]) => {
        expect(resultUserId).toBe(OCC_USER_ID_ANONYMOUS);
        expect(resultCartId).toBe(cartId);
        done();
      });
    });
  });

  describe('requestPlaidLinkTokenQuery$', () => {
    it('should return the Plaid Link token', (done) => {
      const token = 'link-sandbox-123';
      checkoutComAchConnector.getAchLinkToken.and.returnValue(of(token));
      spyOn(checkoutComAchService['eventService'], 'dispatch').and.callThrough();

      checkoutComAchService['requestPlaidLinkTokenQuery$'].getState().subscribe((state) => {
        expect(state.data).toBe(token);
        expect(checkoutComAchService['eventService'].dispatch).toHaveBeenCalledWith({ token }, CheckoutComApmAchRequestPlaidLinkTokeSetEvent);
        done();
      });
    });

    it('should handle empty token', (done) => {
      checkoutComAchConnector.getAchLinkToken.and.returnValue(of(''));

      checkoutComAchService['requestPlaidLinkTokenQuery$'].getState().subscribe((state) => {
        expect(state.data).toBe('');
        done();
      });
    });

    it('should handle loading state', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: true,
        error: false
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService['requestPlaidLinkTokenQuery$'].getState().subscribe((state) => {
        expect(state.loading).toBeTrue();
        done();
      });
    });

    it('should handle reset events', (done) => {
      const queryState: QueryState<string> = {
        data: '',
        loading: false,
        error: false
      };
      spyOn(checkoutComAchService['requestPlaidLinkTokenQuery$'], 'getState').and.returnValue(of(queryState));

      checkoutComAchService['requestPlaidLinkTokenQuery$'].getState().subscribe((state) => {
        expect(state).toEqual(queryState);
        done();
      });
    });
  });

  describe('requestPlaidSuccessOrderCommand$', () => {
    it('should request Plaid success order and return the order', (done) => {
      const order: Order = generateOrder();
      checkoutComAchConnector.setAchOrderSuccess.and.returnValue(of(order));
      spyOn(eventService, 'dispatch').and.callThrough();

      checkoutComAchService['requestPlaidSuccessOrderCommand$'].execute({
        publicToken,
        metadata,
        customerConsents
      }).subscribe((result) => {
        expect(orderService.setPlacedOrder).toHaveBeenCalledWith(order);
        expect(result).toEqual(order);
        expect(eventService.dispatch).toHaveBeenCalledWith({ order: order }, CheckoutComApmAchRequestPlaidSuccessOrderSetEvent);
        done();
      });
    });

    it('should handle error when requesting Plaid success order', (done) => {
      const error = new Error('error');
      checkoutComAchConnector.setAchOrderSuccess.and.returnValue(throwError(() => error));

      checkoutComAchService['requestPlaidSuccessOrderCommand$'].execute({
        publicToken,
        metadata,
        customerConsents
      }).subscribe({
        next: () => fail('expected an error, not order'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });
});

