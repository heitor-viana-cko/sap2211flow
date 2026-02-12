import { TestBed } from '@angular/core/testing';
import { CheckoutComAdapter } from '@checkout-core/adapters/checkout-com/checkout-com.adapter';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { EnvironmentUnion } from '@checkout.com/checkout-web-components';
import { of, throwError } from 'rxjs';

const merchantConfiguration = {
  publicKey: 'pk_test_d4727781-a79c-460e-9773-05d762c63e8f',
  environment: 'sandbox' as EnvironmentUnion
};

describe('CheckoutComConnector', () => {
  let service: CheckoutComConnector;
  let adapter: jasmine.SpyObj<CheckoutComAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComAdapter', [
      'getMerchantKey',
      'getIsABC',
      'requestBillingAddress',
      'setDeliveryAddressAsBillingAddress'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComConnector,
        {
          provide: CheckoutComAdapter,
          useValue: adapterSpy
        }
      ]
    });

    service = TestBed.inject(CheckoutComConnector);
    adapter = TestBed.inject(CheckoutComAdapter) as jasmine.SpyObj<CheckoutComAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return merchant key for valid user', (done) => {
    const userId = 'user1';

    adapter.getMerchantKey.and.returnValue(of(JSON.stringify(merchantConfiguration)));

    service.getMerchantKey(userId).subscribe((result) => {
      expect(result).toBe(JSON.stringify(merchantConfiguration));
      done();
    });

    expect(adapter.getMerchantKey).toHaveBeenCalledWith(userId);
  });

  it('should handle error when adapter fails to get merchant key', (done) => {
    const userId = 'user1';
    const error = new Error('error');

    adapter.getMerchantKey.and.returnValue(throwError(() => error));

    service.getMerchantKey(userId).subscribe({
      next: () => {
      },
      error: (err) => {
        expect(err).toBe(error);
        done();
      }
    });

    expect(adapter.getMerchantKey).toHaveBeenCalledWith(userId);
  });

  it('should return true when adapter returns true for getIsABC', (done) => {
    const userId = 'user1';
    const isABC = true;

    adapter.getIsABC.and.returnValue(of(isABC));

    service.getIsABC(userId).subscribe((result) => {
      expect(result).toBe(isABC);
      done();
    });

    expect(adapter.getIsABC).toHaveBeenCalledWith(userId);
  });

  it('should return false when adapter returns false for getIsABC', (done) => {
    const userId = 'user1';
    const isABC = false;

    adapter.getIsABC.and.returnValue(of(isABC));

    service.getIsABC(userId).subscribe((result) => {
      expect(result).toBe(isABC);
      done();
    });

    expect(adapter.getIsABC).toHaveBeenCalledWith(userId);
  });

  it('should handle error when adapter fails to get IsABC', (done) => {
    const userId = 'user1';
    const error = new Error('error');

    adapter.getIsABC.and.returnValue(throwError(() => error));

    service.getIsABC(userId).subscribe({
      next: () => {
      },
      error: (err) => {
        expect(err).toBe(error);
        done();
      }
    });

    expect(adapter.getIsABC).toHaveBeenCalledWith(userId);
  });
});