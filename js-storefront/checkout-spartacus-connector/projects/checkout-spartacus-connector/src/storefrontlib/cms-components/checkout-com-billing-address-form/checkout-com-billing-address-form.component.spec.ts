import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComCheckoutBillingAddressFacade } from '@checkout-facades/checkout-com-checkout-billing-address.facade';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { MockCxSpinnerComponent } from '@checkout-tests/components';
import { generateAddressFromFromAddress, generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { queryDebugElementByCss } from '@checkout-tests/finders.mock';
import { MockCheckoutComBillingAddressFormService } from '@checkout-tests/services/checkout-billing-address-form.service.mock';
import { MockCheckoutComCheckoutBillingAddressFacade } from '@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockCheckoutDeliveryAddressFacade } from '@checkout-tests/services/chekout-delivery-address.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { MockUserAddressService } from '@checkout-tests/services/user-address.service.mock';
import { MockUserPaymentService } from '@checkout-tests/services/user-payment.service.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  Country,
  EventService,
  FeaturesConfigModule,
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  I18nTestingModule,
  LoggerService,
  QueryState,
  Region,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { CardComponent, FormErrorsModule, LaunchDialogService, NgSelectA11yModule } from '@spartacus/storefront';
import { BehaviorSubject, of, throwError } from 'rxjs';

const mockDeliveryAddress: Address = generateOneAddress();
const mockAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart',
  line2: 'line2',
  town: 'town',
  region: {
    isocode: 'JP-27',
    isocodeShort: '27'
  },
  postalCode: 'zip',
  country: { isocode: 'AD' }
};
const mockCountries: Country[] = [
  {
    isocode: 'AD',
    name: 'Andorra'
  },
  {
    isocode: 'RS',
    name: 'Serbia'
  }
];
const formData = generateAddressFromFromAddress(mockAddress);
const mockBillingAddress: Address = {
  country: {
    isocode: 'US'
  },
  defaultAddress: false,
  firstName: 'Test',
  formattedAddress: 'Address1, , New York, City, 000001',
  id: '8796126248983',
  lastName: 'User',
  line1: 'Address1',
  line2: '',
  phone: '',
  postalCode: '000001',
  region: {
    isocode: 'US-NY'
  },
  shippingAddress: false,
  title: 'Mr.',
  titleCode: 'mr',
  town: 'City',
  visibleInAddressBook: true
};

