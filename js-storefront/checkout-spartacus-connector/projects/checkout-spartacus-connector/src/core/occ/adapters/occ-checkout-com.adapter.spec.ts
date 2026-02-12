import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { OccCheckoutComAdapter } from '@checkout-core/occ/adapters/occ-checkout-com.adapter';
import { Address, BaseOccUrlProperties, DynamicAttributes, OCC_USER_ID_ANONYMOUS, OccConfig, OccEndpointsService } from '@spartacus/core';
import { EnvironmentUnion } from '@checkout.com/checkout-web-components';

const merchantConfiguration = {
  publicKey: 'pk_test_d4727781-a79c-460e-9773-05d762c63e8f',
  environment: 'sandbox' as EnvironmentUnion
};
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

describe('CheckoutComOccAdapter', () => {
  let service: OccCheckoutComAdapter;
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
    service = TestBed.inject(OccCheckoutComAdapter);
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

  describe('getMerchantKey', () => {
    it('should return key', () => {
      service.getMerchantKey(userId).subscribe(res => expect(res).toEqual(JSON.stringify(merchantConfiguration)));
      expect(occEndpointsService.buildUrl).toHaveBeenCalledWith('merchantKey');

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams ===
          `merchantKey`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('text');
      mockReq.flush(merchantConfiguration);
    });

    it('should return key for guest users', () => {
      service.getMerchantKey(OCC_USER_ID_ANONYMOUS).subscribe(res => expect(res).toEqual(JSON.stringify(merchantConfiguration)));

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `merchantKey` &&
          !!req.headers.get('cx-use-client-token')
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('text');
      mockReq.flush(merchantConfiguration);
    });
  });

  describe('getIsABC', () => {
    it('should return true if ABC is enabled', () => {
      service.getIsABC(userId).subscribe(res => expect(res).toBeTrue());

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `merchantKey/isABC`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(true);
    });

    it('should return false if ABC is not enabled', () => {
      service.getIsABC(userId).subscribe(res => expect(res).toBeFalse());

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `merchantKey/isABC`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(false);
    });

    it('should handle error when checking if ABC is enabled', () => {
      const error = new Error('Http failure response for merchantKey/isABC: 500 Server Error');
      service.getIsABC(userId).subscribe({
        next: () => {
        },
        error: err => expect(err.message).toBe(error.message)
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.urlWithParams === `merchantKey/isABC`
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
});
