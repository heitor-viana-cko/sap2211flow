import { TestBed } from '@angular/core/testing';
import { CheckoutComGooglepayAdapter } from '@checkout-core/adapters/checkout-com-apm/checkout-com-googlepay.adapter';
import { CallbackTrigger, PaymentDataRequestUpdate } from '@checkout-core/model/GooglePay';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { of, throwError } from 'rxjs';
import { CheckoutComGooglepayConnector } from './checkout-com-googlepay.connector';

describe('CheckoutComGooglepayConnector', () => {
  let service: CheckoutComGooglepayConnector;
  let adapter: jasmine.SpyObj<CheckoutComGooglepayAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComGooglepayAdapter', [
      'getGooglePayMerchantConfiguration',
      'authoriseGooglePayPayment',
      'setGooglePayDeliveryInfo',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComGooglepayConnector,
        {
          provide: CheckoutComGooglepayAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComGooglepayConnector);
    adapter = TestBed.inject(CheckoutComGooglepayAdapter) as jasmine.SpyObj<CheckoutComGooglepayAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve Google Pay merchant configuration successfully', () => {
    const mockConfig = { merchantId: '123' };
    adapter.getGooglePayMerchantConfiguration.and.returnValue(of(mockConfig));

    service.getGooglePayMerchantConfiguration('user1', 'cart1').subscribe(config => {
      expect(config).toEqual(mockConfig);
    });
  });

  it('should handle error when retrieving Google Pay merchant configuration', doneFn => {
    const error = new Error('Error');
    adapter.getGooglePayMerchantConfiguration.and.returnValue(throwError(() => error));
    let result;

    service.getGooglePayMerchantConfiguration('user1', 'cart1').subscribe({
      next() {
      },
      error: err => {
        result = err;
        doneFn();
      }
    });
    expect(result).toBe(error);

  });

  it('should authorise Google Pay payment successfully', () => {
    const mockResponse = {
      redirectUrl: null,
      status: 'success',
      orderData: generateOrder()
    };
    adapter.authoriseGooglePayPayment.and.returnValue(of(mockResponse));

    service.authoriseGooglePayPayment('user1', 'cart1', 'token', 'billingAddress', true, 'shippingAddress', 'test@test.com').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should set Google Pay delivery info successfully', () => {
    const mockUpdate = {
      newTransactionInfo: {
        checkoutOption: 'newTransactionInfo'
      },
      error: null
    };
    const paymentData = {
      callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS,
    };

    adapter.setGooglePayDeliveryInfo.and.returnValue(of(mockUpdate));

    service.setGooglePayDeliveryInfo('user1', 'cart1', paymentData).subscribe(update => {
      expect(update).toEqual(mockUpdate);
    });
  });

  it('should handle error when setting Google Pay delivery info', (doneFn) => {
    const error = new Error('Error');
    const paymentData = {
      callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS,
    };
    adapter.setGooglePayDeliveryInfo.and.returnValue(throwError(() => error));

    let result;
    service.setGooglePayDeliveryInfo('user1', 'cart1', paymentData).subscribe({
      error: err => {
        result = err;
        doneFn();
      }
    });
    expect(result).toBe(error);
  });

});