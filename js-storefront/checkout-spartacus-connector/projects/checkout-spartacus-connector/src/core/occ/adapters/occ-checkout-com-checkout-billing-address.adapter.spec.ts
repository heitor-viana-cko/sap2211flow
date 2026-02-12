import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Cart } from '@spartacus/cart/base/root';
import { Address, ConverterService, HttpErrorModel, LoggerService, normalizeHttpError, OccConfig, OccEndpoints } from '@spartacus/core';
import { defer, of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { OccCheckoutComCheckoutBillingAddressAdapter } from './occ-checkout-com-checkout-billing-address.adapter';

const userId = '123';
const cartId = '456';
const cartData: Partial<Cart> = {
  store: 'electronics',
  guid: '1212121'
};

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
      endpoints: {
        setBillingAddress: 'users/${userId}/carts/${cartId}/addresses/billing',
        setPaymentAddress: 'users/${userId}/carts/${cartId}/checkoutoccbillingaddress',
        requestBillingAddress: 'users/${userId}/carts/${cartId}/checkoutoccbillingaddress',
        setDeliveryAddressAsBillingAddress: 'users/${userId}/carts/${cartId}/addresses/setbillingaddressbyid'
      } as OccEndpoints
    }
  },
  context: {
    baseSite: ['']
  }
};

const mockJaloError = new HttpErrorResponse({
  error: {
    errors: [
      {
        message: 'The application has encountered an error',
        type: 'JaloObjectNoLongerValidError'
      }
    ]
  }
});

