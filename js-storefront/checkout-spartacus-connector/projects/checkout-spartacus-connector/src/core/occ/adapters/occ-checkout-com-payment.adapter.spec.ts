import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { APM_PAYMENT_DETAILS_NORMALIZER } from '@checkout-adapters/converters';

import { ApmPaymentDetails, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { OccCheckoutComPaymentAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-payment.adapter';
import { PaymentType } from '@checkout-model/ApmData';
import { ApmPaymentDetailsNormalizer } from '@checkout-normalizers/apm-payment-details-normalizer';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { Address, BaseOccUrlProperties, ConverterService, DynamicAttributes, OccConfig, OccEndpointsService, PaymentDetails } from '@spartacus/core';

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

describe('OccCheckoutComPaymentAdapter', () => {
  let service: OccCheckoutComPaymentAdapter;
  let httpController: HttpTestingController;
  let userId: string = 'current';
  let cartId: string = 'cartId';
  let occEndpointsService: OccEndpointsService;
  let converter: ConverterService;


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
    service = TestBed.inject(OccCheckoutComPaymentAdapter);
    httpController = TestBed.inject(HttpTestingController);
    occEndpointsService = TestBed.inject(OccEndpointsService);
    converter = TestBed.inject(ConverterService);
    spyOn(occEndpointsService, 'buildUrl').and.callThrough();
    spyOn(converter, 'convert').and.callThrough();
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setPaymentAddress', () => {
    it('should set payment address for a valid user and cart', (doneFn) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const occUrl = `users/${userId}/carts/${cartId}/checkoutoccbillingaddress`;

      service.setPaymentAddress(userId, cartId, address).subscribe((result) => {
        expect(result).toBeTruthy();
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush({});
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      expect(req.request.body).toEqual(address);
    });

    it('should handle error when setting payment address', (doneFn) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const error = new Error('Http failure response for users/current/carts/cartId/checkoutoccbillingaddress: 500 Server Error');
      const occUrl = `users/${userId}/carts/${cartId}/checkoutoccbillingaddress`;

      service.setPaymentAddress(userId, cartId, address).subscribe({
        next: () => fail('expected an error, not success'),
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
    });
  });

  describe('createPaymentDetails', () => {
    it('should create payment details for a valid user and cart', (doneFn) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: '123' };
      const mockResponse: PaymentDetails = {
        id: '123',
        cardNumber: '1111111111',
        billingAddress: generateOneAddress()
      };
      const occUrl = `users/${userId}/carts/${cartId}/checkoutcompaymentdetails`;

      service.createPaymentDetails(userId, cartId, paymentDetails).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });
      req.flush(mockResponse);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
    });

    it('should handle error when creating payment details', (doneFn) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: '123' };
      const error = new Error('Http failure response for users/current/carts/cartId/checkoutcompaymentdetails: 500 Server Error');
      const occUrl = `users/${userId}/carts/${cartId}/checkoutcompaymentdetails`;

      service.createPaymentDetails(userId, cartId, paymentDetails).subscribe({
        next: () => fail('expected an error, not success'),
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
    });
  });

  describe('createApmPaymentDetails', () => {

    it('should create APM payment details for a valid user and cart', (doneFn) => {
      const billingAddress = generateOneAddress();
      const paymentDetails: ApmPaymentDetails = {
        billingAddress,
        type: PaymentType.Card
      };

      const occUrl = `users/${userId}/carts/${cartId}/checkoutcomapmpaymentdetails`;

      service.createApmPaymentDetails(userId, cartId, paymentDetails).subscribe((result: PaymentDetails) => {
        expect(result).toEqual(paymentDetails);
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'POST' && req.url === occUrl;
      });

      req.flush(paymentDetails);
      expect(req.request.method).toEqual('POST');
      expect(req.request.url).toEqual(occUrl);
      expect(converter.convert).toHaveBeenCalledWith(paymentDetails, APM_PAYMENT_DETAILS_NORMALIZER);
    });

    it('should handle error when creating APM payment details', (doneFn) => {
      const paymentDetails: ApmPaymentDetails = { type: PaymentType.Card };
      const error = new Error('Http failure response for users/current/carts/cartId/checkoutcomapmpaymentdetails: 500 Server Error');
      const occUrl = `users/${userId}/carts/${cartId}/checkoutcomapmpaymentdetails`;

      service.createApmPaymentDetails(userId, cartId, paymentDetails).subscribe({
        next: () => fail('expected an error, not success'),
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
    });
  });

  describe('updatePaymentDetails', () => {
    it('should update payment details for a valid user and cart', (doneFn) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: '123' };
      const occUrl = `users/${userId}/paymentdetails/${paymentDetails.id}`;

      service.updatePaymentDetails(userId, paymentDetails).subscribe((result) => {
        expect(result.status).toBe(204);
        expect(result.body).toBeNull();
        doneFn();
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'PUT' && req.url === occUrl;
      });
      req.flush(null, { status: 204, statusText: 'No Content' });
      expect(req.request.method).toEqual('PUT');
      expect(req.request.url).toEqual(occUrl);
    });

    it('should handle error when updating payment details', (doneFn) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: '123' };
      const error = new Error('Http failure response for users/current/paymentdetails/123: 500 Server Error');
      const occUrl = `users/${userId}/paymentdetails/${paymentDetails.id}`;

      service.updatePaymentDetails(userId, paymentDetails).subscribe({
        next: () => fail('expected an error, not success'),
        error: (err) => {
          expect(err.message).toEqual(error.message);
          doneFn();
        }
      });

      const req = httpController.expectOne((req) => {
        return req.method === 'PUT' && req.url === occUrl;
      });
      req.flush(error, {
        status: 500,
        statusText: 'Server Error'
      });
      expect(req.request.method).toEqual('PUT');
      expect(req.request.url).toEqual(occUrl);
    });
  });
});
