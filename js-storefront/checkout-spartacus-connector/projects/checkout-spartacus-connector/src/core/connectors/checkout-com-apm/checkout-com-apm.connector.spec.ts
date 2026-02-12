import { TestBed } from '@angular/core/testing';
import { CheckoutComApmAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-apm.adapter';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { generateManyApmData, generateOneApmPaymentDetails } from '@checkout-tests/fake-data/apm.mock';
import { of, throwError } from 'rxjs';

describe('CheckoutComApmConnector', () => {
  let service: CheckoutComApmConnector;
  let adapter: jasmine.SpyObj<CheckoutComApmAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComApmAdapter', ['createApmPaymentDetails', 'requestAvailableApms']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComApmConnector,
        {
          provide: CheckoutComApmAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComApmConnector);
    adapter = TestBed.inject(CheckoutComApmAdapter) as jasmine.SpyObj<CheckoutComApmAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call adapter to create APM payment details', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const apmPaymentDetails = generateOneApmPaymentDetails();
    const apmPaymentDetailsResponse = {
      method: 'apm',
      id: '123'
    } as ApmPaymentDetails;

    adapter.createApmPaymentDetails.and.returnValue(of(apmPaymentDetailsResponse));

    let result;
    service.createApmPaymentDetails(userId, cartId, apmPaymentDetails).subscribe(res => result = res);

    expect(result).toEqual(apmPaymentDetailsResponse);
    expect(adapter.createApmPaymentDetails).toHaveBeenCalledWith(userId, cartId, apmPaymentDetails);
  });

  it('should handle error when adapter fails to create APM payment details', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const apmPaymentDetails = generateOneApmPaymentDetails();
    const error = new Error('error');

    adapter.createApmPaymentDetails.and.returnValue(throwError(() => error));

    let result;
    service.createApmPaymentDetails(userId, cartId, apmPaymentDetails).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.createApmPaymentDetails).toHaveBeenCalledWith(userId, cartId, apmPaymentDetails);
  });

  it('should call adapter to request available APMs', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const apmData = generateManyApmData(2);

    adapter.requestAvailableApms.and.returnValue(of(apmData));

    let result;
    service.requestAvailableApms(userId, cartId).subscribe(res => result = res);

    expect(result).toEqual(apmData);
    expect(adapter.requestAvailableApms).toHaveBeenCalledWith(userId, cartId);
  });

  it('should handle error when adapter fails to request available APMs', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const error = new Error('error');

    adapter.requestAvailableApms.and.returnValue(throwError(() => error));

    let result;
    service.requestAvailableApms(userId, cartId).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.requestAvailableApms).toHaveBeenCalledWith(userId, cartId);
  });
});