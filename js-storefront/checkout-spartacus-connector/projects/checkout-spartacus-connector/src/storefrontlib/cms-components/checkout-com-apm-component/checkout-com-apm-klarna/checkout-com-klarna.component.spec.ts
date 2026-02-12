import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { KlarnaAddress, KlarnaInitParams } from '@checkout-core/model/Klarna';
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { PaymentType } from '@checkout-model/ApmData';
import { CheckoutComApmService } from '@checkout-services/apm/checkout-com-apm.service';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { MockCxSpinnerComponent, MockLibCheckoutComBillingAddressFormComponent } from '@checkout-tests/components';
import { generateAddressFromFromAddress, generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComPaymentFacade } from '@checkout-tests/services/checkout-com-payment.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockCheckoutDeliveryAddressFacade } from '@checkout-tests/services/chekout-delivery-address.service.mock';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { MockUserAddressService } from '@checkout-tests/services/user-address.service.mock';
import { MockUserPaymentService } from '@checkout-tests/services/user-payment.service.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  EventService,
  FeaturesConfigModule,
  GlobalMessageService,
  GlobalMessageType,
  I18nTestingModule,
  LoggerService,
  QueryState,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { FormErrorsModule, LaunchDialogService, NgSelectA11yModule } from '@spartacus/storefront';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { CheckoutComKlarnaComponent } from './checkout-com-klarna.component';
import createSpy = jasmine.createSpy;

const apm = { code: PaymentType.Klarna };

class CheckoutComApmServiceStub {
  getSelectedApmFromState = createSpy('getSelectedApmFromState').and.returnValue(of(apm));
  selectApm = createSpy('selectApm').and.stub();

  getKlarnaInitParams() {
    return of(EMPTY);
  };
}

class MockCheckoutComStore {
}

class MockGlobalMessageService {
  add = createSpy();
}

class MockCheckoutDeliveryFacade implements Partial<CheckoutDeliveryAddressFacade> {
  getDeliveryAddressState(): Observable<QueryState<Address | undefined>> {
    return of({
      loading: false,
      error: false,
      data: null
    });
  }
}

class CheckoutComPaymentStub {
  setPaymentAddress = createSpy('setPaymentAddress').and.stub();
  getPaymentAddressFromState = createSpy('getPaymentAddressFromState').and.returnValue(of({}));

  updatePaymentAddress() {
    return of(EMPTY);
  };
}
const shippingAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  line1: '123 Street',
  postalCode: '12345',
  town: 'Town',
  phone: '1234567890',
  country: { isocode: 'US' },
};
const billingAddress: Address = generateOneAddress();

const shippingAddressState = {
  data: shippingAddress
} as QueryState<Address>;

