import { TestBed } from '@angular/core/testing';
import { CheckoutComOrderAdapter } from '@checkout-adapters/checkout-com-order/checkout-com-order.adapter';
import { CheckoutComOrderConnector } from '@checkout-core/connectors/checkout-com-order/checkout-com-order.connector';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { Order } from '@spartacus/order/root';
import { of, throwError } from 'rxjs';

describe('CheckoutComOrderConnector', () => {
  let service: CheckoutComOrderConnector;
  let adapter: jasmine.SpyObj<CheckoutComOrderAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComOrderAdapter', ['placeOrder', 'authorizeRedirectPlaceOrder']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComOrderConnector,
        {
          provide: CheckoutComOrderAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComOrderConnector);
    adapter = TestBed.inject(CheckoutComOrderAdapter) as jasmine.SpyObj<CheckoutComOrderAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should place order for valid user and cart', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const termsChecked = true;
    const order: Order = generateOrder();

    adapter.placeOrder.and.returnValue(of(order));

    let result;
    service.placeOrder(userId, cartId, termsChecked).subscribe(res => result = res);

    expect(result).toBe(order);
    expect(adapter.placeOrder).toHaveBeenCalledWith(userId, cartId, termsChecked);
  });

  it('should handle error when adapter fails to place order', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const termsChecked = true;
    const error = new Error('error');

    adapter.placeOrder.and.returnValue(throwError(() => error));

    let result;
    service.placeOrder(userId, cartId, termsChecked).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.placeOrder).toHaveBeenCalledWith(userId, cartId, termsChecked);
  });

  it('should authorize redirect place order for valid inputs', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const sessionId = 'session1';
    const order: Order = generateOrder();

    adapter.authorizeRedirectPlaceOrder.and.returnValue(of(order));

    let result;
    service.authorizeRedirectPlaceOrder(userId, cartId, sessionId).subscribe(res => result = res);

    expect(result).toBe(order);
    expect(adapter.authorizeRedirectPlaceOrder).toHaveBeenCalledWith(userId, cartId, sessionId);
  });

  it('should handle error when adapter fails to authorize redirect place order', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const sessionId = 'session1';
    const error = new Error('error');

    adapter.authorizeRedirectPlaceOrder.and.returnValue(throwError(() => error));

    let result;
    service.authorizeRedirectPlaceOrder(userId, cartId, sessionId).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.authorizeRedirectPlaceOrder).toHaveBeenCalledWith(userId, cartId, sessionId);
  });

});