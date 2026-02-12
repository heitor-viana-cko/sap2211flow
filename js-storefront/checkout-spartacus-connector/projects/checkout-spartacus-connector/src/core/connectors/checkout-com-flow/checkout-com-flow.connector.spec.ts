import { TestBed } from '@angular/core/testing';
import { CheckoutComFlowAdapter } from '@checkout-core/adapters/checkout-com-flow/checkout-com-flow.adapter';
import { of, throwError } from 'rxjs';
import { CheckoutComFlowConnector } from './checkout-com-flow.connector';

const paymentSession = {
  id: 'session-id',
  payment_session_token: 'session-token',
  payment_session_secret: 'session-key'
};
describe('CheckoutComFlowConnector', () => {
  let service: CheckoutComFlowConnector;
  let adapter: jasmine.SpyObj<CheckoutComFlowAdapter>;

  beforeEach(() => {
    adapter = jasmine.createSpyObj('CheckoutComFlowAdapter', [
      'requestIsFlowEnabled',
      'requestFlowUIConfiguration',
      'requestFlowPaymentSession'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComFlowConnector,
        {
          provide: CheckoutComFlowAdapter,
          useValue: adapter
        }
      ]
    });

    service = TestBed.inject(CheckoutComFlowConnector);
    adapter = TestBed.inject(CheckoutComFlowAdapter) as jasmine.SpyObj<CheckoutComFlowAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestIsFlowEnabled', () => {
    it('should return true when flow is enabled', (done) => {
      const response = { enabled: true };

      adapter.requestIsFlowEnabled.and.returnValue(of(response));

      service.requestIsFlowEnabled().subscribe((result) => {
        expect(result).toEqual(response);
        done();
      });

      expect(adapter.requestIsFlowEnabled).toHaveBeenCalled();
    });

    it('should return false when flow is disabled', (done) => {
      const response = { enabled: false };

      adapter.requestIsFlowEnabled.and.returnValue(of(response));

      service.requestIsFlowEnabled().subscribe((result) => {
        expect(result).toEqual(response);
        done();
      });

      expect(adapter.requestIsFlowEnabled).toHaveBeenCalled();
    });

    it('should handle error when adapter fails to check if flow is enabled', (done) => {
      const error = new Error('error');

      adapter.requestIsFlowEnabled.and.returnValue(throwError(() => error));

      service.requestIsFlowEnabled().subscribe({
        next: () => {
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });

      expect(adapter.requestIsFlowEnabled).toHaveBeenCalled();
    });
  });

  describe('requestFlowUIConfiguration', () => {
    it('should return the flow UI configuration when the adapter call is successful', (done) => {
      const mockResponse = { colorAction: 'red' };

      adapter.requestFlowUIConfiguration.and.returnValue(of(mockResponse));

      service.requestFlowUIConfiguration().subscribe((result) => {
        expect(result).toEqual(mockResponse);
        done();
      });

      expect(adapter.requestFlowUIConfiguration).toHaveBeenCalled();
    });

    it('should handle an error when the adapter call fails', (done) => {
      const error = new Error('Failed to fetch UI configuration');

      adapter.requestFlowUIConfiguration.and.returnValue(throwError(() => error));

      service.requestFlowUIConfiguration().subscribe({
        next: () => {
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });

      expect(adapter.requestFlowUIConfiguration).toHaveBeenCalled();
    });
  });

  describe('requestFlowPaymentSession', () => {
    it('should return the payment session details when the adapter call is successful', (done) => {

      adapter.requestFlowPaymentSession.and.returnValue(of(paymentSession));

      service.requestFlowPaymentSession('user123', 'cart456').subscribe((result) => {
        expect(result).toEqual(paymentSession);
        done();
      });

      expect(adapter.requestFlowPaymentSession).toHaveBeenCalledWith('user123', 'cart456');
    });

    it('should handle an error when the adapter call fails', (done) => {
      const error = new Error('Failed to fetch payment session');

      adapter.requestFlowPaymentSession.and.returnValue(throwError(() => error));

      service.requestFlowPaymentSession('user123', 'cart456').subscribe({
        next: () => {
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });

      expect(adapter.requestFlowPaymentSession).toHaveBeenCalledWith('user123', 'cart456');
    });
  });
});