import { TestBed } from '@angular/core/testing';
import { CheckoutComAchAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-ach.adapter';
import { CheckoutComAchConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-ach.connector';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { generateAchSuccessMetadata } from '@checkout-tests/fake-data/apm-ach/apm-ach.mock';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { Order } from '@spartacus/order/root';
import { of, throwError } from 'rxjs';

describe('CheckoutComAchConnector', () => {
  let service: CheckoutComAchConnector;
  let adapter: jasmine.SpyObj<CheckoutComAchAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComAchAdapter', ['getAchLinkToken', 'setAchOrderSuccess']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComAchConnector,
        {
          provide: CheckoutComAchAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComAchConnector);
    adapter = TestBed.inject(CheckoutComAchAdapter) as jasmine.SpyObj<CheckoutComAchAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return ACH link token for valid user and cart', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const achLinkToken = 'ach-link-token';

    adapter.getAchLinkToken.and.returnValue(of(achLinkToken));

    let result;
    service.getAchLinkToken(userId, cartId).subscribe(res => result = res);

    expect(result).toBe(achLinkToken);
    expect(adapter.getAchLinkToken).toHaveBeenCalledWith(userId, cartId);
  });

  it('should handle error when adapter fails to get ACH link token', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const error = new Error('error');

    adapter.getAchLinkToken.and.returnValue(throwError(() => error));

    let result;
    service.getAchLinkToken(userId, cartId).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.getAchLinkToken).toHaveBeenCalledWith(userId, cartId);
  });

  it('should set ACH order success for valid inputs', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const publicToken = 'public-token';
    const metadata: AchSuccessMetadata = generateAchSuccessMetadata();
    const customerConsents = true;
    const order: Order = generateOrder();

    adapter.setAchOrderSuccess.and.returnValue(of(order));

    let result;
    service.setAchOrderSuccess(userId, cartId, publicToken, metadata, customerConsents).subscribe(res => result = res);

    expect(result).toBe(order);
    expect(adapter.setAchOrderSuccess).toHaveBeenCalledWith(userId, cartId, publicToken, metadata, customerConsents);
  });

  it('should handle error when adapter fails to set ACH order success', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const publicToken = 'public-token';
    const metadata: AchSuccessMetadata = generateAchSuccessMetadata();
    const customerConsents = true;
    const error = new Error('error');

    adapter.setAchOrderSuccess.and.returnValue(throwError(() => error));

    let result;
    service.setAchOrderSuccess(userId, cartId, publicToken, metadata, customerConsents).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.setAchOrderSuccess).toHaveBeenCalledWith(userId, cartId, publicToken, metadata, customerConsents);
  });
});