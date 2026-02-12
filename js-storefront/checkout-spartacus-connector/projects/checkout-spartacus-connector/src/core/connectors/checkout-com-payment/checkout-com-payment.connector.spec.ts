import { TestBed } from '@angular/core/testing';
import { CheckoutComPaymentAdapter } from '@checkout-adapters/checkout-com-payment/checkout-com-payment.adapter';
import { CheckoutComOrderConnector } from '@checkout-core/connectors/checkout-com-order/checkout-com-order.connector';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { Address } from '@spartacus/core';
import { of, throwError } from 'rxjs';

const mockBillingAddress = generateOneAddress();

const userId = 'user1';
const cartId = 'cart1';
const paymentDetails: CheckoutComPaymentDetails = {
  accountHolderName: 'Jane Doe',
  billingAddress: mockBillingAddress,
  cardType: {
    code: 'visa',
  },
  cardNumber: '4111111111111111',
  defaultPayment: true,
  expiryMonth: '12',
  expiryYear: '2023',
  id: '123',
  paymentToken: 'token123',
  subscriptionId: 'sub123'
};

describe('CheckoutComPaymentConnector', () => {
  let service: CheckoutComPaymentConnector;
  let adapter: jasmine.SpyObj<CheckoutComPaymentAdapter>;

  beforeEach(() => {
    const adapterSpy = jasmine.createSpyObj('CheckoutComPaymentAdapter', [
      'createPaymentDetails',
      'updatePaymentDetails',
      'setPaymentAddress'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComPaymentConnector,
        {
          provide: CheckoutComPaymentAdapter,
          useValue: adapterSpy
        },
      ],
    });

    service = TestBed.inject(CheckoutComPaymentConnector);
    adapter = TestBed.inject(CheckoutComPaymentAdapter) as jasmine.SpyObj<CheckoutComPaymentAdapter>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create payment details for valid user and cart', () => {
    adapter.createPaymentDetails.and.returnValue(of(paymentDetails));

    let result;
    service.createPaymentDetails(userId, cartId, paymentDetails).subscribe(res => result = res);

    expect(result).toBe(paymentDetails);
    expect(adapter.createPaymentDetails).toHaveBeenCalledWith(userId, cartId, paymentDetails);
  });

  it('should handle error when adapter fails to create payment details', () => {
    const error = new Error('error');

    adapter.createPaymentDetails.and.returnValue(throwError(() => error));

    let result;
    service.createPaymentDetails(userId, cartId, paymentDetails).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.createPaymentDetails).toHaveBeenCalledWith(userId, cartId, paymentDetails);
  });

  it('should update payment details for valid user and cart', () => {
    adapter.updatePaymentDetails.and.returnValue(of(null));

    let result;
    service.updatePaymentDetails(userId, paymentDetails).subscribe(res => result = res);

    expect(result).toBe(null);
    expect(adapter.updatePaymentDetails).toHaveBeenCalledWith(userId, paymentDetails);
  });

  it('should handle error when adapter fails to update payment details', () => {
    const error = new Error('error');

    adapter.updatePaymentDetails.and.returnValue(throwError(() => error));

    let result;
    service.updatePaymentDetails(userId, paymentDetails).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.updatePaymentDetails).toHaveBeenCalledWith(userId, paymentDetails);
  });

  it('should set payment address for valid user and cart', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const address: Address = mockBillingAddress;

    adapter.setPaymentAddress.and.returnValue(of(address));

    let result;
    service.setPaymentAddress(userId, cartId, address).subscribe(res => result = res);

    expect(result).toBe(address);
    expect(adapter.setPaymentAddress).toHaveBeenCalledWith(userId, cartId, address);
  });

  it('should handle error when adapter fails to set payment address', () => {
    const userId = 'user1';
    const cartId = 'cart1';
    const address: Address = mockBillingAddress;
    const error = new Error('error');

    adapter.setPaymentAddress.and.returnValue(throwError(() => error));

    let result;
    service.setPaymentAddress(userId, cartId, address).subscribe({
      next: () => {
      },
      error: err => result = err
    });

    expect(result).toBe(error);
    expect(adapter.setPaymentAddress).toHaveBeenCalledWith(userId, cartId, address);
  });

});