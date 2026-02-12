import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { AchSuccessMetadata } from '@checkout-core/model/Ach';
import { OccCheckoutComAchAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-ach.adapter';
import { BaseOccUrlProperties, DynamicAttributes, OCC_USER_ID_ANONYMOUS, OccConfig, OccEndpointsService } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable, throwError } from 'rxjs';

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

describe('OccCheckoutComAchAdapter', () => {
  let adapter: OccCheckoutComAchAdapter;
  let httpController: HttpTestingController;
  let userId: string = 'current';
  let cartId: string = '0001';
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
    adapter = TestBed.inject(OccCheckoutComAchAdapter);
    httpController = TestBed.inject(HttpTestingController);
    occEndpointsService = TestBed.inject(OccEndpointsService);

    spyOn(occEndpointsService, 'buildUrl').and.callThrough();
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  describe('getAchLinkToken', () => {
    it('should return ACH link token for a regular user', (doneFn) => {
      const token = 'link-sandbox-123';
      const mockData = token;
      const occUrl = `users/${userId}/carts/${cartId}/ach/link/token/create`;

      adapter.getAchLinkToken(userId, cartId).subscribe((result) => {
        expect(result).toBe(token);
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush(mockData);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);

      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achPlaidLinkToken', {
        urlParams: {
          cartId,
          userId
        },
      });
    });

    it('should return ACH link token for an anonymous user', (doneFn) => {
      const userId = OCC_USER_ID_ANONYMOUS;
      const cartId = 'cartId';
      const token = 'link-sandbox-123';
      const mockData = token;
      const occUrl = `users/${userId}/carts/${cartId}/ach/link/token/create`;

      adapter.getAchLinkToken(userId, cartId).subscribe((result) => {
        expect(result).toBe(token);
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush(mockData);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      // expect(req.request.headers.get('Content-Type')).toEqual('application/json');
      // expect(req.request.headers.get(USE_CLIENT_TOKEN)).toBe('true');
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achPlaidLinkToken', {
        urlParams: {
          cartId,
          userId
        },
      });
    });

    it('should handle error when retrieving ACH link token', (doneFn) => {
      const userId = 'regularUser';
      const cartId = 'cartId';
      const error = new Error('Http failure response for users/regularUser/carts/cartId/ach/link/token/create: 500 Server Error');
      const occUrl = `users/${userId}/carts/${cartId}/ach/link/token/create`;

      adapter.getAchLinkToken(userId, cartId).subscribe({
        next: () => fail('expected an error, not token'),
        error: (err) => {
          expect(err.message).toEqual(error.message);
          doneFn();
        }
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achPlaidLinkToken', {
        urlParams: {
          cartId,
          userId
        },
      });
    });

    it('should handle empty cartId', (doneFn) => {
      const userId = 'regularUser';
      const cartId = '';
      const token = 'link-sandbox-123';
      const mockData = token;
      const occUrl = `users/${userId}/carts/${cartId}/ach/link/token/create`;

      adapter.getAchLinkToken(userId, cartId).subscribe((result) => {
        expect(result).toBe(token);
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush(mockData);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      // expect(req.request.headers.get('Content-Type')).toEqual('application/json');
      // expect(req.request.headers.has(USE_CLIENT_TOKEN)).toBeFalse();
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achPlaidLinkToken', {
        urlParams: {
          cartId,
          userId
        },
      });
    });
  });

  describe('setAchOrderSuccess', () => {

    it('should return order on successful ACH order', (doneFn) => {
      const userId = 'user123';
      const cartId = 'cart123';
      const publicToken = 'public-token';
      const metadata: AchSuccessMetadata = { public_token: 'someValue' };
      const customerConsents = true;
      const mockOrder: Order = { code: 'order123' };
      const occUrl = `users/${userId}/carts/${cartId}/ach/item/public_token/exchange`;

      //occEndpointsService.buildUrl.and.returnValue(occUrl);
      adapter.setAchOrderSuccess(userId, cartId, publicToken, metadata, customerConsents).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        doneFn();
      });

      // Expect the HTTP request to match the URL and method
      const req = httpController.expectOne((req) =>
        req.method === 'POST' && req.url === occUrl
      );

      expect(req.request.body).toEqual({
        publicToken,
        metadata,
        customerConsents
      });
      req.flush(mockOrder);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achOrderSuccess', {
        urlParams: {
          cartId,
          userId
        },
      });
    });

    it('should handle error when ACH order fails', (doneFn) => {
      const userId = 'user123';
      const cartId = 'cart123';
      const publicToken = 'public-token';
      const metadata: AchSuccessMetadata = { public_token: 'someValue' };
      const customerConsents = true;
      const error = new Error('Http failure response for users/user123/carts/cart123/ach/item/public_token/exchange: 500 Server Error');
      const occUrl = `users/${userId}/carts/${cartId}/ach/item/public_token/exchange`;

      adapter.setAchOrderSuccess(userId, cartId, publicToken, metadata, customerConsents).subscribe({
        next: () => {
          fail('expected an error, not order');
        },
        error: (err) => {
          expect(err.message).toEqual(error.message);
          doneFn();
        }
      });

      // Expect the HTTP request to match the URL and method
      const req = httpController.expectOne((req) =>
        req.method === 'POST' && req.url === occUrl
      );

      expect(req.request.body).toEqual({
        publicToken,
        metadata,
        customerConsents
      });
      req.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('achOrderSuccess', {
        urlParams: {
          cartId,
          userId
        },
      });
    });
  });
});

