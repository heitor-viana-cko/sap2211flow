import { TestBed } from '@angular/core/testing';
import { CheckoutComApplepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-applepay.adapter';
import { CheckoutComApplepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-applepay.connector';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-core/model/ApplePay';
import { generateOneApplePayPaymentRequest } from '@checkout-tests/fake-data/apm-applepay/applepay-payments.mock';

import { of, throwError } from 'rxjs';

describe('CheckoutComApplepayConnector', () => {
  let service: CheckoutComApplepayConnector;
  let adapter: jasmine.SpyObj<CheckoutComApplepayAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComApplepayAdapter', [
      'requestApplePayPaymentRequest',
      'validateApplePayMerchant',
      'authorizeApplePayPayment',
      'selectApplePayDeliveryAddress',
      'selectApplePayDeliveryMethod'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComApplepayConnector,
        {
          provide: CheckoutComApplepayAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComApplepayConnector);
    adapter = TestBed.inject(CheckoutComApplepayAdapter) as jasmine.SpyObj<CheckoutComApplepayAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request Apple Pay payment request with product code', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const productCode = 'product1';
    const applePayPaymentRequest: ApplePayPaymentRequest = generateOneApplePayPaymentRequest();

    adapter.requestApplePayPaymentRequest.and.returnValue(of(applePayPaymentRequest));

    let result;
    service.requestApplePayPaymentRequest(userId, cartId, productCode).subscribe(res => result = res);

    expect(result).toBe(applePayPaymentRequest);
    expect(adapter.requestApplePayPaymentRequest).toHaveBeenCalledWith(userId, cartId, productCode);
  });

  it('should validate Apple Pay merchant', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const validationURL = 'https://example.com/validate';
    const validationResult = { /* mock data */ };

    adapter.validateApplePayMerchant.and.returnValue(of(validationResult));

    let result;
    service.validateApplePayMerchant(userId, cartId, validationURL).subscribe(res => result = res);

    expect(result).toBe(validationResult);
    expect(adapter.validateApplePayMerchant).toHaveBeenCalledWith(userId, cartId, validationURL);
  });

  it('should handle error when validating Apple Pay merchant', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const validationURL = 'https://example.com/validate';
    const error = new Error('error');

    adapter.validateApplePayMerchant.and.returnValue(throwError(() => error));

    let result;
    service.validateApplePayMerchant(userId, cartId, validationURL).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.validateApplePayMerchant).toHaveBeenCalledWith(userId, cartId, validationURL);
  });

  it('should authorize Apple Pay payment', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const request = { /* mock data */ };
    const authorizationResult: ApplePayAuthorization = { /* mock data */ };

    adapter.authorizeApplePayPayment.and.returnValue(of(authorizationResult));

    let result;
    service.authorizeApplePayPayment(userId, cartId, request).subscribe(res => result = res);

    expect(result).toBe(authorizationResult);
    expect(adapter.authorizeApplePayPayment).toHaveBeenCalledWith(userId, cartId, request);
  });

  it('should handle error when authorizing Apple Pay payment', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const request = { /* mock data */ };
    const error = new Error('error');

    adapter.authorizeApplePayPayment.and.returnValue(throwError(() => error));

    let result;
    service.authorizeApplePayPayment(userId, cartId, request).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.authorizeApplePayPayment).toHaveBeenCalledWith(userId, cartId, request);
  });

  it('should select Apple Pay delivery address', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const shippingContact: ApplePayPaymentContact = { /* mock data */ };
    const shippingContactUpdate: ApplePayShippingContactUpdate = { /* mock data */ };

    adapter.selectApplePayDeliveryAddress.and.returnValue(of(shippingContactUpdate));

    let result;
    service.selectApplePayDeliveryAddress(userId, cartId, shippingContact).subscribe(res => result = res);

    expect(result).toBe(shippingContactUpdate);
    expect(adapter.selectApplePayDeliveryAddress).toHaveBeenCalledWith(userId, cartId, shippingContact);
  });

  it('should handle error when selecting Apple Pay delivery address', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const shippingContact: ApplePayPaymentContact = { /* mock data */ };
    const error = new Error('error');

    adapter.selectApplePayDeliveryAddress.and.returnValue(throwError(() => error));

    let result;
    service.selectApplePayDeliveryAddress(userId, cartId, shippingContact).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.selectApplePayDeliveryAddress).toHaveBeenCalledWith(userId, cartId, shippingContact);
  });

  it('should select Apple Pay delivery method', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const shippingMethod: ApplePayShippingMethod = { /* mock data */ };
    const shippingMethodUpdate: ApplePayShippingMethodUpdate = { /* mock data */ };

    adapter.selectApplePayDeliveryMethod.and.returnValue(of(shippingMethodUpdate));

    let result;
    service.selectApplePayDeliveryMethod(userId, cartId, shippingMethod).subscribe(res => result = res);

    expect(result).toBe(shippingMethodUpdate);
    expect(adapter.selectApplePayDeliveryMethod).toHaveBeenCalledWith(userId, cartId, shippingMethod);
  });

  it('should handle error when selecting Apple Pay delivery method', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const shippingMethod: ApplePayShippingMethod = { /* mock data */ };
    const error = new Error('error');

    adapter.selectApplePayDeliveryMethod.and.returnValue(throwError(() => error));

    let result;
    service.selectApplePayDeliveryMethod(userId, cartId, shippingMethod).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.selectApplePayDeliveryMethod).toHaveBeenCalledWith(userId, cartId, shippingMethod);
  });

});