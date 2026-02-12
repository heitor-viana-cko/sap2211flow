import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { IntermediatePaymentData, PaymentDataRequestUpdate, PlaceOrderResponse } from '@checkout-core/model/GooglePay';
import { OccCheckoutComGooglePayAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-googlepay.adapter';
import { generateOneCountry, generatePostalCode, generateTown } from '@checkout-tests/fake-data/address.mock';
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

const paymentData: IntermediatePaymentData = {
  shippingAddress: {
    administrativeArea: 'role',
    countryCode: generateOneCountry().isocode,
    locality: generateTown(),
    postalCode: generatePostalCode(),
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

describe('OccCheckoutComGooglePayAdapter', () => {
  let service: OccCheckoutComGooglePayAdapter;
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
    service = TestBed.inject(OccCheckoutComGooglePayAdapter);
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

  describe('getGooglePayMerchantConfiguration', () => {
    it('should return Google Pay merchant configuration for valid user and cart', () => {
      const googlePayMerchantConfig = { merchantId: 'merchant123' };
      service.getGooglePayMerchantConfiguration(userId, cartId).subscribe(res => expect(res).toEqual(googlePayMerchantConfig));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/merchant-configuration`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(googlePayMerchantConfig);
    });

    it('should handle error when getting Google Pay merchant configuration', () => {
      const error = new Error('Http failure response for users/current/carts/cartId/google/merchant-configuration: 500 Server Error');
      service.getGooglePayMerchantConfiguration(userId, cartId).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/merchant-configuration`
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

  describe('authoriseGooglePayPayment', () => {
    it('should authorise Google Pay payment for valid inputs', () => {
      const token = 'token123';
      const billingAddress = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const saved = true;
      const shippingAddress = {
        firstName: 'Jane',
        lastName: 'Doe'
      };
      const email = 'john.doe@example.com';
      const placeOrderResponse: PlaceOrderResponse = {
        orderData: generateOrder()
      };

      service.authoriseGooglePayPayment(userId, cartId, token, billingAddress, saved, shippingAddress, email)
        .subscribe(res => expect(res).toEqual(placeOrderResponse));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/placeOrder`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(placeOrderResponse);
    });

    it('should handle error when authorising Google Pay payment', () => {
      const token = 'token123';
      const billingAddress = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const saved = true;
      const shippingAddress = {
        firstName: 'Jane',
        lastName: 'Doe'
      };
      const email = 'john.doe@example.com';
      const error = new Error('Http failure response for users/current/carts/cartId/google/placeOrder: 500 Server Error');

      service.authoriseGooglePayPayment(userId, cartId, token, billingAddress, saved, shippingAddress, email).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/placeOrder`
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

  describe('setGooglePayDeliveryInfo', () => {
    it('should set Google Pay delivery information for valid inputs', () => {
      const paymentDataRequestUpdate: PaymentDataRequestUpdate = {
        newOfferInfo: {
          offers: []
        },
        newShippingOptionParameters: {
          shippingOptions: [
            {
              id: '123',
              label: 'Standard Shipping',
            }
          ]
        }
      };

      service.setGooglePayDeliveryInfo(userId, cartId, paymentData).subscribe(res => expect(res).toEqual(paymentDataRequestUpdate));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/deliveryInfo`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(paymentDataRequestUpdate);
    });

    it('should handle error when setting Google Pay delivery information', () => {

      const error = new Error('Http failure response for users/current/carts/cartId/google/deliveryInfo: 500 Server Error');

      service.setGooglePayDeliveryInfo(userId, cartId, paymentData).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams === `users/${userId}/carts/${cartId}/google/deliveryInfo`
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
