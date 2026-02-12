import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession } from '@checkout-core/interfaces';
import { OccCheckoutComFlowAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-flow.adapter';
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
    let templateString = defaultOccCheckoutComConfig.backend.occ.endpoints[endpoint];
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

describe('OccCheckoutComFlowAdapter', () => {
  let service: OccCheckoutComFlowAdapter;
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
        }
      ]
    });
    service = TestBed.inject(OccCheckoutComFlowAdapter);
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

  describe('requestIsFlowEnabled', () => {
    it('should return true when the flow feature is enabled', () => {
      service.requestIsFlowEnabled().subscribe((result) => {
        expect(result).toEqual({ enabled: true });
      });

      const mockReq = httpMock.expectOne((req) =>
        req.method === 'GET' &&
        req.url === 'flow/enabled'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({ enabled: true });
    });

    it('should return false when the flow feature is disabled', () => {
      service.requestIsFlowEnabled().subscribe((result) => {
        expect(result).toEqual({ enabled: false });
      });

      const mockReq = httpMock.expectOne((req) =>
        req.method === 'GET' &&
        req.url === 'flow/enabled'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({ enabled: false });
    });
  });

  describe('requestFlowUIConfiguration', () => {
    it('should return the flow UI configuration when the request is successful', () => {
      const mockResponse = { color: 'red' } as CheckoutComFlowUIConfigurationData;

      service.requestFlowUIConfiguration().subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const mockReq = httpMock.expectOne((req) =>
        req.method === 'GET' &&
        req.url === 'flow/configuration'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockResponse);
    });
  });

  describe('requestFlowPaymentSession', () => {
    it('should return the payment session details when the request is successful', () => {
      const mockResponse = { sessionId: '12345' } as CheckoutComPaymentSession;

      service.requestFlowPaymentSession(userId, cartId).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const mockReq = httpMock.expectOne((req) =>
        req.method === 'GET' &&
        req.url === 'users/current/carts/cartId/payment-session'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockResponse);
    });

    it('should include the correct headers for the user ID', () => {
      const mockResponse = { sessionId: '12345' } as CheckoutComPaymentSession;

      service.requestFlowPaymentSession(userId, cartId).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const mockReq = httpMock.expectOne((req) =>
        req.method === 'GET' &&
        req.url === 'users/current/carts/cartId/payment-session'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockResponse);
    });
  });
});
