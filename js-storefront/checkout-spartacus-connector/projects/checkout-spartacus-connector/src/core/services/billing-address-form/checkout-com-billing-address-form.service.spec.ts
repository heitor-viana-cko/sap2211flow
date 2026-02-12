import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComCheckoutBillingAddressFacade } from '@checkout-facades/checkout-com-checkout-billing-address.facade';
import { MockActiveCartFacade } from '@checkout-tests/services/cart-active.service.mock';
import { MockCheckoutComCheckoutBillingAddressFacade } from '@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { Address, CommandService, EventService, LoggerService, QueryService, UserIdService } from '@spartacus/core';
import { of } from 'rxjs';
import { CheckoutComBillingAddressFormService } from './checkout-com-billing-address-form.service';

const mockAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  line1: '123 Main St',
  town: 'Anytown',
  region: { isocodeShort: 'CA' },
  country: { isocode: 'US' },
  postalCode: '12345'
};

describe('CheckoutComBillingAddressFormService', () => {
  let service: CheckoutComBillingAddressFormService;

  let checkoutComConnector: CheckoutComConnector;
  let userIdService: UserIdService;
  let activeCartFacade: ActiveCartFacade;
  let queryService: QueryService;
  let commandService: CommandService;
  let eventService: EventService;
  let logger: LoggerService;
  let checkoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartFacade
        },
        QueryService,
        CommandService,
        EventService,
        LoggerService,
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    });
    service = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    userIdService = TestBed.inject(UserIdService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    queryService = TestBed.inject(QueryService);
    commandService = TestBed.inject(CommandService);
    eventService = TestBed.inject(EventService);
    logger = TestBed.inject(LoggerService);
    checkoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // OOTB:
  describe('getBillingAddressForm', () => {
    it('should create and return a form group with default values', () => {
      const form = service.getBillingAddressForm();
      expect(form).toBeTruthy();
      expect(form.get('firstName')).toBeTruthy();
      expect(form.get('lastName')).toBeTruthy();
      expect(form.get('line1')).toBeTruthy();
      expect(form.get('line2')).toBeTruthy();
      expect(form.get('town')).toBeTruthy();
      expect(form.get('region.isocodeShort')).toBeTruthy();
      expect(form.get('country.isocode')).toBeTruthy();
      expect(form.get('postalCode')).toBeTruthy();
    });
    it('should return the same form group instance if called multiple times', () => {
      const form1 = service.getBillingAddressForm();
      const form2 = service.getBillingAddressForm();
      expect(form1).toBe(form2);
    });
  });

  describe('setDeliveryAddressAsBillingAddress', () => {
    it('should set the billing address', () => {
      spyOn(checkoutBillingAddressFacade, 'setDeliveryAddressAsBillingAddress');
      service.setDeliveryAddressAsBillingAddress(mockAddress);
      expect(service['billingAddress']).toEqual(mockAddress);
      expect(checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(mockAddress);
    });

    it('should set billing address to undefined', () => {
      service.setDeliveryAddressAsBillingAddress(undefined);
      expect(service['billingAddress']).toBeUndefined();
    });

    it('should call checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress when address is provided', () => {
      const mockAddress = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as Address;
      spyOn(service['checkoutBillingAddressFacade'], 'setDeliveryAddressAsBillingAddress');

      service.setDeliveryAddressAsBillingAddress(mockAddress);

      expect(checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(mockAddress);
    });

    it('should not call checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress when address is undefined', () => {
      spyOn(service['checkoutBillingAddressFacade'], 'setDeliveryAddressAsBillingAddress');

      service.setDeliveryAddressAsBillingAddress(undefined);

      expect(checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress).not.toHaveBeenCalled();
    });
  });

  describe('isBillingAddressSameAsDeliveryAddress', () => {
    it('should return undefined if billing address is undefined', () => {
      service.setDeliveryAddressAsBillingAddress(undefined);
      expect(service.getBillingAddress()).toEqual(undefined);
    });

    it('should return mockAddress if billing address is undefined', () => {
      service.setDeliveryAddressAsBillingAddress(mockAddress);
      expect(service.isBillingAddressSameAsDeliveryAddress()).toEqual(true);
    });

    it('should return true if billing address is defined', () => {
      service.setDeliveryAddressAsBillingAddress(mockAddress);
      expect(service.isBillingAddressSameAsDeliveryAddress()).toEqual(true);
    });
  });

  describe('isBillingAddressFormValid', () => {
    it('should return false if form is invalid', () => {
      const form = service.getBillingAddressForm();
      form.patchValue({
        firstName: '',
        lastName: ''
      });
      expect(service.isBillingAddressFormValid()).toEqual(false);
    });

    it('should return true if form is valid', () => {
      const form = service.getBillingAddressForm();
      form.patchValue(mockAddress);
      expect(service.isBillingAddressFormValid()).toEqual(true);
    });
  });

  describe('markAllAsTouched', () => {
    it('should mark all form controls as touched', () => {
      const form = service.getBillingAddressForm();
      spyOn(form, 'markAllAsTouched');
      service.markAllAsTouched();
      expect(form.markAllAsTouched).toHaveBeenCalled();
    });
  });

  describe('setDeliveryAddress', () => {
    it('should set the delivery address when a valid address is provided', () => {
      const mockDeliveryAddress = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe'
      } as Address;
      service.setDeliveryAddress(mockDeliveryAddress);
      expect(service['deliveryAddress']).toEqual(mockDeliveryAddress);
    });

    it('should set the delivery address to undefined when no address is provided', () => {
      service.setDeliveryAddress(undefined);
      expect(service['deliveryAddress']).toBeUndefined();
    });
  });

  describe('requestBillingAddress', () => {
    it('should emit the billing address when it is available', (doneFn) => {
      const mockBillingAddress = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as Address;
      spyOn(checkoutBillingAddressFacade, 'requestBillingAddress').and.returnValue(of({
        data: mockBillingAddress,
        loading: false,
        error: false
      }));

      service.requestBillingAddress().subscribe((state) => {
        expect(state.data).toEqual(mockBillingAddress);
        doneFn();
      });
    });

    it('should set the delivery address as billing address when billing address is not available', (doneFn) => {
      spyOn(checkoutBillingAddressFacade, 'requestBillingAddress').and.returnValue(of({
        data: undefined,
        loading: false,
        error: false
      }));
      spyOn(checkoutBillingAddressFacade, 'setDeliveryAddressAsBillingAddress');
      service.setDeliveryAddress(mockAddress);

      service.requestBillingAddress().subscribe(() => {
        expect(checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(mockAddress);
        doneFn();
      });
    });

    it('should update areTheSameAddresses$ when billing and delivery addresses are compared', (doneFn) => {
      spyOn(checkoutBillingAddressFacade, 'requestBillingAddress').and.returnValue(of({
        data: mockAddress,
        loading: false,
        error: false
      }));
      spyOn(service, 'compareAddresses').and.returnValue(true);

      service.requestBillingAddress().subscribe(() => {
        service.getAreTheSameAddresses().subscribe((areSame) => {
          expect(areSame).toBeTrue();
          doneFn();
        });
      });
    });

    it('should not emit while the billing address request is loading', (doneFn) => {
      spyOn(checkoutBillingAddressFacade, 'requestBillingAddress').and.returnValue(of({
        data: undefined,
        loading: true,
        error: false
      }));

      service.requestBillingAddress().subscribe({
        next: () => fail('Should not emit while loading'),
        complete: () => {
          expect(service.billingAddress$.value).toBeUndefined();
          doneFn();
        }
      });
    });
  });

  describe('getBillingAddress', () => {
    it('should return the billing address if it is defined', () => {
      service.setDeliveryAddressAsBillingAddress(mockAddress);
      expect(service.getBillingAddress()).toEqual(mockAddress);
    });

    it('should return the form value if billing address is undefined', () => {
      service.setDeliveryAddressAsBillingAddress(undefined);
      const form = service.getBillingAddressForm();
      form.patchValue(mockAddress);
      expect(service.getBillingAddress()).toEqual(undefined);
    });

    it('should return billing address if it is defined', () => {
      service['billingAddress$'].next(mockAddress);
      expect(service.getBillingAddress()).toEqual(mockAddress);
    });

    it('should return undefined if billing address value are not defined', () => {
      service['billingAddress$'].next(undefined);
      expect(service.getBillingAddress()).toBeUndefined();
    });
  });

  describe('setBillingAddress', () => {
    it('should set billing address and delivery address', () => {
      const billingAddress = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as Address;
      service.setBillingAddress(billingAddress);
      expect(service.billingAddress$.value).toEqual(billingAddress);
    });

    it('should set billing address and undefined delivery address', () => {
      const billingAddress = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as Address;
      service.setBillingAddress(billingAddress);
      expect(service.billingAddress$.value).toEqual(billingAddress);
    });
  });

  describe('_sameAsDeliveryAddress$', () => {
    it('should initialize same as delivery address to true', () => {
      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
    });

    it('should set same as delivery address to true and dispatch event', () => {
      const deliveryAddress = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Doe'
      } as Address;
      spyOn(service['eventService'], 'dispatch');
      service.setSameAsDeliveryAddress(true);
      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
    });

    it('should set same as delivery address to false without dispatching event', () => {
      spyOn(service['eventService'], 'dispatch');
      service.setSameAsDeliveryAddress(false);
      expect(service.getSameAsDeliveryAddressValue()).toBeFalse();
      expect(service['eventService'].dispatch).not.toHaveBeenCalled();
    });
  });

  describe('isBillingAddressSameAsDeliveryAddress()', () => {
    it('should return true when billing address is the same as delivery address', () => {
      service.setSameAsDeliveryAddress(true);
      expect(service.isBillingAddressSameAsDeliveryAddress()).toBeTrue();
    });

    it('should return false when billing address is not the same as delivery address', () => {
      service.setSameAsDeliveryAddress(false);
      expect(service.isBillingAddressSameAsDeliveryAddress()).toBeFalse();
    });
  });

  describe('getSameAsDeliveryAddress()', () => {
    it('should return the current value of same as delivery address', () => {
      service['_sameAsDeliveryAddress'].next(true);
      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
    });

    it('should return false when same as delivery address is set to false', () => {
      service['_sameAsDeliveryAddress'].next(false);
      expect(service.getSameAsDeliveryAddressValue()).toBeFalse();
    });
  });

  describe('getSameAsDeliveryAddressValue()', () => {
    it('sets same as delivery address to true and updates billing address when not first load', () => {
      spyOn(service, 'setDeliveryAddressAsBillingAddress');
      service.setDeliveryAddress(mockAddress);

      service.setSameAsDeliveryAddress(true, false);

      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
      expect(service.setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(mockAddress);
    });

    it('does not update billing address when setting same as delivery address to true on first load', () => {
      spyOn(service, 'setDeliveryAddressAsBillingAddress');
      service.setDeliveryAddress(mockAddress);

      service.setSameAsDeliveryAddress(true, true);

      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
      expect(service.setDeliveryAddressAsBillingAddress).not.toHaveBeenCalled();
    });

    it('updates same as delivery address to false without modifying billing address', () => {
      spyOn(service, 'setDeliveryAddressAsBillingAddress');

      service.setSameAsDeliveryAddress(false);

      expect(service.getSameAsDeliveryAddressValue()).toBeFalse();
      expect(service.setDeliveryAddressAsBillingAddress).not.toHaveBeenCalled();
    });
  });

  describe('setSameAsDeliveryAddress()', () => {
    it('should set same as delivery address to true and dispatch event with delivery address', () => {
      service.setDeliveryAddress(mockAddress);
      spyOn(service, 'setDeliveryAddressAsBillingAddress');
      service.setSameAsDeliveryAddress(true);
      expect(service.getSameAsDeliveryAddressValue()).toBeTrue();
      expect(service.setDeliveryAddressAsBillingAddress).toHaveBeenCalledWith(mockAddress);
    });

    it('should set same as delivery address to false without dispatching event', () => {
      spyOn(service, 'setDeliveryAddressAsBillingAddress');
      service.setSameAsDeliveryAddress(false);
      expect(service.getSameAsDeliveryAddressValue()).toBeFalse();
      expect(service.setDeliveryAddressAsBillingAddress).not.toHaveBeenCalled();
    });
  });

  describe('compareAddresses', () => {
    it('should return false if either billingAddress or deliveryAddress is undefined', () => {
      expect(service.compareAddresses(undefined, mockAddress)).toBeFalse();
      expect(service.compareAddresses(mockAddress, undefined)).toBeFalse();
      expect(service.compareAddresses(undefined, undefined)).toBeFalse();
    });

    it('should return true if billingAddress and deliveryAddress have the same id', () => {
      const addressWithSameId = {
        ...mockAddress,
        id: '1'
      };
      expect(service.compareAddresses(addressWithSameId, addressWithSameId)).toBeTrue();
    });

    it('should return true if billingAddress and deliveryAddress have different ids only', () => {
      const address1 = {
        ...mockAddress,
        id: '1'
      };
      const address2 = {
        ...mockAddress,
        id: '2'
      };
      expect(service.compareAddresses(address1, address2)).toBeTrue();
    });

    it('should return true if all relevant fields match between billingAddress and deliveryAddress', () => {
      const deliveryAddress = {
        ...mockAddress,
        id: '2'
      };
      expect(service.compareAddresses(mockAddress, deliveryAddress)).toBeTrue();
    });

    it('should return false if any relevant field does not match between billingAddress and deliveryAddress', () => {
      const deliveryAddress = {
        id: '200', ...mockAddress,
        line1: '456 Another St'
      };
      expect(service.compareAddresses(mockAddress, deliveryAddress)).toBeFalse();
    });

    it('should return true if region objects match by isocode or isocodeShort', () => {
      const billingAddress = {
        id: '100', ...mockAddress,
        region: {
          isocode: 'CA',
          isocodeShort: 'CA'
        }
      };
      const deliveryAddress = {
        id: '200', ...mockAddress,
        region: {
          isocode: 'CA',
          isocodeShort: 'CA'
        }
      };
      expect(service.compareAddresses(billingAddress, deliveryAddress)).toBeTrue();
    });

    it('should return false if region objects do not match', () => {
      const billingAddress = {
        id: '100', ...mockAddress,
        region: {
          isocode: 'CA',
          isocodeShort: 'CA'
        }
      };
      const deliveryAddress = {
        id: '200', ...mockAddress,
        region: {
          isocode: 'NY',
          isocodeShort: 'NY'
        }
      };
      expect(service.compareAddresses(billingAddress, deliveryAddress)).toBeFalse();
    });

    it('should return true if country objects match by isocode and name', () => {
      const billingAddress = {
        ...mockAddress,
        country: {
          isocode: 'US',
          name: 'United States'
        }
      };
      const deliveryAddress = {
        ...mockAddress,
        country: {
          isocode: 'US',
          name: 'United States'
        }
      };
      expect(service.compareAddresses(billingAddress, deliveryAddress)).toBeTrue();
    });

    it('should return false if country objects do not match', () => {
      const billingAddress = {
        id: '100', ...mockAddress,
        country: {
          isocode: 'US',
          name: 'United States'
        }
      };
      const deliveryAddress = {
        id: '200', ...mockAddress,
        country: {
          isocode: 'CA',
          name: 'Canada'
        }
      };
      expect(service.compareAddresses(billingAddress, deliveryAddress)).toBeFalse();
    });
  });

  describe('toggleEditMode()', () => {
    it('should toggle edit mode from false to true', () => {
      service.setEditToggleState(false);
      service.toggleEditMode();
      expect(service.isEditModeEnabledValue()).toBeTrue();
    });

    it('should toggle edit mode from true to false', () => {
      service.setEditToggleState(true);
      service.toggleEditMode();
      expect(service.isEditModeEnabledValue()).toBeFalse();
    });
  });

  describe('isEditModeEnabled', () => {
    it('should return an observable that emits the current edit mode status as true', (doneFn) => {
      service.setEditToggleState(true);
      service.isEditModeEnabled().subscribe((status) => {
        expect(status).toBeTrue();
        doneFn();
      });
    });

    it('should return an observable that emits the current edit mode status as false', (doneFn) => {
      service.setEditToggleState(false);
      service.isEditModeEnabled().subscribe((status) => {
        expect(status).toBeFalse();
        doneFn();
      });
    });
  });

  describe('isEditModeEnabledValue', () => {
    it('should return true when edit mode is enabled', () => {
      service.setEditToggleState(true);
      expect(service.isEditModeEnabledValue()).toBeTrue();
    });

    it('should return false when edit mode is disabled', () => {
      service.setEditToggleState(false);
      expect(service.isEditModeEnabledValue()).toBeFalse();
    });
  });

  describe('setEditToggleState', () => {
    it('should set edit mode state to true', () => {
      service.setEditToggleState(true);
      expect(service.isEditModeEnabledValue()).toBeTrue();
    });

    it('should set edit mode state to false', () => {
      service.setEditToggleState(false);
      expect(service.isEditModeEnabledValue()).toBeFalse();
    });
  });

  describe('getAreTheSameAddresses', () => {
    it('should return an observable that emits true when addresses are the same', (doneFn) => {
      service['areTheSameAddresses$'].next(true);
      service.getAreTheSameAddresses().subscribe((areSame) => {
        expect(areSame).toBeTrue();
        doneFn();
      });
    });

    it('should return an observable that emits false when addresses are not the same', (doneFn) => {
      service['areTheSameAddresses$'].next(false);
      service.getAreTheSameAddresses().subscribe((areSame) => {
        expect(areSame).toBeFalse();
        doneFn();
      });
    });
  });
});
