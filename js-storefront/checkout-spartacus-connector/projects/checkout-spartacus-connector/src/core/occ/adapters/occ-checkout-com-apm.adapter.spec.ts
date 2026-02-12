import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';

import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { OccCheckoutComApmAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-apm.adapter';
import { PaymentType } from '@checkout-model/ApmData';
import { BaseOccUrlProperties, DynamicAttributes, OCC_USER_ID_ANONYMOUS, OccConfig, OccEndpointsService } from '@spartacus/core';

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

describe('OccCheckoutComApmAdapter', () => {
  let service: OccCheckoutComApmAdapter;
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
    service = TestBed.inject(OccCheckoutComApmAdapter);
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

  describe('createApmPaymentDetails', () => {
    it('should post the APM payment details', () => {
      const apmPaymentDetails = {
        type: PaymentType.iDeal,
        bic: 'INGNL2B'
      } as ApmPaymentDetails;

      service.createApmPaymentDetails(userId, cartId, apmPaymentDetails).subscribe();

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams ===
          `users/current/carts/cartId/checkoutcomapmpaymentdetails`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
    it('should post the APM payment details for guest customers', () => {
      const apmPaymentDetails = {
        type: PaymentType.iDeal,
        bic: 'INGNL2B'
      } as ApmPaymentDetails;

      service.createApmPaymentDetails(OCC_USER_ID_ANONYMOUS, cartId, apmPaymentDetails).subscribe();

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.urlWithParams ===
          `users/${OCC_USER_ID_ANONYMOUS}/carts/cartId/checkoutcomapmpaymentdetails` &&
          !!req.headers.get('cx-use-client-token')
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });

  describe('requestAvailableApms', () => {
    it('should get available apms', () => {
      service.requestAvailableApms(userId, cartId).subscribe();

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams ===
          `users/current/carts/cartId/apm/available`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });

    it('should get available apms for guest customers', () => {
      service.requestAvailableApms(OCC_USER_ID_ANONYMOUS, cartId).subscribe();

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams ===
          `users/${OCC_USER_ID_ANONYMOUS}/carts/cartId/apm/available` &&
          !!req.headers.get('cx-use-client-token')
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });

  describe('getKlarnaInitParams', () => {
    it('should get init klarna params', () => {
      service.getKlarnaInitParams(userId, cartId).subscribe();

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams ===
          `users/current/carts/cartId/klarna/clientToken`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });
});
