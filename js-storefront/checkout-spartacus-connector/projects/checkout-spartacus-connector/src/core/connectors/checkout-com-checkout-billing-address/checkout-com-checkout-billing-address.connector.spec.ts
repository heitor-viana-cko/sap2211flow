import { TestBed } from '@angular/core/testing';
import { CheckoutComCheckoutBillingAddressAdapter } from '@checkout-adapters/checkout-com-billing-address/checkout-com-checkout-billing-address.adapter';
import { of, throwError } from 'rxjs';
import { CheckoutComCheckoutBillingAddressConnector } from './checkout-com-checkout-billing-address.connector';
import createSpy = jasmine.createSpy;

const address = {
  id: 'addressId',
  firstName: 'John',
  lastName: 'Doe',
  line1: '123 Main St',
  city: 'Anytown',
  postalCode: '12345',
  country: {
    isocode: 'US'
  }
};

class MockCheckoutBillingAddressAdapter implements CheckoutComCheckoutBillingAddressAdapter {
  setBillingAddress = createSpy().and.returnValue(of({}));

  requestBillingAddress = createSpy().and.returnValue(of(address));

  setDeliveryAddressAsBillingAddress = createSpy().and.returnValue(of(address));
}

describe('CheckoutBillingAddressConnector', () => {
  let service: CheckoutComCheckoutBillingAddressConnector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutComCheckoutBillingAddressConnector,
        {
          provide: CheckoutComCheckoutBillingAddressAdapter,
          useClass: MockCheckoutBillingAddressAdapter
        }
      ]
    });

    service = TestBed.inject(CheckoutComCheckoutBillingAddressConnector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the billing address for the given user and cart', (doneFn) => {
    const userId = 'user123';
    const cartId = 'cart123';
    service['adapter'].requestBillingAddress = createSpy().and.returnValue(of(address));

    service.requestBillingAddress(userId, cartId).subscribe((result) => {
      expect(service['adapter'].requestBillingAddress).toHaveBeenCalledWith(userId, cartId);
      expect(result).toEqual(address);
      doneFn();
    });
  });

  it('should set the delivery address as the billing address for the given user and cart', (doneFn) => {
    const userId = 'user123';
    const cartId = 'cart123';
    const mockAddress = { id: 'addressId' };
    service['adapter'].setDeliveryAddressAsBillingAddress = createSpy().and.returnValue(of(mockAddress));

    service.setDeliveryAddressAsBillingAddress(userId, cartId, mockAddress).subscribe((result) => {
      expect(service['adapter'].setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(userId, cartId, mockAddress);
      expect(result).toEqual(mockAddress);
      doneFn();
    });
  });

  it('should handle errors when requesting the billing address fails', (doneFn) => {
    const userId = 'user123';
    const cartId = 'cart123';
    const mockError = new Error('Request failed');
    service['adapter'].requestBillingAddress = createSpy().and.returnValue(throwError(() => mockError));

    service.requestBillingAddress(userId, cartId).subscribe({
      error: (error) => {
        expect(service['adapter'].requestBillingAddress).toHaveBeenCalledWith(userId, cartId);
        expect(error).toBe(mockError);
        doneFn();
      }
    });
  });

  it('should handle errors when setting the delivery address as the billing address fails', (doneFn) => {
    const userId = 'user123';
    const cartId = 'cart123';
    const mockAddress = { id: 'addressId' };
    const mockError = new Error('Update failed');
    service['adapter'].setDeliveryAddressAsBillingAddress = createSpy().and.returnValue(throwError(() => mockError));

    service.setDeliveryAddressAsBillingAddress(userId, cartId, mockAddress).subscribe({
      error: (error) => {
        expect(service['adapter'].setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(userId, cartId, mockAddress);
        expect(error).toBe(mockError);
        doneFn();
      }
    });
  });
});
