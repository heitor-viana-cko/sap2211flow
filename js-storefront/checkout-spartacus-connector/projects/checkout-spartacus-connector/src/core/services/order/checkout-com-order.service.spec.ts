import { TestBed } from '@angular/core/testing';
import { CheckoutComOrderConnector } from '@checkout-core/connectors/checkout-com-order/checkout-com-order.connector';
import { CheckoutComOrderPlacedEvent } from '@checkout-core/events/checkout-order.events';
import { CheckoutComRedirect } from '@checkout-core/interfaces';
import { ActiveCartFacade, OrderEntry } from '@spartacus/cart/base/root';
import { EventService, LoggerService, OCC_USER_ID_CURRENT, UserIdService } from '@spartacus/core';
import { OrderConnector } from '@spartacus/order/core';
import { Order, OrderPlacedEvent } from '@spartacus/order/root';
import { EMPTY, of, take, throwError } from 'rxjs';

import { CheckoutComOrderService } from './checkout-com-order.service';
import createSpy = jasmine.createSpy;

const mockUserId = OCC_USER_ID_CURRENT;
const mockCartId = 'cartID';
const termsChecked = true;
const mockOrder: Order = { code: 'mockOrderCode' };

class MockActiveCartService implements Partial<ActiveCartFacade> {
  takeActiveCartId = createSpy().and.returnValue(of(mockCartId));
  isGuestCart = createSpy().and.returnValue(of(false));
}

class MockUserIdService implements Partial<UserIdService> {
  takeUserId = createSpy().and.returnValue(of(mockUserId));
}

class MockOrderConnector implements Partial<OrderConnector> {
  placeOrder () {
    return of(mockOrder);
  }

  authorizeRedirectPlaceOrder() {
    return of(mockOrder);
  }
}

class MockEventService implements Partial<EventService> {
  get = createSpy().and.returnValue(EMPTY);
  dispatch = createSpy();
}