describe('CheckoutComKlarnaComponent', () => {
  let component: CheckoutComKlarnaComponent;
  let fixture: ComponentFixture<CheckoutComKlarnaComponent>;
  let checkoutComApmSrv: CheckoutComApmService;
  let msgSrv: GlobalMessageService;
  let userAddressService: UserAddressService;
  let userPaymentService: UserPaymentService;
  let checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let logger: LoggerService;
  let eventService: EventService;
  let checkoutComPaymentFacade: CheckoutComPaymentFacade;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let initParamsSpy;
  let spyOnWinref;
  let getDeliveryAddressStateSpy;
  let checkoutComFlowFacade: CheckoutComFlowFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComKlarnaComponent,
        MockLibCheckoutComBillingAddressFormComponent,
        MockCxSpinnerComponent
      ],
      imports: [
        ReactiveFormsModule,
        I18nTestingModule,
        NgSelectModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule,
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
        CheckoutComBillingAddressFormService,
        {
          provide: CheckoutBillingAddressFormService,
          useClass: CheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComPaymentFacade,
          useClass: MockCheckoutComPaymentFacade
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
          provide: CheckoutComApmService,
          useClass: CheckoutComApmServiceStub
        },
        {
          provide: CheckoutComPaymentService,
          useClass: CheckoutComPaymentStub
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComKlarnaComponent);
    component = fixture.componentInstance;
    checkoutComApmSrv = TestBed.inject(CheckoutComApmService);
    msgSrv = TestBed.inject(GlobalMessageService);
    userAddressService = TestBed.inject(UserAddressService);
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    checkoutComPaymentFacade = TestBed.inject(CheckoutComPaymentFacade);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);

    initParamsSpy = spyOn(checkoutComApmSrv, 'getKlarnaInitParams');
    initParamsSpy.and.callThrough();
    // @ts-ignore
    spyOn(component, 'loadWidget').and.callThrough();
    spyOn(component['logger'], 'error');
    // @ts-ignore
    spyOnWinref = spyOnProperty(component.windowRef, 'nativeWindow');
    spyOnWinref.and.returnValue({});
    getDeliveryAddressStateSpy = spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState');
    getDeliveryAddressStateSpy.and.returnValue(of(shippingAddressState));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('normalizeKlarnaAddress', () => {
    it('should return KlarnaAddress with all fields filled when Address is complete', () => {
      component.emailAddress = 'john.doe@example.com';
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        phone: '1234567890',
        country: { isocode: 'US' },
      };
      const expected: KlarnaAddress = {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        street_address: '123 Street',
        postal_code: '12345',
        city: 'Town',
        phone: '1234567890',
        country: 'US',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });

    it('should return KlarnaAddress with empty fields when Address is incomplete', () => {
      const address: Address = {
        firstName: '',
        lastName: '',
        email: component.emailAddress,
        line1: '',
        postalCode: '',
        town: '',
        phone: '',
        country: null,
      };
      const expected: KlarnaAddress = {
        given_name: '',
        family_name: '',
        email: '',
        street_address: '',
        postal_code: '',
        city: '',
        phone: '',
        country: '',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });

    it('should return KlarnaAddress with emailAddress when Address email is missing', () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: component.emailAddress,
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        country: { isocode: 'US' },
        phone: '1234567890',
      };
      const expected: KlarnaAddress = {
        given_name: 'John',
        family_name: 'Doe',
        email: '',
        street_address: '123 Street',
        postal_code: '12345',
        city: 'Town',
        phone: '1234567890',
        country: 'US',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });
  });

  describe('listenForAddressSourceChange', () => {
    const formData = generateAddressFromFromAddress(billingAddress)

    it('should update klarnaShippingAddressData and klarnaBillingAddressData when sameAsShippingAddress is true', () => {
      component['sameAsDeliveryAddress'] = true;
      component.listenForAddressSourceChange();
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
      expect(component.klarnaBillingAddressData).toEqual(component.klarnaShippingAddressData);
    });

    it('should update klarnaShippingAddressData and klarnaBillingAddressData separately when sameAsShippingAddress is false', () => {
      billingAddressFormService.setBillingAddress(billingAddress);
      component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
      component.billingAddressForm.patchValue(formData);
      component['sameAsDeliveryAddress'] = false;
      fixture.detectChanges();
      component.listenForAddressSourceChange();
      fixture.detectChanges();
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
      expect(component.klarnaBillingAddressData).toEqual(component.normalizeKlarnaAddress(billingAddress));
    });
  });

  describe('authorize', () => {
    it('should not authorize when sameAsShippingAddress is false and billingAddressForm is invalid', () => {
      component['sameAsDeliveryAddress'] = false;
      component.billingAddressForm.setErrors({ invalid: true });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should not authorize when authorizing$ is true', () => {
      component.authorizing$.next(true);
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(true);
    });

    it('should not authorize when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should authorize when sameAsShippingAddress is true', () => {
      component['sameAsDeliveryAddress'] = true;
      // @ts-ignore
      spyOnWinref.and.returnValue({
        Klarna: {
          Payments: {
            authorize: jasmine.createSpy().and.callFake((_, __, callback) => callback({
              approved: true,
              authorization_token: 'token'
            }))
          }
        }
      });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should authorize when sameAsShippingAddress is false and billingAddressForm is valid', () => {
      component['sameAsDeliveryAddress'] = false;
      component.billingAddressForm.setErrors(null);
      // @ts-ignore
      spyOnWinref.and.returnValue({
        Klarna: {
          Payments: {
            authorize: jasmine.createSpy().and.callFake((_, __, callback) => callback({
              approved: true,
              authorization_token: 'token'
            }))
          }
        }
      });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });
  });

  describe('listenForCountryCode', () => {
    beforeEach(() => {
      component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next(null);
    });
    it('should initialize Klarna when country code is set and billing address has been set', () => {
      initParamsSpy.and.returnValue(of({
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      }));
      // @ts-ignore
      component.billingAddressHasBeenSet = true;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      // @ts-ignore
      expect(component.initKlarna).toHaveBeenCalledWith({
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      });
    });

    it('should not initialize Klarna when country code is not set', () => {
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next(null);
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      expect(checkoutComApmSrv.getKlarnaInitParams).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.initKlarna).not.toHaveBeenCalled();
    });

    it('should not initialize Klarna when billing address has not been set', () => {
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      //expect(checkoutComApmSrv.getKlarnaInitParams).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.initKlarna).not.toHaveBeenCalled();
    });

    it('should handle error when getting Klarna init params fails', () => {
      initParamsSpy.and.returnValue(throwError(() => 'error'));
      // @ts-ignore
      component.billingAddressHasBeenSet = true;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      component.listenForCountryCode();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.initializationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::listenForCountryCode', 'error');
      expect(component.loadingWidget$.getValue()).toBe(false);
      expect(component.initializing$.getValue()).toBe(false);
      expect(component.authorizing$.getValue()).toBe(false);
      expect(component.hasFailed).toBeTrue();
    });

    it('should handle error when getting Klarna init params fails request', () => {
      const err = new HttpErrorResponse({
        error: '404',
      });
      initParamsSpy.and.returnValue(of(err));
      // @ts-ignore
      component.billingAddressHasBeenSet = true;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      component.listenForCountryCode();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.initializationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::listenForCountryCode', err.error);
      expect(component.loadingWidget$.getValue()).toBe(false);
      expect(component.initializing$.getValue()).toBe(false);
      expect(component.authorizing$.getValue()).toBe(false);
      expect(component.hasFailed).toBeTrue();
    });
  });

  describe('klarnaIsReady', () => {
    beforeEach(() => {
      component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
      fixture.detectChanges()
    });

    it('should update currentCountryCode and klarnaShippingAddressData when shipping address is valid', () => {
      getDeliveryAddressStateSpy.and.returnValue(of(billingAddress));
      billingAddressFormService.setBillingAddress(billingAddress);
      // @ts-ignore
      component.klarnaIsReady();
      // @ts-ignore
      expect(component['currentCountryCode'].getValue()).toEqual(billingAddress.country.isocode);
      expect(component.klarnaBillingAddressData).toEqual(component.normalizeKlarnaAddress(billingAddress));
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
    });

    it('should not update currentCountryCode and klarnaShippingAddressData when shipping address is null', () => {
      getDeliveryAddressStateSpy.and.returnValue(of(null));
      billingAddressFormService.setBillingAddress(undefined);
      // @ts-ignore
      component.klarnaIsReady();
      // @ts-ignore
      expect(component.currentCountryCode.getValue()).toBeNull();
      expect(component.klarnaBillingAddressData).toBeUndefined();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should handle error when updatePaymentAddress fails', () => {
      getDeliveryAddressStateSpy.and.returnValue(of(shippingAddressState));
      spyOn(checkoutComPaymentFacade, 'updatePaymentAddress').and.returnValue(throwError(() => 'error'));
      // @ts-ignore
      component.klarnaIsReady();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should log error when shipping address is not valid', () => {
      billingAddressFormService.setBillingAddress(null);
      getDeliveryAddressStateSpy.and.returnValue(of({
        loading: false,
        error: false,
        data: {
          ...shippingAddress,
          country: null
        }
      }) as Observable<QueryState<Address>>);

      component['klarnaIsReady']();

      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::klarnaIsReady', 'Country is required');
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
      expect(component.loadingWidget$.getValue()).toBe(false);
      expect(component.initializing$.getValue()).toBe(false);
      expect(component.authorizing$.getValue()).toBe(false);
      expect(component.hasFailed).toBeTrue();
    });
  });

  describe('initKlarna', () => {
    it('should initialize Klarna when Klarna is set', () => {
      const k = {
        Payments: {
          init: jasmine.createSpy(),
          load: jasmine.createSpy()
        }
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: k });
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      // @ts-ignore
      component.initKlarna(params);
      expect(k.Payments.init).toHaveBeenCalledWith({ client_token: 'token' });
      // @ts-ignore
      expect(component.loadWidget).toHaveBeenCalled();
    });

    it('should not initialize Klarna when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      // @ts-ignore
      component.initKlarna(params);
      // @ts-ignore
      expect(component.loadWidget).not.toHaveBeenCalled();
    });

    it('should handle error when initializing Klarna fails', () => {
      const k = {
        Payments: {
          init: jasmine.createSpy().and.throwError('error'),
          load: jasmine.createSpy()
        }
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: k });
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      // @ts-ignore
      component.initKlarna(params);
      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::initKlarna', jasmine.any(Error));
    });
  });

  describe('addScript', () => {
    it('should add script and define klarnaAsyncCallback when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      const script = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(script);
      // @ts-ignore
      spyOn(component.windowRef.document.body, 'appendChild');
      // @ts-ignore
      component.addScript();
      expect(script.src).toEqual('https://x.klarnacdn.net/kp/lib/v1/api.js');
      expect(script.async).toEqual(true);
      // @ts-ignore
      expect(component.windowRef.document.body.appendChild).toHaveBeenCalledWith(script);
    });

    it('should not add script but call klarnaIsReady when Klarna is set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: {} });
      // @ts-ignore
      spyOn(component.windowRef.document.body, 'appendChild');
      // @ts-ignore
      spyOn(component.ngZone, 'run');
      // @ts-ignore
      component.addScript();
      // @ts-ignore
      expect(component.windowRef.document.body.appendChild).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.ngZone.run).toHaveBeenCalled();
    });
  });

  describe('loadWidget', () => {
    it('should load widget when Klarna is set', () => {
      const k = {
        load: jasmine.createSpy().and.callFake((_, __, callback) => callback(() => {
          {
            component.loadingWidget$.next(false);
          }
        }))
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      // @ts-ignore
      component.loadWidget();
      expect(k.load).toHaveBeenCalled();
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should not load widget when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      // @ts-ignore
      component.loadWidget();
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should handle error when loading widget fails', () => {
      const k = {
        load: jasmine.createSpy().and.throwError('error')
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      // @ts-ignore
      component.loadWidget();
      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::loadWidget', jasmine.any(Error));
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should handle error when response contains error', () => {
      const k = {
        load: jasmine.createSpy().and.callFake((_, __, callback) => callback({ error: { invalid_fields: ['field'] } }))
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      // @ts-ignore
      component.loadWidget();
      expect(component['logger'].error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::loadWidget::response', { invalid_fields: ['field'] });
      expect(component.loadingWidget$.getValue()).toBe(false);
    });
  });
});