describe(`OccCheckoutComCheckoutBillingAddressAdapter`, () => {
  let service: OccCheckoutComCheckoutBillingAddressAdapter;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let converter: ConverterService;
  let logger: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        OccCheckoutComCheckoutBillingAddressAdapter,
        {
          provide: OccConfig,
          useValue: MockOccModuleConfig
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OccCheckoutComCheckoutBillingAddressAdapter);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    converter = TestBed.inject(ConverterService);
    logger = TestBed.inject(LoggerService);

    spyOn(converter, 'pipeable').and.callThrough();
    spyOn(converter, 'pipeableMany').and.callThrough();
    spyOn(converter, 'convert').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe(`setAddress`, () => {
    const address: Address = { country: 'Poland' } as Address;

    it(`should set address for cart for given user id, cart id and address id`, (done) => {
      service
        .setBillingAddress(userId, cartId, address)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(cartData);
          done();
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.url === `users/${userId}/carts/${cartId}/addresses/billing`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });

    describe(`back-off`, () => {
      it(`should unsuccessfully backOff on Jalo error`, fakeAsync(() => {
        spyOn(httpClient, 'put').and.returnValue(throwError(mockJaloError));

        let result: HttpErrorModel | undefined;
        const subscription = service
          .setBillingAddress(userId, cartId, address)
          .pipe(take(1))
          .subscribe({ error: (err) => (result = err) });

        tick(4200);

        const mockNormalizedJaloError = normalizeHttpError(
          mockJaloError,
          logger
        );
        expect(result).toEqual(mockNormalizedJaloError);

        subscription.unsubscribe();
      }));

      it(`should successfully backOff on Jalo error and recover after the 2nd retry`, fakeAsync(() => {
        let calledTimes = -1;

        spyOn(httpClient, 'put').and.returnValue(
          defer(() => {
            calledTimes++;
            if (calledTimes === 3) {
              return of(cartData);
            }
            return throwError(mockJaloError);
          })
        );

        let result: unknown;
        const subscription = service
          .setBillingAddress(userId, cartId, address)
          .pipe(take(1))
          .subscribe((res) => {
            result = res;
          });

        // 1*1*300 = 300
        tick(300);
        expect(result).toEqual(undefined);

        // 2*2*300 = 1200
        tick(1200);
        expect(result).toEqual(undefined);

        // 3*3*300 = 2700
        tick(2700);

        expect(result).toEqual(cartData);
        subscription.unsubscribe();
      }));
    });
  });

  describe(`requestBillingAddress`, () => {
    it(`should return the billing address for the given user and cart`, (done) => {
      const mockAddress: Address = { country: 'USA' } as Address;

      service.requestBillingAddress(userId, cartId).pipe(
        take(1)
      ).subscribe((result) => {
        expect(result).toEqual(mockAddress);
        done();
      });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'GET' &&
          req.url === `users/${userId}/carts/${cartId}/checkoutoccbillingaddress`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockAddress);
    });

    it(`should handle an error and throw a normalized HttpErrorModel`, (done) => {

      const error = new Error('Http failure response for users/123/carts/456/checkoutoccbillingaddress: 500 Server Error');
      service.requestBillingAddress(userId, cartId).subscribe({
        next: () => {
        },
        error: err => {
          expect(err.message).toBe(error.message);
          done();
        }
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url === `users/${userId}/carts/${cartId}/checkoutoccbillingaddress`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
    });

    it(`should retry on Jalo error and succeed after retries`, fakeAsync(() => {
      let calledTimes = -1;

      spyOn(httpClient, 'get').and.returnValue(
        defer(() => {
          calledTimes++;
          if (calledTimes === 3) {
            return of({ country: 'USA' } as Address);
          }
          return throwError(() => mockJaloError);
        })
      );

      let result: Address | undefined;
      service
        .requestBillingAddress(userId, cartId)
        .pipe(take(1))
        .subscribe((res) => {
          result = res;
        });

      tick(300);
      expect(result).toBeUndefined();

      tick(1200);
      expect(result).toBeUndefined();

      tick(2700);
      expect(result).toEqual({ country: 'USA' } as Address);
    }));
  });

  describe(`setDeliveryAddressAsBillingAddress`, () => {
    const address: Address = {
      id: 'address123',
      country: 'Germany'
    } as Address;

    it(`should successfully set the delivery address as the billing address`, (done) => {
      service
        .setDeliveryAddressAsBillingAddress(userId, cartId, address)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(address);
          done();
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.url === `users/${userId}/carts/${cartId}/addresses/setbillingaddressbyid`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.body).toEqual(address.id);
      mockReq.flush(address);
    });

    it(`should handle an error and throw a normalized HttpErrorModel`, (done) => {
      const error = new Error('Http failure response for users/123/carts/456/addresses/setbillingaddressbyid: 500 Server Error');
      service.setDeliveryAddressAsBillingAddress(userId, cartId, address).subscribe({
        next: () => {
        },
        error: err => {
          expect(err.message).toBe(error.message);
          done();
        }
      });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.url === `users/${userId}/carts/${cartId}/addresses/setbillingaddressbyid`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
    });

    it(`should retry on Jalo error and succeed after retries`, fakeAsync(() => {
      let calledTimes = -1;

      spyOn(httpClient, 'put').and.returnValue(
        defer(() => {
          calledTimes++;
          if (calledTimes === 3) {
            return of(address);
          }
          return throwError(() => mockJaloError);
        })
      );

      let result: Address | undefined;
      service
        .setDeliveryAddressAsBillingAddress(userId, cartId, address)
        .pipe(take(1))
        .subscribe((res) => {
          result = res;
        });

      tick(300);
      expect(result).toBeUndefined();

      tick(1200);
      expect(result).toBeUndefined();

      tick(2700);
      expect(result).toEqual(address);
    }));
  });

  describe(`getRequestBillingAddressEndpoint`, () => {
    it(`should return the correct endpoint URL with the provided userId and cartId`, () => {
      const result = service['getRequestBillingAddressEndpoint'](userId, cartId);
      expect(result).toBe(`users/${userId}/carts/${cartId}/checkoutoccbillingaddress`);
    });
  });

  describe(`getSetDeliveryAddressAsBillingAddressEndpoint`, () => {
    it(`should return the correct endpoint URL with the provided userId and cartId`, () => {
      const result = service['getSetDeliveryAddressAsBillingAddressEndpoint'](userId, cartId);
      expect(result).toBe(`users/${userId}/carts/${cartId}/addresses/setbillingaddressbyid`);
    });
  });
});