describe('CheckoutComCheckoutService', () => {
  let service: CheckoutComOrderService;
  let userIdService: UserIdService;
  let activeCartFacade: ActiveCartFacade;
  let connector: CheckoutComOrderConnector;
  let eventService: EventService;
  let logger: LoggerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LoggerService,
        CheckoutComOrderService,
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartService
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: CheckoutComOrderConnector,
          useClass: MockOrderConnector,
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
      ],
    });

    service = TestBed.inject(CheckoutComOrderService);

    service = TestBed.inject(CheckoutComOrderService);
    connector = TestBed.inject(CheckoutComOrderConnector);
    eventService = TestBed.inject(EventService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    userIdService = TestBed.inject(UserIdService);
    logger = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`getOrderDetails`, () => {
    it(`should return falsy when there's no order`, (done) => {
      service.getOrderDetails().pipe(
        take(1)
      ).subscribe((result) => {
        expect(result).toBeFalsy();
        done();
      });
    });

    it(`should return an order when it is placed`, (done) => {
      service.placeOrder(termsChecked);

      service.getOrderDetails().pipe(
        take(1)
      ).subscribe((result) => {
        expect(result).toEqual(mockOrder);
        done();
      });
    });
  });

  describe(`clearPlacedOrder`, () => {
    it(`should clear the order`, (done) => {
      service.placeOrder(termsChecked);
      service.clearPlacedOrder();

      service
        .getOrderDetails()
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(undefined);
          done();
        });
    });
  });

  describe('getPickupEntries and getDeliveryEntries', () => {
    const entries: OrderEntry[] = [
      {
        orderCode: 'pickupEntry',
        deliveryPointOfService: { name: 'test' }
      },
      { orderCode: 'deliveryEntry' },
    ];

    it('should be able to get pickup entries', (done) => {
      service.getOrderDetails = jasmine
        .createSpy('getOrderDetails')
        .and.returnValue(of({
          code: 'testOrder',
          entries
        }));

      service.getPickupEntries().subscribe((pickupEntries) => {
        expect(pickupEntries.length).toEqual(1);
        expect(pickupEntries[0].orderCode).toEqual('pickupEntry');
        done();
      });
    });

    it('should be able to get delivery entries', (done) => {
      service.getOrderDetails = jasmine
        .createSpy('getOrderDetails')
        .and.returnValue(of({
          code: 'testOrder',
          entries
        }));

      service.getDeliveryEntries().subscribe((deliveryEntries) => {
        expect(deliveryEntries.length).toEqual(1);
        expect(deliveryEntries[0].orderCode).toEqual('deliveryEntry');
        done();
      });
    });
  });

  describe('getCheckoutComOrderPlacedValue', () => {
    it('should return the current value of checkoutComOrderPlaced$', () => {
      const event: CheckoutComOrderPlacedEvent = {
        order: { code: 'orderCode' },
        successful: true,
        redirect: null,
        httpError: null,
      };

      service.setCheckoutComOrderPlacedValue(event);

      expect(service.getCheckoutComOrderPlacedValue()).toEqual(event);
    });

    it('should return null if checkoutComOrderPlaced$ is not set', () => {
      service.setCheckoutComOrderPlacedValue(null);

      expect(service.getCheckoutComOrderPlacedValue()).toBeNull();
    });
  });

  describe('setCheckoutComOrderPlacedValue', () => {
    it('should set the checkoutComOrderPlaced$ value', () => {
      const event: CheckoutComOrderPlacedEvent = {
        order: { code: 'orderCode' },
        successful: true,
        redirect: null,
        httpError: null,
      };

      service.setCheckoutComOrderPlacedValue(event);

      expect(service.getCheckoutComOrderPlacedValue()).toEqual(event);
    });

    it('should set the checkoutComOrderPlaced$ value to null', () => {
      service.setCheckoutComOrderPlacedValue(null);

      expect(service.getCheckoutComOrderPlacedValue()).toBeNull();
    });
  });

  describe('onCheckoutComOrderPlaced', () => {

    it('should set placed order and dispatch events', () => {
      const userId = 'user123';
      const cartId = 'cart123';
      const order: Order = { code: 'order123' };

      spyOn(service, 'setPlacedOrder').and.callThrough();
      service.onCheckoutComOrderPlaced(userId, cartId, order);

      expect(service.setPlacedOrder).toHaveBeenCalledWith(order);
      expect(eventService.dispatch).toHaveBeenCalledWith(
        {
          userId,
          cartId,
          cartCode: cartId,
          order,
        },
        OrderPlacedEvent
      );
      expect(eventService.dispatch).toHaveBeenCalledWith(
        service.getCheckoutComOrderPlacedValue(),
        CheckoutComOrderPlacedEvent
      );
    });

    it('should handle null order', () => {
      const userId = 'user123';
      const cartId = 'cart123';
      const order: Order = null;
      spyOn(service, 'setPlacedOrder').and.callThrough();
      service.onCheckoutComOrderPlaced(userId, cartId, order);

      expect(service.setPlacedOrder).toHaveBeenCalledWith(order);
      expect(eventService.dispatch).toHaveBeenCalledWith(
        {
          userId,
          cartId,
          cartCode: cartId,
          order,
        },
        OrderPlacedEvent
      );
      expect(eventService.dispatch).toHaveBeenCalledWith(
        service.getCheckoutComOrderPlacedValue(),
        CheckoutComOrderPlacedEvent
      );
    });

    it('should handle empty userId and cartId', () => {
      const userId = '';
      const cartId = '';
      const order: Order = { code: 'order123' };
      spyOn(service, 'setPlacedOrder').and.callThrough();
      service.onCheckoutComOrderPlaced(userId, cartId, order);

      expect(service.setPlacedOrder).toHaveBeenCalledWith(order);
      expect(eventService.dispatch).toHaveBeenCalledWith(
        {
          userId,
          cartId,
          cartCode: cartId,
          order,
        },
        OrderPlacedEvent
      );
      expect(eventService.dispatch).toHaveBeenCalledWith(
        service.getCheckoutComOrderPlacedValue(),
        CheckoutComOrderPlacedEvent
      );
    });
  });

  describe('authorizeOrder', () => {

    it('should authorize order and return true when order is created successfully', (done) => {
      const sessionId = 'session123';
      const mockOrder: Order = { code: 'order123' };

      // @ts-ignore
      spyOn(service.authorizeOrderCommand$, 'execute').and.returnValue(of(mockOrder));
      spyOn(service, 'getOrderDetails').and.returnValue(of(mockOrder));

      service.authorizeOrder(sessionId).subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should authorize order and return false when order is not created', (done) => {
      const sessionId = 'session123';
      // @ts-ignore
      spyOn(service.authorizeOrderCommand$, 'execute').and.returnValue(of(null));
      spyOn(service, 'getOrderDetails').and.returnValue(of(null));

      service.authorizeOrder(sessionId).subscribe({
        next: (result) => {
          expect(result).toBeFalse();
          done();
        },
        error: (err) => {
          expect(err).toBeFalse();
          done();
        }
      });
    });

    it('should handle error during order authorization', (done) => {
      const sessionId = 'session123';
      // @ts-ignore
      spyOn(service.authorizeOrderCommand$, 'execute').and.returnValue(throwError(() => 'Error'));
      spyOn(service, 'getOrderDetails').and.returnValue(of(null));
      spyOn(service['logger'], 'error');
      service.authorizeOrder(sessionId).subscribe({
        next: (result) => {
          expect(result).toBeFalse();
          done();
        },
        error: (err) => {
          expect(err).toBeTruthy();
          expect(service['logger'].error).toHaveBeenCalledWith('CheckoutComOrderService AuthorizeOrder error', { error: err });
          done();
        }
      });
    });
  });

  describe('getOrderResultFromState', () => {
    it('should return an observable of the current checkoutComOrderPlaced$ value', (done) => {
      const event: CheckoutComOrderPlacedEvent = {
        order: { code: 'orderCode' },
        successful: true,
        redirect: null,
        httpError: null,
      };

      service.setCheckoutComOrderPlacedValue(event);

      service.getOrderResultFromState().subscribe((result) => {
        expect(result).toEqual(event);
        done();
      });
    });

    it('should return an observable of null if checkoutComOrderPlaced$ is not set', (done) => {
      service.setCheckoutComOrderPlacedValue(null);

      service.getOrderResultFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('authorizeOrderCommand$', () => {
    it('should authorize order and call onCheckoutComOrderPlaced with correct parameters', (done) => {
      const sessionId = 'session123';
      const userId = 'user123';
      const cartId = 'cart123';
      const mockOrder: Order = { code: 'order123' };

      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'authorizeRedirectPlaceOrder').and.returnValue(of(mockOrder));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();
      // @ts-ignore
      service.authorizeOrderCommand$.execute(sessionId).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(service.onCheckoutComOrderPlaced).toHaveBeenCalledWith(userId, cartId, mockOrder);
        done();
      });
    });

    it('should handle error during order authorization', (done) => {
      const sessionId = 'session123';
      const userId = 'user123';
      const cartId = 'cart123';

      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'authorizeRedirectPlaceOrder').and.returnValue(throwError(() => 'Error'));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();

      // @ts-ignore
      service.authorizeOrderCommand$.execute(sessionId).subscribe({
        next: () => fail('Expected error, but got success response'),
        error: (error) => {
          expect(error).toBe('Error');
          expect(service.onCheckoutComOrderPlaced).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should cancel previous command execution if a new one is triggered', (done) => {
      const sessionId1 = 'session123';
      const sessionId2 = 'session456';
      const userId = 'user123';
      const cartId = 'cart123';
      const mockOrder: Order = { code: 'order123' };

      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'authorizeRedirectPlaceOrder').and.returnValue(of(mockOrder));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();
      // @ts-ignore
      service.authorizeOrderCommand$.execute(sessionId1).subscribe();
      // @ts-ignore
      service.authorizeOrderCommand$.execute(sessionId2).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(service.onCheckoutComOrderPlaced).toHaveBeenCalledWith(userId, cartId, mockOrder);
        done();
      });
    });
  });

  describe('placeOrderCommand$', () => {
    it('should place order and call onCheckoutComOrderPlaced with correct parameters', (done) => {
      const termsChecked = true;
      const userId = 'user123';
      const cartId = 'cart123';
      const mockOrder: Order = { code: 'order123' };

      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'placeOrder').and.returnValue(of(mockOrder));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();

      // @ts-ignore
      service.placeOrderCommand.execute(termsChecked).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(service.onCheckoutComOrderPlaced).toHaveBeenCalledWith(userId, cartId, mockOrder);
        done();
      });
    });

    it('should handle redirect during order placement', (done) => {
      const termsChecked = true;
      const userId = 'user123';
      const cartId = 'cart123';
      const mockRedirect: CheckoutComRedirect = {
        redirectUrl: 'https://redirect.url',
        type: 'redirect'
      };

      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'placeOrder').and.returnValue(of(mockRedirect as Order));
      spyOn(service, 'onCheckoutComRedirect').and.callThrough();

      // @ts-ignore
      service.placeOrderCommand.execute(termsChecked).subscribe((order) => {
        expect(order).toEqual(mockRedirect as Order);
        expect(service.onCheckoutComRedirect).toHaveBeenCalledWith(mockRedirect);
        done();
      });
    });

    it('should handle error during order placement', (done) => {
      const termsChecked = true;
      const userId = 'user123';
      const cartId = 'cart123';
      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'placeOrder').and.returnValue(throwError(() => 'Error'));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();
      spyOn(logger, 'error');

      // @ts-ignore
      service.placeOrderCommand.execute(termsChecked).subscribe({
        next: () => fail('Expected error, but got success response'),
        error: (error) => {
          expect(error).toBe('Error');
          expect(service.onCheckoutComOrderPlaced).not.toHaveBeenCalled();
          expect(logger.error).toHaveBeenCalledWith('Error')
          done();
        }
      });
    });

    it('should cancel previous command execution if a new one is triggered', (done) => {
      const termsChecked1 = true;
      const termsChecked2 = false;
      const userId = 'user123';
      const cartId = 'cart123';
      const mockOrder: Order = { code: 'order123' };
      // @ts-ignore
      spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
      spyOn(connector, 'placeOrder').and.returnValues(of(mockOrder), of(mockOrder));
      spyOn(service, 'onCheckoutComOrderPlaced').and.callThrough();

      // @ts-ignore
      service.placeOrderCommand.execute(termsChecked1).subscribe();
      // @ts-ignore
      service.placeOrderCommand.execute(termsChecked2).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(service.onCheckoutComOrderPlaced).toHaveBeenCalledWith(userId, cartId, mockOrder);
        done();
      });
    });
  });
});
