import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { OccCheckoutComOrderAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-order.adapter';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { BaseOccUrlProperties, DynamicAttributes, OccConfig, OccEndpointsService } from '@spartacus/core';
import { Order } from '@spartacus/order/root';

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: ''
    }
  },

  context: {
    baseSite: ['']
  }
};

class MockOccEndpointsService {
  buildUrl(endpoint: string, attributes?: DynamicAttributes, propertiesToOmit?: BaseOccUrlProperties) {
    const pattern = defaultOccCheckoutComConfig.backend.occ.endpoints[endpoint];
    let templateString = pattern;
    const urlParams = attributes?.hasOwnProperty('urlParams') ? attributes.urlParams : [];

    if (urlParams) {

      Object.keys(urlParams).forEach((key) => {
        urlParams[key] = encodeURIComponent(urlParams[key]);
      });

      for (const variableLabel of Object.keys(urlParams)) {
        const placeholder = new RegExp('\\${' + variableLabel + '}', 'g');
        templateString = templateString.replace(
          placeholder,
          urlParams[variableLabel]
        );
      }
    }

    return templateString;
  }
}

describe('OccCheckoutComOrderAdapter', () => {
  let service: OccCheckoutComOrderAdapter;
  let httpMock: HttpTestingController;
  let userId: string = 'current';
  let cartId: string = 'cartId';
  let occEndpointsService: OccEndpointsService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        {
          provide: OccConfig,
          useValue: MockOccModuleConfig
        },
        {
          provide: OccEndpointsService,
          useClass: MockOccEndpointsService
        },
      ]
    });
    service = TestBed.inject(OccCheckoutComOrderAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    occEndpointsService = TestBed.inject(OccEndpointsService);

    spyOn(occEndpointsService, 'buildUrl').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authorizeRedirectPlaceOrder', () => {
    it('should authorize and place order successfully for valid user, cart, and session', () => {
      const order: Order = generateOrder();
      service.authorizeRedirectPlaceOrder(userId, cartId, 'sessionId').subscribe(
        res => expect(res).toEqual(order)
      );

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/redirect-place-order?fields=FULL`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.method).toBe('POST');
      mockReq.flush(order);
    });

    it('should handle error when authorizing and placing order', () => {
      const error = new Error('Http failure response for users/current/carts/cartId/redirect-place-order?fields=FULL: 500 Server Error');
      service.authorizeRedirectPlaceOrder(userId, cartId, 'sessionId').subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/redirect-place-order?fields=FULL`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
    });
  });

  describe('placeOrder', () => {
    it('should place order successfully for valid user and cart with terms checked', () => {
      const order: Order = generateOrder();
      service.placeOrder(userId, cartId, true).subscribe(res => expect(res).toEqual(order));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/current/carts/cartId/direct-place-order?fields=FULL&termsChecked=true`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.method).toBe('POST');
      mockReq.flush(order);
    });

    it('should handle error when placing order', () => {
      const error = new Error('Http failure response for users/current/carts/cartId/direct-place-order?fields=FULL&termsChecked=true: 500 Server Error');
      service.placeOrder(userId, cartId, true).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/current/carts/cartId/direct-place-order?fields=FULL&termsChecked=true`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.method).toBe('POST');
      mockReq.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
    });

    it('should place order successfully for valid user and cart with terms not checked', () => {
      const order: Order = generateOrder();
      service.placeOrder(userId, cartId, false).subscribe(res => expect(res).toEqual(order));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/current/carts/cartId/direct-place-order?fields=FULL&termsChecked=false`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(order);
    });
  });
});
