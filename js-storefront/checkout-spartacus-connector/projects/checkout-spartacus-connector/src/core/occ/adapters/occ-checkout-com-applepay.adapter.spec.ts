import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { OccCheckoutComApplepayAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-applepay.adapter';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { BaseOccUrlProperties, DynamicAttributes, OccConfig, OccEndpointsService } from '@spartacus/core';

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

describe('OccCheckoutComApplepayAdapter', () => {
  let service: OccCheckoutComApplepayAdapter;
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
    service = TestBed.inject(OccCheckoutComApplepayAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    occEndpointsService = TestBed.inject(OccEndpointsService);

    spyOn(occEndpointsService, 'buildUrl').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestApplePayPaymentRequest', () => {
    it('should return Apple Pay payment request for valid user and cart', () => {
      const applePayPaymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD'
      };
      service.requestApplePayPaymentRequest(userId, cartId).subscribe(res => expect(res).toEqual(applePayPaymentRequest));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/paymentRequest`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(applePayPaymentRequest);
    });

    it('should handle error when requesting Apple Pay payment request', () => {
      const error = new Error('Http failure response for users/current/carts/cartId/applepay/paymentRequest: 500 Server Error');
      service.requestApplePayPaymentRequest(userId, cartId).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/paymentRequest`
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

  describe('validateApplePayMerchant', () => {
    it('should validate Apple Pay merchant for valid user, cart, and validation URL', () => {
      const validationURL = 'https://example.com/validate';
      const validationResponse = { success: true };
      service.validateApplePayMerchant(userId, cartId, validationURL).subscribe(res => expect(res).toEqual(validationResponse));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/requestSession`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(validationResponse);
    });

    it('should handle error when validating Apple Pay merchant', () => {
      const validationURL = 'https://example.com/validate';
      const error = new Error('Http failure response for users/current/carts/cartId/applepay/requestSession: 500 Server Error');
      service.validateApplePayMerchant(userId, cartId, validationURL).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/requestSession`
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

  describe('authorizeApplePayPayment', () => {
    it('should authorize Apple Pay payment for valid user, cart, and request', () => {
      const request = { token: 'token123' };
      const authorizationResponse: ApplePayAuthorization = { orderData: generateOrder() };

      service.authorizeApplePayPayment(userId, cartId, request).subscribe(res => expect(res).toEqual(authorizationResponse));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/placeOrder`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(authorizationResponse);
    });

    it('should handle error when authorizing Apple Pay payment', () => {
      const request = { token: 'token123' };
      const error = new Error('Http failure response for users/current/carts/cartId/applepay/placeOrder: 500 Server Error');

      service.authorizeApplePayPayment(userId, cartId, request).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/placeOrder`
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

  describe('selectApplePayDeliveryAddress', () => {
    it('should select delivery address for valid user and cart', () => {
      const shippingContact: ApplePayPaymentContact = {
        givenName: 'John',
        familyName: 'Doe'
      };
      const shippingContactUpdate: ApplePayShippingContactUpdate = { newShippingMethods: [] };

      service.selectApplePayDeliveryAddress(userId, cartId, shippingContact).subscribe(res => expect(res).toEqual(shippingContactUpdate));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/deliveryAddress`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(shippingContactUpdate);
    });

    it('should handle error when selecting delivery address', () => {
      const shippingContact: ApplePayPaymentContact = {
        givenName: 'John',
        familyName: 'Doe'
      };
      const error = new Error('Http failure response for users/current/carts/cartId/applepay/deliveryAddress: 500 Server Error');

      service.selectApplePayDeliveryAddress(userId, cartId, shippingContact).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/deliveryAddress`
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

  describe('selectApplePayDeliveryMethod', () => {
    it('should select delivery method for valid user and cart', () => {
      const shippingMethod: ApplePayShippingMethod = {
        label: 'Standard',
        amount: '5.00'
      };
      const shippingMethodUpdate: ApplePayShippingMethodUpdate = {
        newTotal: {
          label: 'Total',
          amount: '105.00'
        }
      };

      service.selectApplePayDeliveryMethod(userId, cartId, shippingMethod).subscribe(res => expect(res).toEqual(shippingMethodUpdate));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/deliveryMethod`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(shippingMethodUpdate);
    });

    it('should handle error when selecting delivery method', () => {
      const shippingMethod: ApplePayShippingMethod = {
        label: 'Standard',
        amount: '5.00'
      };
      const error = new Error('Http failure response for users/current/carts/cartId/applepay/deliveryMethod: 500 Server Error');

      service.selectApplePayDeliveryMethod(userId, cartId, shippingMethod).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/applepay/deliveryMethod`
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
    it('should log an error and return undefined', () => {
      spyOn(service['logger'], 'error');
      service.placeOrder().subscribe(res => expect(res).toBeUndefined());
      expect(service['logger'].error).toHaveBeenCalledWith('Method not implemented.');
    });
  });
});