describe('CheckoutComBillingAddressFormComponent', () => {
  let component: CheckoutComBillingAddressFormComponent;
  let fixture: ComponentFixture<CheckoutComBillingAddressFormComponent>;
  let userAddressService: UserAddressService;
  let userPaymentService: UserPaymentService;
  let checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let logger: LoggerService;
  let eventService: EventService;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComBillingAddressFormComponent,
        MockCxSpinnerComponent,
        CardComponent
      ],
      imports: [
        ReactiveFormsModule,
        I18nTestingModule,
        NgSelectModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule
      ],
      providers: [
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useClass: MockCheckoutDeliveryAddressFacade
        },
        {
          provide: UserPaymentService,
          useClass: MockUserPaymentService
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: UserAddressService,
          useClass: MockUserAddressService
        },
        {
          provide: CheckoutBillingAddressFormService,
          useClass: MockCheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        }
      ]
    }).overrideComponent(CheckoutComBillingAddressFormComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComBillingAddressFormComponent);
    userAddressService = TestBed.inject(UserAddressService);
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    component = fixture.componentInstance;
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getAllBillingCountries', () => {
    it('should fetch all billing countries and assign them to countries$', (done) => {
      const mockCountries = [{
        isocode: 'US',
        name: 'United States'
      }];
      spyOn(userPaymentService, 'getAllBillingCountries').and.returnValue(of(mockCountries));

      component.getAllBillingCountries();

      component.countries$.subscribe((countries) => {
        expect(countries).toEqual(mockCountries);
        expect(userPaymentService.loadBillingCountries).not.toHaveBeenCalled();
        done();
      });
    });

    it('should load billing countries if store is empty', (done) => {
      spyOn(userPaymentService, 'getAllBillingCountries').and.returnValue(of([]));

      component.getAllBillingCountries();

      component.countries$.subscribe(() => {
        expect(userPaymentService.loadBillingCountries).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getDeliveryAddressState', () => {
    it('should fetch delivery address state and assign it to deliveryAddress$', (done) => {
      const mockAddressState: QueryState<Address> = {
        loading: false,
        data: mockDeliveryAddress,
        error: false
      };
      spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of(mockAddressState));
      spyOn(billingAddressFormService, 'setDeliveryAddress');

      component.getDeliveryAddressState();

      component.deliveryAddress$.subscribe((address) => {
        expect(address).toEqual(mockDeliveryAddress);
        expect(billingAddressFormService.setDeliveryAddress).toHaveBeenCalledWith(mockDeliveryAddress);
        done();
      });
    });

    it('should handle error when fetching delivery address state', (done) => {
      const error = new Error('Error');
      spyOn(component['logger'], 'error');
      spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(throwError(() => error));

      component.getDeliveryAddressState();

      component.deliveryAddress$.subscribe({
        next: (error) => {
          expect(component['logger'].error).toHaveBeenCalledWith('Error fetching delivery address', { error });
          done();
        }
      });
    });

    it('should not assign delivery address if state is still loading', () => {
      const mockLoadingState: QueryState<Address> = {
        loading: true,
        data: null,
        error: false
      };
      spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of(mockLoadingState));
      spyOn(billingAddressFormService, 'setDeliveryAddress');

      component.getDeliveryAddressState();

      // deliveryAddress$ no emitirá nada porque state.loading = true
      expect(billingAddressFormService.setDeliveryAddress).not.toHaveBeenCalled();
    });
  });

  describe('bindDeliveryAddressCheckbox', () => {
    it('should set showSameAsDeliveryAddressCheckbox to true when delivery address country matches a billing country', (done) => {
      const mockCountries: Country[] = [{ isocode: 'US' }];
      const mockAddress: Address = { country: { isocode: 'US' } };
      component.countries$ = of(mockCountries);
      component.deliveryAddress$ = of(mockAddress);

      component.bindDeliveryAddressCheckbox();

      component.showSameAsDeliveryAddressCheckbox$.subscribe((showCheckbox) => {
        expect(showCheckbox).toBeTrue();
        expect(component['showSameAsDeliveryAddressCheckbox']).toBeTrue();
        done();
      });
    });

    it('should set showSameAsDeliveryAddressCheckbox to false when delivery address country does not match any billing country', (done) => {
      const mockCountries: Country[] = [{ isocode: 'US' }];
      const mockAddress: Address = { country: { isocode: 'CA' } };
      component.countries$ = of(mockCountries);
      component.deliveryAddress$ = of(mockAddress);

      component.bindDeliveryAddressCheckbox();

      component.showSameAsDeliveryAddressCheckbox$.subscribe((showCheckbox) => {
        expect(showCheckbox).toBeFalse();
        expect(component['showSameAsDeliveryAddressCheckbox']).toBeFalse();
        done();
      });
    });

    it('should set showSameAsDeliveryAddressCheckbox to false when delivery address has no country', (done) => {
      const mockCountries: Country[] = [{ isocode: 'US' }];
      const mockAddress: Address = {};
      component.countries$ = of(mockCountries);
      component.deliveryAddress$ = of(mockAddress);

      component.bindDeliveryAddressCheckbox();

      component.showSameAsDeliveryAddressCheckbox$.subscribe((showCheckbox) => {
        expect(showCheckbox).toBeFalse();
        expect(component['showSameAsDeliveryAddressCheckbox']).toBeFalse();
        done();
      });
    });

    it('should set showSameAsDeliveryAddressCheckbox to false when countries list is empty', (done) => {
      const mockCountries: Country[] = [];
      const mockAddress: Address = { country: { isocode: 'US' } };
      component.countries$ = of(mockCountries);
      component.deliveryAddress$ = of(mockAddress);

      component.bindDeliveryAddressCheckbox();

      component.showSameAsDeliveryAddressCheckbox$.subscribe((showCheckbox) => {
        expect(showCheckbox).toBeFalse();
        expect(component['showSameAsDeliveryAddressCheckbox']).toBeFalse();
        done();
      });
    });

    it('should set showSameAsDeliveryAddressCheckbox to false when both countries and delivery address are undefined', (done) => {
      component.countries$ = of(undefined);
      component.deliveryAddress$ = of(undefined);

      component.bindDeliveryAddressCheckbox();

      component.showSameAsDeliveryAddressCheckbox$.subscribe((showCheckbox) => {
        expect(showCheckbox).toBeFalse();
        expect(component['showSameAsDeliveryAddressCheckbox']).toBeFalse();
        done();
      });
    });
  });

  describe('bindSameAsDeliveryAddressCheckbox', () => {
    it('should set sameAsDeliveryAddress to true and reset the billing address form when addresses are the same', () => {
      spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(true));
      spyOn(billingAddressFormService.getBillingAddressForm(), 'reset');

      component.bindSameAsDeliveryAddressCheckbox();

      expect(component.sameAsDeliveryAddress).toBeTrue();
      expect(billingAddressFormService.getBillingAddressForm().reset).toHaveBeenCalled();
    });

    it('should set sameAsDeliveryAddress to false when addresses are not the same', () => {
      spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));

      component.bindSameAsDeliveryAddressCheckbox();

      expect(component.sameAsDeliveryAddress).toBeFalse();
    });

    it('should handle errors gracefully when getAreTheSameAddresses throws an error', () => {
      const error = new Error('Error fetching address comparison');
      spyOn(component['logger'], 'error');
      spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(throwError(() => error));

      expect(() => component.bindSameAsDeliveryAddressCheckbox()).not.toThrow();
    });
  });

  describe('getRegionBindingLabel', () => {

    it('should enable region control when regions are available', (done) => {
      const mockRegions: Region[] = [{
        isocode: 'CA-ON',
        name: 'Ontario'
      }];
      spyOn(userAddressService, 'getRegions').and.returnValue(of(mockRegions));
      component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
      component.countrySelected(mockCountries[0]);
      //component.selectedCountry$ = of('CA') as BehaviorSubject<string>;
      component.bindRegionsChanges();
      fixture.detectChanges();

      component.regions$.subscribe(() => {
        const regionControl = component.billingAddressForm.get('region.isocodeShort');
        expect(regionControl.enabled).toBeTrue();
        done();
      });
    });

    it('should disable region control when no regions are available', (done) => {
      spyOn(userAddressService, 'getRegions').and.returnValue(of([]));
      component.selectedCountry$ = of('CA') as BehaviorSubject<string>;

      component.bindRegionsChanges();

      component.regions$.subscribe(() => {
        const regionControl = component.billingAddressForm.get('region.isocodeShort');
        expect(regionControl.disabled).toBeTrue();
        done();
      });
    });

    it('should return name when regions have name property', () => {
      const regions: Region[] = [{
        isocode: 'CA-ON',
        name: 'Ontario'
      }];
      const result = component.getRegionBindingLabel(regions);
      expect(result).toBe('name');
    });

    it('should return isocodeShort when regions have isocodeShort property', () => {
      const regions: Region[] = [{
        isocode: 'CA-ON',
        isocodeShort: 'ON'
      }];
      const result = component.getRegionBindingLabel(regions);
      expect(result).toBe('isocodeShort');
    });

    it('should return isocode when regions have neither name nor isocodeShort property', () => {
      const regions: Region[] = [{ isocode: 'CA-ON' }];
      const result = component.getRegionBindingLabel(regions);
      expect(result).toBe('isocode');
    });

    it('should return isocode when regions array is empty', () => {
      const regions: Region[] = [];
      const result = component.getRegionBindingLabel(regions);
      expect(result).toBe('isocode');
    });

    it('should return isocode when regions is undefined', () => {
      const result = component.getRegionBindingLabel(undefined);
      expect(result).toBe('isocode');
    });
  });

  describe('getRegionBindingValue', () => {
    it('should return isocode when regions have isocode property', () => {
      const regions: Region[] = [{ isocode: 'CA-ON' }];
      const result = component.getRegionBindingValue(regions);
      expect(result).toBe('isocode');
    });

    it('should return isocodeShort when regions have isocodeShort property', () => {
      const regions: Region[] = [{ isocodeShort: 'ON' }];
      const result = component.getRegionBindingValue(regions);
      expect(result).toBe('isocodeShort');
    });

    it('should return isocode when regions have neither isocode nor isocodeShort property', () => {
      const regions: Region[] = [{}];
      const result = component.getRegionBindingValue(regions);
      expect(result).toBe('isocode');
    });

    it('should return isocode when regions array is empty', () => {
      const regions: Region[] = [];
      const result = component.getRegionBindingValue(regions);
      expect(result).toBe('isocode');
    });

    it('should return isocode when regions is undefined', () => {
      const result = component.getRegionBindingValue(undefined);
      expect(result).toBe('isocode');
    });
  });

  describe('submitForm', () => {
    it('should call updatePaymentAddress and disable edit mode when form is valid', (done) => {
      component.billingAddressForm.patchValue(mockAddress);
      spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(of(null));
      spyOn(component, 'disableEditMode');

      component.submitForm();

      expect(checkoutComFlowFacade.updatePaymentAddress).toHaveBeenCalledWith(component.billingAddressForm.value);
      expect(component.disableEditMode).toHaveBeenCalled();
      done();
    });

    it('should show errors when form is invalid', () => {
      component.billingAddressForm.setErrors({ invalid: true });
      spyOn(component.billingAddressForm, 'markAllAsTouched');

      component.submitForm();

      expect(component.billingAddressForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should handle error when updatePaymentAddress fails', (done) => {
      const error = new Error('Error');
      component.billingAddressForm.patchValue(mockAddress);
      spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(throwError(() => error));
      spyOn(component, 'showErrors');

      component.submitForm();

      expect(component.showErrors).toHaveBeenCalledWith(
        undefined,
        'CheckoutComBillingAddressFormComponent::submitForm',
        error
      );
      done();
    });
  });

  describe('enableEditMode', () => {
    it('should enable edit mode by setting edit toggle state to true', () => {
      spyOn(billingAddressFormService, 'setEditToggleState');
      component.enableEditMode();
      expect(billingAddressFormService.setEditToggleState).toHaveBeenCalledWith(true);
    });
  });

  describe('disableEditMode', () => {
    it('should enable edit mode by setting edit toggle state to true', () => {
      spyOn(billingAddressFormService, 'setEditToggleState');
      component.disableEditMode();
      expect(billingAddressFormService.setEditToggleState).toHaveBeenCalledWith(false);
    });
  });

  describe('toggleSameAsDeliveryAddress', () => {
    it('should toggle sameAsDeliveryAddress and dispatch event when true', () => {
      spyOn(component['eventService'], 'dispatch');
      component.sameAsDeliveryAddress = true;
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(!component.sameAsDeliveryAddress));
      component.toggleSameAsDeliveryAddress();

      expect(component['billingAddressFormService'].getSameAsDeliveryAddressValue()).toBeFalse();
    });

    it('should toggle sameAsDeliveryAddress and not dispatch event when false', () => {
      spyOn(component['eventService'], 'dispatch');
      component.sameAsDeliveryAddress = false;
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(!component.sameAsDeliveryAddress));

      component.toggleSameAsDeliveryAddress();

      expect(component['billingAddressFormService'].getSameAsDeliveryAddressValue()).toBeTrue();
    });

    it('should call setSameAsDeliveryAddress with true when sameAsDeliveryAddress is true', () => {
      component.sameAsDeliveryAddress = true;
      spyOn(billingAddressFormService, 'setSameAsDeliveryAddress');

      component.toggleSameAsDeliveryAddress();

      expect(billingAddressFormService.setSameAsDeliveryAddress).toHaveBeenCalledWith(false);
    });

    it('should call setSameAsDeliveryAddress with false when sameAsDeliveryAddress is false', () => {
      component.sameAsDeliveryAddress = false;
      spyOn(billingAddressFormService, 'setSameAsDeliveryAddress');

      component.toggleSameAsDeliveryAddress();

      expect(billingAddressFormService.setSameAsDeliveryAddress).toHaveBeenCalledWith(true);
    });

  });

  describe('bindLoadingState', () => {
    it('should update processing$ observable with loading state', (done) => {
      const mockLoadingState: QueryState<CheckoutComPaymentDetails> = {
        loading: true,
        data: null,
        error: false
      };
      spyOn(checkoutComFlowFacade, 'getPaymentDetailsState').and.returnValue(of(mockLoadingState));

      component.bindLoadingState();

      component.processing$.subscribe((loading) => {
        expect(loading).toBeTrue();
        done();
      });
    });

    it('should update processing$ observable with non-loading state', (done) => {
      const mockNonLoadingState: QueryState<CheckoutComPaymentDetails> = {
        loading: false,
        data: null,
        error: false
      };
      spyOn(checkoutComFlowFacade, 'getPaymentDetailsState').and.returnValue(of(mockNonLoadingState));

      component.bindLoadingState();

      component.processing$.subscribe((loading) => {
        expect(loading).toBeFalse();
        done();
      });
    });
  });

  describe('showErrors', () => {
    it('should add an error message and log the error', () => {
      const text = 'Error message';
      const logMessage = 'Log message';
      const errorMessage = new Error('Error');
      spyOn(component['logger'], 'error');

      component.showErrors(text, logMessage, errorMessage);

      expect(component['globalMessageService'].add).toHaveBeenCalledWith(
        text,
        GlobalMessageType.MSG_TYPE_ERROR
      );
      expect(component['logger'].error).toHaveBeenCalledWith(logMessage, { error: errorMessage });
    });
  });

  describe('getAddressCardContent', () => {
    it('should return card content with region when address has region', (done) => {
      component.sameAsDeliveryAddress = true;
      component.selected = undefined;
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        line1: '123 Main St',
        line2: 'Apt 4',
        town: 'Springfield',
        region: { isocode: 'CA-ON' },
        country: { isocode: 'CA' },
        postalCode: '12345',
        phone: '123-456-7890'
      };

      component.getAddressCardContent(address).subscribe((card) => {
        expect(card).toEqual({
          textBold: 'John Doe',
          text: [
            '123 Main St',
            'Apt 4',
            'Springfield, CA-ON, CA',
            '12345',
            'addressCard.phoneNumber: 123-456-7890'
          ],
          header: '',
          actions: []
        });

        done();
      });
    });

    it('should return card content without region when address has no region', (done) => {
      component.sameAsDeliveryAddress = true;
      component.selected = undefined;
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        line1: '123 Main St',
        line2: 'Apt 4',
        town: 'Springfield',
        country: { isocode: 'CA' },
        postalCode: '12345',
        phone: '123-456-7890'
      };
      component.getAddressCardContent(address).subscribe((card) => {
        expect(card).toEqual({
          textBold: 'John Doe',
          text: [
            '123 Main St',
            'Apt 4',
            'Springfield, CA',
            '12345',
            'addressCard.phoneNumber: 123-456-7890'
          ],
          header: '',
          actions: []
        });
        done();
      });
    });

    it('should return card content with empty fields when address fields are empty', () => {
      component.sameAsDeliveryAddress = true;
      component.selected = undefined;
      const address: Address = {
        firstName: '',
        lastName: '',
        line1: '',
        line2: '',
        town: '',
        region: { isocode: '' },
        country: { isocode: '' },
        postalCode: '',
        phone: ''
      };
      component.getAddressCardContent(address).subscribe((card) => {
        expect(card).toEqual({
          textBold: ' ',
          text: [
            '',
            '',
            ', ',
            '',
            ''
          ],
          header: '',
          actions: []
        });
      });
    });

    it('should return card content with actions', (done) => {
      component['showSameAsDeliveryAddressCheckbox'] = true;
      component.sameAsDeliveryAddress = false;
      component.selected = undefined;
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(true));
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        line1: '123 Main St',
        line2: 'Apt 4',
        town: 'Springfield',
        region: { isocode: 'CA-ON' },
        country: { isocode: 'CA' },
        postalCode: '12345',
        phone: '123-456-7890'
      };

      component.getAddressCardContent(address).subscribe((card) => {
        expect(card).toEqual({
          textBold: 'John Doe',
          text: [
            '123 Main St',
            'Apt 4',
            'Springfield, CA-ON, CA',
            '12345',
            'addressCard.phoneNumber: 123-456-7890'
          ],
          header: '',
          actions: [
            {
              event: 'select',
              name: 'selectText'
            },
            {
              event: 'edit',
              name: 'common.edit'
            }]
        });
        done();
      });
    });

    it('should return card content with actions and selected header', (done) => {
      component['showSameAsDeliveryAddressCheckbox'] = true;
      component.sameAsDeliveryAddress = false;
      component.selected = mockAddress;
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(true));
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        line1: '123 Main St',
        line2: 'Apt 4',
        town: 'Springfield',
        region: { isocode: 'CA-ON' },
        country: { isocode: 'CA' },
        postalCode: '12345',
        phone: '123-456-7890'
      };

      component.getAddressCardContent(address).subscribe((card) => {
        expect(card).toEqual({
          textBold: 'John Doe',
          text: [
            '123 Main St',
            'Apt 4',
            'Springfield, CA-ON, CA',
            '12345',
            'addressCard.phoneNumber: 123-456-7890'
          ],
          header: 'addressCard.selected',
          actions: [
            {
              event: 'select',
              name: 'selectText'
            },
            {
              event: 'edit',
              name: 'common.edit'
            }]
        });
        done();
      });
    });
  });

  describe('editBillingAddress', () => {
    it('should enable edit mode when called', () => {
      spyOn(component, 'enableEditMode');

      component.editBillingAddress();

      expect(component.enableEditMode).toHaveBeenCalled();
    });
  });

  describe('isFlowEnabled', () => {
    it('should set isFlowEnabled$ to true when the flow is enabled', (done) => {
      spyOn(checkoutComFlowFacade, 'getIsFlowEnabled').and.returnValue(of(true));

      component.isFlowEnabled();

      component['isFlowEnabled$'].subscribe((isEnabled) => {
        expect(isEnabled).toBeTrue();
        done();
      });
    });

    it('should set isFlowEnabled$ to false when the flow is disabled', (done) => {
      spyOn(checkoutComFlowFacade, 'getIsFlowEnabled').and.returnValue(of(false));

      component.isFlowEnabled();

      component['isFlowEnabled$'].subscribe((isEnabled) => {
        expect(isEnabled).toBeFalse();
        done();
      });
    });
  });

  describe('requestBillingAddress', () => {
    it('should call requestBillingAddress on billingAddressFormService', () => {
      spyOn(billingAddressFormService, 'requestBillingAddress').and.returnValue(of(null));

      component.requestBillingAddress();

      expect(billingAddressFormService.requestBillingAddress).toHaveBeenCalled();
    });

    it('should handle errors when requestBillingAddress throws an error', (done) => {
      const error = { details: [{ message: 'Server Error' }] } as HttpErrorModel;
      spyOn(billingAddressFormService, 'requestBillingAddress').and.returnValue(throwError(() => error));
      spyOn(component, 'showErrors');

      component.requestBillingAddress();

      expect(component.showErrors).toHaveBeenCalledWith('Server Error', 'CheckoutComBillingAddressFormComponent::requestBillingAddress', error);
      done();
    });
  });

  describe('UI interactions', () => {
    const getSameAsDeliveryAddressCheckboxElement = () => fixture.nativeElement.querySelector('#same-as-shipping-checkbox');
    describe('sameAsDeliveryAddressCheckbox', () => {
      it('should check the checkbox when sameAsDeliveryAddress is true', () => {
        component.showSameAsDeliveryAddressCheckbox$ = of(true);
        component.sameAsDeliveryAddress = true;
        fixture.detectChanges();

        expect(getSameAsDeliveryAddressCheckboxElement().checked).toBeTrue();
      });

      it('should uncheck the checkbox when sameAsDeliveryAddress is false', () => {
        component.showSameAsDeliveryAddressCheckbox$ = of(true);
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        expect(getSameAsDeliveryAddressCheckboxElement().checked).toBeFalse();
      });

      it('should call toggleSameAsDeliveryAddress on checkbox change', () => {
        component.showSameAsDeliveryAddressCheckbox$ = of(true);
        fixture.detectChanges();
        spyOn(component, 'toggleSameAsDeliveryAddress');

        getSameAsDeliveryAddressCheckboxElement().dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.toggleSameAsDeliveryAddress).toHaveBeenCalled();
      });

      it('should handle async visibility of the checkbox', () => {
        component.showSameAsDeliveryAddressCheckbox$ = of(true);
        fixture.detectChanges();

        const checkboxContainer = fixture.nativeElement.querySelector('.form-check');
        expect(checkboxContainer).toBeTruthy();
      });

      it('should not render the checkbox when showSameAsDeliveryAddressCheckbox$ is false', () => {
        component.showSameAsDeliveryAddressCheckbox$ = of(false);
        fixture.detectChanges();

        const checkboxContainer = fixture.nativeElement.querySelector('.form-check');
        expect(checkboxContainer).toBeNull();
      });
    });

    describe('sameAsDeliveryAddress and deliveryAddress$ behavior', () => {
      it('should display the delivery address card when sameAsDeliveryAddress is true and deliveryAddress$ emits a value', () => {
        component.sameAsDeliveryAddress = true;
        component.deliveryAddress$ = of(mockDeliveryAddress);
        fixture.detectChanges();

        const billingCard = fixture.nativeElement.querySelector('cx-card');
        expect(billingCard).toBeTruthy();
        expect(billingCard.querySelector('#content-header')).toBeNull();
        expect(billingCard.innerText).toContain(mockDeliveryAddress.town);
      });

      it('should display the billing address card when sameAsDeliveryAddress is false', () => {
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        const billingCard = fixture.nativeElement.querySelector('cx-card');
        expect(billingCard.querySelector('#content-header').innerText).toBe('addressCard.selected');
        expect(billingCard.innerText).toContain('Montreal');
      });
    });

    describe('billing address form and card visibility', () => {
      beforeEach(() => {
        component.sameAsDeliveryAddress = false;
      });
      it('should display the billing address form when editMode is enabled', () => {
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(false);
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
      });

      it('should display the billing address form when addresses are the same', () => {
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(true);
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
      });

      it('should display the billing address card when editMode is disabled and addresses are not the same', () => {
        component['showBillingAddressForm$'] = of(false);
        component['areTheSameAddresses$'] = of(false);
        component['billingAddress$'] = of({
          firstName: 'John',
          lastName: 'Doe'
        });
        fixture.detectChanges();

        const billingCard = fixture.nativeElement.querySelector('cx-card');
        expect(billingCard).toBeTruthy();
      });
    });

    describe('billingAddressForm behavior', () => {
      const getBillingAddressForm = () => fixture.nativeElement.querySelector('#billing-address-form');
      const getBillingAddressCard = () => fixture.nativeElement.querySelector('#billing-address-card');
      const getDeliveryAddressCard = () => fixture.nativeElement.querySelector('#delivery-address-card');
      const getGoBackButton = () => fixture.nativeElement.querySelector('#close-billing-address-edit-form-button');

      it('should disable the save button when the form is invalid', () => {
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(false);
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
        component.billingAddressForm.setErrors({ invalid: true });
        fixture.detectChanges();

        const saveButton = fixture.nativeElement.querySelector('#submit-billing-address-button');
        expect(saveButton.disabled).toBeTrue();
      });

      it('should enable the save button when the form is valid', () => {
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(false);
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
        component.billingAddressForm.patchValue(mockAddress);
        fixture.detectChanges();

        const saveButton = fixture.nativeElement.querySelector('#submit-billing-address-button');
        expect(saveButton.disabled).toBeFalse();
      });

      it('should call disableEditMode when the choose address button is clicked', () => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddressValue').and.returnValue(false);
        billingAddressFormService.setEditToggleState(true);
        component.sameAsDeliveryAddress = false;
        component.ngOnInit();
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
        spyOn(component, 'disableEditMode');

        getGoBackButton().click();

        expect(component.disableEditMode).toHaveBeenCalled();
      });

      it('should call submitForm when the save button is clicked', () => {
        spyOn(component, 'submitForm');
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(false);
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();
        component.billingAddressForm.patchValue(mockAddress);
        fixture.detectChanges();

        const saveButton = fixture.nativeElement.querySelector('#submit-billing-address-button');
        saveButton.click();

        expect(component.submitForm).toHaveBeenCalled();
      });

      it('should display form errors when form controls are invalid', () => {
        component['showBillingAddressForm$'] = of(true);
        component['areTheSameAddresses$'] = of(false);
        component.sameAsDeliveryAddress = false;
        fixture.detectChanges();

        const billingForm = fixture.nativeElement.querySelector('#billing-address-form');
        expect(billingForm).toBeTruthy();

        component.billingAddressForm.get('firstName')?.setErrors({ required: true });
        component.billingAddressForm.patchValue({
          firstName: '',
          lastName: 'Doe'
        });
        component.billingAddressForm.markAsTouched();
        fixture.detectChanges();

        const errorElement = fixture.nativeElement.querySelector('cx-form-errors');
        expect(errorElement).toBeTruthy();
      });

      it('should show the billing address form if isEditModeEnabled is true, addresses are the same and same as delivery checkbox is not checked', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(true));
        billingAddressFormService.setEditToggleState(true);
        billingAddressFormService.setSameAsDeliveryAddress(false);
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddressValue').and.returnValue(false);
        component.ngOnInit();
        fixture.detectChanges();

        component.toggleSameAsDeliveryAddress();
        fixture.detectChanges();

        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          expect(showBillingAddressForm).toBeTrue();
          expect(getBillingAddressCard()).toBeFalsy();
          expect(getDeliveryAddressCard()).toBeFalsy();
          expect(getBillingAddressForm()).toBeTruthy();
          done();
        });
      });

      it('should show the billing address form if isEditModeEnabled is false, address are the same and same as delivery checkbox is not checked', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(true));
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddressValue').and.returnValue(false);
        billingAddressFormService.setEditToggleState(false);
        billingAddressFormService.setSameAsDeliveryAddress(false, true);

        component.ngOnInit();
        fixture.detectChanges();

        component.toggleSameAsDeliveryAddress();
        fixture.detectChanges();

        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          expect(showBillingAddressForm).toBeTrue();
          expect(getBillingAddressCard()).toBeFalsy();
          expect(getDeliveryAddressCard()).toBeFalsy();
          expect(getBillingAddressForm()).toBeTruthy();
          done();
        });
      });

      it('should show the billing address form and show choose address button when billing addresses are different', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddressValue').and.returnValue(false);
        billingAddressFormService.setEditToggleState(true);

        component.ngOnInit();
        fixture.detectChanges();

        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          fixture.detectChanges();
          expect(showBillingAddressForm).toBeTrue();
          expect(getBillingAddressCard()).toBeFalsy();
          expect(getDeliveryAddressCard()).toBeFalsy();
          expect(getBillingAddressForm()).toBeTruthy();
          expect(getGoBackButton()).toBeTruthy();
          done();
        });
      });

      it('should show the billing address form and hide choose address button when billing addresses are the same', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddressValue').and.returnValue(false);
        billingAddressFormService.setEditToggleState(true);

        component['areTheSameAddresses$'] = of(true);
        component.ngOnInit();
        fixture.detectChanges();

        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          fixture.detectChanges();
          expect(showBillingAddressForm).toBeTrue();
          expect(getBillingAddressCard()).toBeFalsy();
          expect(getDeliveryAddressCard()).toBeFalsy();
          expect(getBillingAddressForm()).toBeTruthy();
          expect(getGoBackButton()).toBeFalsy();
          done();
        });
      });

      it('should hide the billing address form if edit mode is not enabled and the same and as delivery checkbox is checked and show the delivery address card information', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(true));
        billingAddressFormService.setEditToggleState(false);
        billingAddressFormService.setSameAsDeliveryAddress(true, true);
        spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject(true));
        spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
          data: mockAddress,
          loading: false,
          error: false
        }));

        component.ngOnInit();
        component.sameAsDeliveryAddress = true;
        fixture.detectChanges();
        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          expect(showBillingAddressForm).toBeFalse();
          expect(getBillingAddressCard()).toBeFalsy();
          expect(getDeliveryAddressCard()).toBeTruthy();
          expect(getBillingAddressForm()).toBeFalsy();
          done();
        });
      });

      it('should hide the billing address form if edit mode is not enabled, addresses are not the same and same as delivery checkbox is not checked and show the billing address card information', (done) => {
        spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));
        billingAddressFormService.setEditToggleState(false);
        billingAddressFormService.setSameAsDeliveryAddress(false);

        component.ngOnInit();
        fixture.detectChanges();

        component['showBillingAddressForm$'].subscribe((showBillingAddressForm) => {
          expect(showBillingAddressForm).toBeFalse();
          expect(getBillingAddressCard()).toBeTruthy();
          expect(getDeliveryAddressCard()).toBeFalsy();
          expect(getBillingAddressForm()).toBeFalsy();
          done();
        });
      });
    });
  });

  describe('UI components', () => {
    describe('billing address form', () => {
      describe('should show Billing Address Form', () => {
        it('should not show billing address form component is present', () => {
          spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(true));
          component.ngOnInit();
          component.showSameAsDeliveryAddressCheckbox$ = of(true);
          fixture.detectChanges();
          const billingAddressComponent = fixture.debugElement.query(By.css('lib-checkout-com-billing-address'));
          expect(billingAddressComponent).toBeFalsy();
        });

        it('should not show billing address form if sameAsDeliveryAddress$ is true', () => {
          spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(of(mockBillingAddress));
          spyOn(component, 'toggleSameAsDeliveryAddress').and.callThrough();
          spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
            loading: false,
            data: mockAddress,
            error: false
          }));
          spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(true));
          spyOn(billingAddressFormService, 'compareAddresses').and.returnValue(true);
          component.ngOnInit();
          component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
          component.sameAsDeliveryAddress = true;
          component.showSameAsDeliveryAddressCheckbox$ = new BehaviorSubject<boolean>(true);
          billingAddressFormService.setSameAsDeliveryAddress(false);
          billingAddressFormService.billingAddress$.next(mockBillingAddress);
          fixture.detectChanges();

          const sameAsShippingAddressCheckbox: HTMLInputElement = fixture.debugElement.query(By.css('#same-as-shipping-checkbox')).nativeElement;
          expect(sameAsShippingAddressCheckbox.checked).toBeTrue();
        });

        it('should show billing address card', () => {
          spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
            loading: false,
            data: mockAddress,
            error: false
          }));
          spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(of(true) as BehaviorSubject<boolean>);
          spyOn(billingAddressFormService, 'requestBillingAddress').and.returnValue(of({
            loading: false,
            error: false,
            data: mockBillingAddress
          }));
          spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(false));
          component.ngOnInit();
          component.showSameAsDeliveryAddressCheckbox$ = new BehaviorSubject<boolean>(true);
          billingAddressFormService.billingAddress$.next(mockBillingAddress);
          fixture.detectChanges();

          const sameAsShippingAddressCheckboxDebugElement = queryDebugElementByCss(fixture, '#same-as-shipping-checkbox');
          const sameAsShippingAddressCheckbox: HTMLInputElement = sameAsShippingAddressCheckboxDebugElement.nativeElement;
          expect(sameAsShippingAddressCheckbox.checked).toBeFalse();

          component.sameAsDeliveryAddress = false;
          spyOn(billingAddressFormService, 'showBillingAddressForm').and.returnValue(of(false)).and.callThrough();
          fixture.detectChanges();

          const billingAddressCard = queryDebugElementByCss(fixture, '.payment-form-card');
          expect(queryDebugElementByCss(fixture, '#billing-address-form')).toBeFalsy();
          expect(billingAddressCard).toBeTruthy();
          expect(billingAddressCard.nativeElement.querySelector('.cx-card-label-bold').textContent).toContain(mockBillingAddress.firstName + ' ' + mockBillingAddress.lastName);

          const cardLabel = billingAddressCard.nativeElement.querySelectorAll('.cx-card-label');
          expect(cardLabel[0].textContent).toContain(mockBillingAddress.line1);
          expect(cardLabel[1].textContent).toContain(`${mockBillingAddress.line2}`);
          expect(cardLabel[2].textContent).toContain(`${mockBillingAddress.town}, ${mockBillingAddress.region.isocode}, ${mockBillingAddress.country.isocode}`);
          expect(cardLabel[3].textContent).toContain(mockBillingAddress.postalCode);
          expect(cardLabel[4].textContent).toContain('');
        });
      });
    });
  });
});