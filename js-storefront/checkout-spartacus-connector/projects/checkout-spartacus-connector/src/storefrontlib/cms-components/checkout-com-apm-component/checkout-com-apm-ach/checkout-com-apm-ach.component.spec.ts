import { ChangeDetectorRef, ElementRef, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CHECKOUT_COM_LAUNCH_CALLER } from '@checkout-core/interfaces';
import { CheckoutComAchFacade } from '@checkout-facades/checkout-com-ach.facade';
import { CheckoutComCheckoutBillingAddressFacade } from '@checkout-facades/checkout-com-checkout-billing-address.facade';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { MockCxSpinnerComponent } from '@checkout-tests/components';
import { generateAchSuccessMetadata } from '@checkout-tests/fake-data/apm-ach/apm-ach.mock';
import { queryDebugElementByCss } from '@checkout-tests/finders.mock';
import { MockCheckoutComCheckoutBillingAddressFacade } from '@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockCheckoutDeliveryAddressFacade } from '@checkout-tests/services/chekout-delivery-address.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  AddressValidation,
  EventService,
  FeaturesConfigModule,
  GlobalMessageEntities,
  GlobalMessageService,
  GlobalMessageType,
  I18nTestingModule,
  LoggerService,
  MockTranslatePipe,
  Region,
  RoutingService,
  Translatable,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { CardComponent, FormErrorsModule, LAUNCH_CALLER, LaunchDialogService, NgSelectA11yModule } from '@spartacus/storefront';
import { NgxPlaidLinkService, PlaidLinkHandler } from 'ngx-plaid-link';
import { LegacyPlaidConfig } from 'ngx-plaid-link/lib/interfaces';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal/checkout-com-apm-ach-account-list-modal.component';
import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents/checkout-com-apm-ach-consents.component';
import { CheckoutComApmAchComponent } from './checkout-com-apm-ach.component';
import createSpy = jasmine.createSpy;

const achLinkToken = 'link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6';
const regions: Region = {
  isocode: 'US-NY',
  name: 'New York'
};
const mockAddress: Address = {
  id: 'b9679f0b-5e53-49c1-9f24-7ed57a8cf3a3',
  title: 'Miss',
  titleCode: 'Mr.',
  email: 'Heath61@hotmail.com',
  firstName: 'Polly',
  lastName: 'Dibbert',
  companyName: 'Turcotte - Pfannerstill',
  line1: '2639 Marcelo Street',
  line2: 'Suite 219',
  postalCode: '66491-6807',
  town: 'Racine',
  country: {
    isocode: 'US',
    name: 'United States'
  },
  region:
    {
      isocode: 'IL',
      name: 'Kentucky',
      isocodeShort: 'NH'
    },
  cellphone: '417-437-0050 x77699',
  defaultAddress: false,
  shippingAddress: true,
  formattedAddress: '2639 Marcelo Street Suite 219, Racine, Brazil, 66491-6807',
  visibleInAddressBook: true
};
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
const institutionMeta = {
  name: 'Bank of America',
  institution_id: 'ins_127989'
};
const accountMeta1 = {
  id: '4lgVyA4wVqSZVAjQ7Q1BimzZKzDb7ac3ajKVD',
  name: 'Plaid Checking',
  mask: '0000',
  type: 'depository',
  subtype: 'checking',
  verification_status: null,
  class_type: null
};
const accountMeta2 = {
  id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
  name: 'Plaid Savings',
  mask: '1111',
  type: 'depository',
  subtype: 'savings',
  verification_status: null,
  class_type: null
};
const metadata = {
  status: null,
  link_session_id: 'session_id',
  institution: institutionMeta,
  accounts: [accountMeta1, accountMeta2],
  account: accountMeta1,
  account_id: '',
  transfer_status: '',
  public_token: ''
};
const mockCountries = [{
  isocode: 'US',
  name: 'United States'
}];

const addressValidation: AddressValidation = {
  errors: null,
  decision: 'ACCEPT',
  suggestedAddresses: [mockBillingAddress, mockAddress]
};
const mockOrder: Order = {
  code: '1',
  statusDisplay: 'Shipped',
  deliveryAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: 'Buckingham Street 5',
    line2: '1A',
    phone: '(+11) 111 111 111',
    postalCode: 'MA8902',
    town: 'London',
    country: {
      isocode: 'UK'
    }
  },
  deliveryMode: {
    name: 'Standard order-detail-shipping',
    description: '3-5 days',
    code: 'standard'
  },
  created: new Date('2019-02-11T13:02:58+0000')
};

const plaidLinkHandler = {
  open: () => {
  },
  exit: () => {
  },
  destroy: () => {
  }
};

class MockGlobalMessageService implements Partial<GlobalMessageService> {
  get(): Observable<GlobalMessageEntities> {
    return of({});
  }

  add(_: string | Translatable, __: GlobalMessageType, ___?: number): void {
  }

  remove(_: GlobalMessageType, __?: number): void {
  }
}

class MockRoutingService {
  go = createSpy('RoutingService').and.callThrough();
}

class MockUserPaymentService implements Partial<UserPaymentService> {
  getAllBillingCountries = createSpy('UserPaymentService.getAllBillingCountries').and.returnValue(of(mockCountries));
  loadBillingCountries = createSpy('UserPaymentService.loadBillingCountries').and.callThrough();
}

let dialogClose$: BehaviorSubject<any | undefined> = new BehaviorSubject(undefined);

class MockLaunchDialogService implements Partial<LaunchDialogService> {
  get dialogClose() {
    return dialogClose$.asObservable();
  }

  closeDialog(reason: any): void {
    dialogClose$.next(reason);
  }

  openDialog(
    _caller: LAUNCH_CALLER,
    _openElement?: ElementRef,
    _vcr?: ViewContainerRef,
    _data?: any
  ) {
    return of();
  }

  openDialogAndSubscribe(
    _caller: LAUNCH_CALLER,
    _openElement?: ElementRef,
    _data?: any
  ) {
  }
}

describe('CheckoutComApmAchComponent', () => {
  let legacyPlaidConfig: LegacyPlaidConfig;
  let component: CheckoutComApmAchComponent;
  let fixture: ComponentFixture<CheckoutComApmAchComponent>;
  let checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let userAddressService: jasmine.SpyObj<UserAddressService>;
  let userPaymentService: UserPaymentService;
  let globalMessageService: GlobalMessageService;
  let launchDialogService: jasmine.SpyObj<LaunchDialogService>;
  let routingService: RoutingService;
  let plaidLinkService: jasmine.SpyObj<NgxPlaidLinkService>;
  let checkoutComAchFacade: jasmine.SpyObj<CheckoutComAchFacade>;
  let logger: LoggerService;
  let eventService: EventService;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    const userAddressServiceSpy = jasmine.createSpyObj('UserAddressService', ['verifyAddress', 'getRegions']);
    const plaidLinkServiceSpy = jasmine.createSpyObj('NgxPlaidLinkService', ['createPlaid']);
    const checkoutComAchFacadeSpy = jasmine.createSpyObj('CheckoutComAchFacade', [
      'getPlaidLinkToken',
      'getPlaidLinkMetadata',
      'requestPlaidLinkToken',
      'setPlaidLinkMetadata',
      'requestPlaidSuccessOrder',
      'getPlaidOrder'
    ]);
    const checkoutComPaymentFacadeSpy = jasmine.createSpyObj('CheckoutComPaymentFacade', [
      'updatePaymentAddress',
      'getPaymentAddressFromState',
      'getPaymentDetailsState'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        I18nTestingModule,
        FormErrorsModule,
        ReactiveFormsModule,
        NgSelectModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule
      ],
      declarations: [
        MockTranslatePipe,
        CardComponent,
        MockCxSpinnerComponent,
        CheckoutComApmAchComponent,
        CheckoutComBillingAddressFormComponent,
        CheckoutComApmAchConsentsComponent,
        CheckoutComApmAchAccountListModalComponent
      ],
      providers: [
        UntypedFormBuilder,
        ChangeDetectorRef,
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useClass: MockCheckoutDeliveryAddressFacade
        },
        {
          provide: UserAddressService,
          useValue: userAddressServiceSpy
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
          provide: NgxPlaidLinkService,
          useValue: plaidLinkServiceSpy
        },
        {
          provide: CheckoutComAchFacade,
          useValue: checkoutComAchFacadeSpy
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService
        },
        CheckoutComBillingAddressFormService,
        {
          provide: CheckoutBillingAddressFormService,
          useClass: CheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    }).compileComponents();
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    userAddressService = TestBed.inject(UserAddressService) as jasmine.SpyObj<UserAddressService>;
    userPaymentService = TestBed.inject(UserPaymentService);
    globalMessageService = TestBed.inject(GlobalMessageService);
    launchDialogService = TestBed.inject(LaunchDialogService) as jasmine.SpyObj<LaunchDialogService>;
    routingService = TestBed.inject(RoutingService);
    plaidLinkService = TestBed.inject(NgxPlaidLinkService) as jasmine.SpyObj<NgxPlaidLinkService>;
    checkoutComAchFacade = TestBed.inject(CheckoutComAchFacade) as jasmine.SpyObj<CheckoutComAchFacade>;
    logger = TestBed.inject(LoggerService);
    eventService = TestBed.inject(EventService);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    spyOn(checkoutComFlowFacade, 'getIsFlowEnabled').and.returnValue(of(false));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchComponent);
    component = fixture.componentInstance;
    component.achEnabled$.next(true);
    component.billingAddressForm = new UntypedFormGroup({});
    checkoutComAchFacade.getPlaidLinkToken.and.returnValue(of(achLinkToken));
    checkoutComAchFacade.getPlaidLinkMetadata.and.returnValue(of(metadata));
    checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(of(mockOrder));
    userAddressService.verifyAddress.and.returnValue(of(addressValidation));
    userAddressService.getRegions.and.returnValue(of([regions]));

    legacyPlaidConfig = {
      apiVersion: 'v2',
      env: 'sandbox',
      selectAccount: false,
      token: null,
      webhook: '',
      product: ['auth'],
      countryCodes: ['US'],
      key: '',
      onSuccess: () => component.onSuccess,
      onExit: () => ''
    };
    spyOn(component, 'open').and.returnValue();
    component.deliveryAddress$ = of(mockAddress);
    component['billingAddress$'] = of(mockBillingAddress);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getPlaidLinkToken, getPlaidLinkMetadata, and sameDeliveryAddress', () => {
      spyOn(component, 'getPlaidLinkToken');
      spyOn(component, 'getPlaidLinkMetadata');

      component.ngOnInit();

      expect(component.getPlaidLinkToken).toHaveBeenCalled();
      expect(component.getPlaidLinkMetadata).toHaveBeenCalled();
    });
  });

  describe('getPlaidLinkToken', () => {
    it('should set link token when Plaid Link token is retrieved successfully', (doneFn) => {
      fixture.detectChanges();
      component.getPlaidLinkToken();

      component.linkToken.subscribe((token) => {
        expect(token).toBe(achLinkToken);
        // @ts-ignore
        expect(component.config.token).toBe(achLinkToken);
        doneFn();
      });
    });

    it('should handle error when retrieving Plaid Link token', () => {
      const error = new Error('error');
      checkoutComAchFacade.getPlaidLinkToken.and.returnValue(throwError(() => error));
      spyOn(component, 'showErrors');
      fixture.detectChanges();

      component.getPlaidLinkToken();

      expect(component.showErrors).toHaveBeenCalledWith(
        'plaidLinkTokenApi',
        'Failed to retrieve Plaid Link token',
        error
      );
    });

    it('should not set link token if response is empty', (doneFn) => {
      checkoutComAchFacade.getPlaidLinkToken.and.returnValue(of());
      component.getPlaidLinkToken();
      fixture.detectChanges();

      component.linkToken.subscribe((token) => {
        expect(token).toBe('');
        // @ts-ignore
        expect(component.config.token).toBe(null);
        doneFn();
      });
    });
  });

  describe('getPlaidLinkMetadata', () => {
    it('should set achMetadata when Plaid Link metadata is retrieved successfully', (doneFn) => {
      const metadata: AchSuccessMetadata = generateAchSuccessMetadata();
      checkoutComAchFacade.getPlaidLinkMetadata.and.returnValue(of(metadata));

      component.getPlaidLinkMetadata();

      component.plaidSuccessPopup$.subscribe((popup) => {
        expect(component.achMetadata).toBe(metadata);
        doneFn();
      });
    });

    it('should handle error when retrieving Plaid Link metadata', () => {
      const error = new Error('error');
      checkoutComAchFacade.getPlaidLinkMetadata.and.returnValue(throwError(() => error));
      spyOn(component['logger'], 'error');

      component.getPlaidLinkMetadata();

      expect(component['logger'].error).toHaveBeenCalledWith(error);
    });

    it('should not set achMetadata if response is empty', (doneFn) => {
      checkoutComAchFacade.getPlaidLinkMetadata.and.returnValue(of(null));

      component.getPlaidLinkMetadata();

      component.plaidSuccessPopup$.subscribe((popup) => {
        expect(component.achMetadata).toBeUndefined();
        doneFn();
      });
    });
  });

  describe('sameDeliveryAddress', () => {
    it('should set sameAddress to true and call getDeliveryAddress when sameAsDeliveryAddress$ is true', () => {
      spyOn(component, 'getDeliveryAddress');
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(of(true) as BehaviorSubject<boolean>);

      component.ngOnInit();

      expect(component.sameAsDeliveryAddress).toBeTrue();
      expect(component.getDeliveryAddress).toHaveBeenCalled();
    });

    it('should set sameAddress to false and not call getDeliveryAddress when sameAsDeliveryAddress$ is false', () => {
      spyOn(component, 'getDeliveryAddress');
      spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(of(false) as BehaviorSubject<boolean>);
      component.ngOnInit();

      expect(component.sameAsDeliveryAddress).toBeFalse();
      expect(component.getDeliveryAddress).not.toHaveBeenCalled();
    });
  });

  describe('getDeliveryAddress', () => {
    it('should set paymentAddress when delivery address is retrieved successfully', () => {
      spyOn(checkoutDeliveryAddressFacade,'getDeliveryAddressState').and.returnValue(of({
        loading: false,
        data: mockAddress,
        error: false
      }));

      component.getDeliveryAddress();

      expect(component.paymentAddress).toBe(mockAddress);
    });

    it('should handle error when retrieving delivery address', () => {
      const error = new Error('error');
      spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(throwError(() => error));
      spyOn(component['logger'], 'error');

      component.getDeliveryAddress();

      expect(component['logger'].error).toHaveBeenCalledWith(error);
    });

    it('should not set paymentAddress if response is empty', () => {
      spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
        loading: false,
        error: false,
        data: null
      }));

      component.getDeliveryAddress();

      expect(component.paymentAddress).toBeNull();
    });
  });

  describe('handleAddressVerificationResults', () => {
    it('should update payment address and open Plaid link when address verification is accepted', () => {
      spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(of(mockBillingAddress));

      component.handleAddressVerificationResults(addressValidation);

      expect(component.paymentAddress).toEqual(component.billingAddressForm.value);
      expect(component.open).toHaveBeenCalled();
    });

    it('should display error message when address verification is rejected', () => {
      spyOn(globalMessageService, 'add');
      spyOn(logger, 'error');
      const rejectedValidation: AddressValidation = {
        ...addressValidation,
        decision: 'REJECT'
      };

      component.handleAddressVerificationResults(rejectedValidation);

      expect(globalMessageService.add).toHaveBeenCalledWith(
        { key: 'addressForm.invalidAddress' },
        GlobalMessageType.MSG_TYPE_ERROR
      );
      expect(logger.error).toHaveBeenCalledWith('Address verification failed', { error: 'REJECT' });
    });
  });

  describe('showErrors', () => {
    it('should disable ACH and display error message when info is provided', () => {
      spyOn(globalMessageService, 'add');
      spyOn(component['logger'], 'error');
      component.showErrors('Error message', 'loggerMessage', 'errorMessage');

      expect(component.achEnabled$.getValue()).toBeFalse();
      expect(globalMessageService.add).toHaveBeenCalledWith('Error message', GlobalMessageType.MSG_TYPE_ERROR);
      expect(component['logger'].error).toHaveBeenCalledWith('loggerMessage', { error: 'errorMessage' });
    });

    it('should disable ACH and display error message when info is not provided', () => {
      spyOn(globalMessageService, 'add');
      spyOn(component['logger'], 'error');
      component.showErrors(undefined, null, null);

      expect(component.achEnabled$.getValue()).toBeFalse();
      expect(globalMessageService.add).toHaveBeenCalledWith(undefined, GlobalMessageType.MSG_TYPE_ERROR);
      expect(component['logger'].error).toHaveBeenCalledWith(null, { error: null });
    });
  });

  describe('showACHPopUpPayment', () => {
    it('should create Plaid link handler and open Plaid link on success', (doneFn) => {
      plaidLinkService.createPlaid.and.returnValue(Promise.resolve(plaidLinkHandler) as Promise<PlaidLinkHandler>);

      component.showACHPopUpPayment();

      plaidLinkService.createPlaid(legacyPlaidConfig).then(() => {
        expect(component['plaidLinkHandler']).toBe(plaidLinkHandler);
        expect(component.open).toHaveBeenCalled();
        doneFn();
      });
    });

    it('should call onSuccess with token and metadata on success', (doneFn) => {
      const token = 'public-token';
      const metadata = generateAchSuccessMetadata();
      spyOn(component, 'onSuccess');
      plaidLinkService.createPlaid.and.returnValue(Promise.resolve(plaidLinkHandler) as Promise<PlaidLinkHandler>);

      component.showACHPopUpPayment();

      plaidLinkService.createPlaid(legacyPlaidConfig).then(() => {
        component.onSuccess(token, metadata);
        expect(component.onSuccess).toHaveBeenCalledWith(token, metadata);
        doneFn();
      });
    });

    it('should call exit on Plaid link handler on exit', (doneFn) => {
      spyOn(component, 'exit');
      plaidLinkService.createPlaid.and.returnValue(Promise.resolve(plaidLinkHandler) as Promise<PlaidLinkHandler>);

      component.showACHPopUpPayment();

      plaidLinkService.createPlaid(legacyPlaidConfig).then(() => {
        component.exit();
        expect(component.exit).toHaveBeenCalled();
        doneFn();
      });
    });
  });

  describe('showPopUpConsents', () => {
    it('should open dialog with correct parameters', () => {
      spyOn(launchDialogService, 'openDialogAndSubscribe');
      component.achMetadata = metadata;
      component.element = { nativeElement: {} } as ElementRef;
      component.showPopUpConsents();

      expect(launchDialogService.openDialogAndSubscribe).toHaveBeenCalledWith(
        CHECKOUT_COM_LAUNCH_CALLER.APM_ACH_CONSENTS,
        component.element,
        { achMetadata: metadata }
      );
    });
  });

  describe('showAchPlaidLinkAccounts', () => {
    it('should open dialog with correct parameters', () => {
      spyOn(launchDialogService, 'openDialogAndSubscribe');
      component.achMetadata = metadata;
      component.element = { nativeElement: {} } as ElementRef;
      fixture.detectChanges();
      component.showAchPlaidLinkAccounts();

      expect(launchDialogService.openDialogAndSubscribe).toHaveBeenCalledWith(
        CHECKOUT_COM_LAUNCH_CALLER.ACH_ACCOUNTS_LIST,
        component.element,
        { achMetadata: metadata }
      );
    });

    it('should place order when dialog is closed with submit type and parameters', () => {
      spyOn(component, 'placeOrder').and.callThrough();
      checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(of(mockOrder));
      component.achMetadata = metadata;
      component.element = { nativeElement: {} } as ElementRef;
      fixture.detectChanges();
      component.showAchPlaidLinkAccounts();

      dialogClose$.next({
        type: 'submit',
        parameters: metadata
      });

      expect(component.placeOrder).toHaveBeenCalledWith(metadata);
    });

    it('should not place order when dialog is closed without submit type', () => {
      spyOn(component, 'placeOrder');
      component.achMetadata = metadata;
      component.element = { nativeElement: {} } as ElementRef;
      launchDialogService.openDialogAndSubscribe(
        CHECKOUT_COM_LAUNCH_CALLER.ACH_ACCOUNTS_LIST,
        component.element,
        { achMetadata: metadata }
      );
      fixture.detectChanges();
      dialogClose$.next({ type: 'cancel' });

      expect(component.placeOrder).not.toHaveBeenCalled();
    });

  });

  describe('continueButtonDisabled', () => {
    it('should disable the continue button when the target is unchecked', () => {
      const target = { checked: false } as HTMLInputElement;
      component.continueButtonDisabled(target);
      expect(component.disabled).toBeTrue();
    });

    it('should enable the continue button when the target is checked', () => {
      const target = { checked: true } as HTMLInputElement;
      component.continueButtonDisabled(target);
      expect(component.disabled).toBeFalse();
    });
  });

  describe('onSuccess', () => {
    it('should update plaidSuccessPopup$ with public_token and metadata', () => {
      const publicToken = 'public-token';

      component.onSuccess(publicToken, metadata);

      expect(component.plaidSuccessPopup$.getValue()).toEqual({
        public_token: publicToken,
        metadata
      });
    });

    it('should call setPlaidLinkMetadata with metadata', () => {
      const publicToken = 'public-token';
      component.onSuccess(publicToken, metadata);
      expect(checkoutComAchFacade.setPlaidLinkMetadata).toHaveBeenCalledWith(metadata);
    });

    it('should call showAchPlaidLinkAccounts', () => {
      const publicToken = 'public-token';
      spyOn(component, 'showAchPlaidLinkAccounts');

      component.onSuccess(publicToken, metadata);

      expect(component.showAchPlaidLinkAccounts).toHaveBeenCalled();
    });
  });

  describe('placeOrder', () => {
    it('should navigate to order confirmation on successful order placement', () => {
      checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(of(mockOrder));
      component.placeOrder(metadata);
      expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'orderConfirmation' });
    });

    it('should handle error when order placement fails', () => {
      const error = new Error('error');
      spyOn(component['logger'], 'error');
      checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(throwError(() => error));

      component.placeOrder(metadata);

      expect(component['logger'].error).toHaveBeenCalledWith('Failed to place order', { error });
      expect(component.showLoadingIcon$.value).toBeFalse();
    });

    it('should show loading icon while placing order', () => {
      checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(of(mockOrder));
      component.placeOrder(metadata);

      expect(component.showLoadingIcon$.value).toBeTrue();
    });

    it('should hide loading icon when order placement fails', () => {
      const error = new Error('expected error');
      spyOn(component['logger'], 'error');
      checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(throwError(() => error));
      component.placeOrder(metadata);
      expect(component['logger'].error).toHaveBeenCalledWith('Failed to place order', { error });
      expect(component.showLoadingIcon$.value).toBeFalse();
    });
  });

  describe('UI components', () => {
    it('should toggle enable/disable continue button', () => {
      spyOn(billingAddressFormService, 'showBillingAddressForm').and.returnValue(of(false));
      fixture.detectChanges();
      expect(component.disabled).toBeTrue;
      const checkbox = fixture.debugElement.query(By.css('#customerConsent'));
      expect(checkbox).toBeTruthy();
      checkbox.nativeElement.click();
      expect(component.disabled).toBeFalse();
    });

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
          spyOn(billingAddressFormService, 'getSameAsDeliveryAddress').and.returnValue(new BehaviorSubject<boolean>(true));
          spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
            loading: false,
            data: mockAddress,
            error: false
          }));
          spyOn(billingAddressFormService, 'getAreTheSameAddresses').and.returnValue(of(true));
          component.showSameAsDeliveryAddressCheckbox$ = of(true);
          component.ngOnInit();
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

          expect(queryDebugElementByCss(fixture, '#billing-address-form')).toBeFalsy();
          expect(component.paymentAddress).toEqual(mockAddress);

          const billingAddressCard = queryDebugElementByCss(fixture, '.payment-form-card');
          expect(billingAddressCard).toBeTruthy();
          expect(billingAddressCard.nativeElement.querySelector('.cx-card-label-bold').textContent).toContain(mockBillingAddress.firstName + ' ' + mockBillingAddress.lastName);

          const cardLabel = billingAddressCard.nativeElement.querySelectorAll('.cx-card-label');
          expect(cardLabel[0].textContent).toContain(mockBillingAddress.line1);
          expect(cardLabel[1].textContent).toContain(`${mockBillingAddress.line2}`);
          expect(cardLabel[2].textContent).toContain(`${mockBillingAddress.town}, ${mockBillingAddress.region.isocode}, ${mockBillingAddress.country.isocode}`);
          expect(cardLabel[3].textContent).toContain(mockBillingAddress.postalCode);
          expect(cardLabel[4].textContent).toContain('');
        });

        it('should Handle Address Verification Results', () => {
          spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(of(mockBillingAddress));
          spyOn(component, 'toggleSameAsDeliveryAddress').and.callThrough();
          spyOn(checkoutDeliveryAddressFacade, 'getDeliveryAddressState').and.returnValue(of({
            loading: false,
            data: mockAddress,
            error: false
          }));
          component.billingAddressForm = billingAddressFormService.getBillingAddressForm();
          spyOn(billingAddressFormService, 'compareAddresses').and.returnValue(true);
          fixture.detectChanges();
          const sameAsShippingAddressCheckboxDebugElement = queryDebugElementByCss(fixture, '#same-as-shipping-checkbox');
          const sameAsShippingAddressCheckbox: HTMLInputElement = sameAsShippingAddressCheckboxDebugElement.nativeElement;
          expect(sameAsShippingAddressCheckbox.checked).toBeTrue();
          sameAsShippingAddressCheckbox.click();
          fixture.detectChanges();
          expect(sameAsShippingAddressCheckbox.checked).toBeFalse();
          expect(queryDebugElementByCss(fixture, '#billing-address-form')).toBeTruthy();
          expect(component.paymentAddress).toEqual(mockAddress);
          const {
            firstName,
            lastName,
            line1,
            line2,
            town,
            region,
            country,
            postalCode
          } = mockBillingAddress;

          const formValue = {
            firstName,
            lastName,
            line1,
            line2,
            town,
            region,
            country,
            postalCode
          };

          component.billingAddressForm.patchValue(formValue);
          component.handleAddressVerificationResults(addressValidation);
          expect(component.paymentAddress).toEqual(component.billingAddressForm.value);
          expect(component.open).toHaveBeenCalled();
        });
      });
    });

    it('plaid popup button should be visible', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]')).toBeTruthy();
    });

    it('plaid popup button should not to be visible if plaid has error', () => {
      component.achEnabled$.next(false);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]')).toBeFalsy();
    });

    it('plaid popup should be visible when user click open button', () => {
      spyOn(component, 'showACHPopUpPayment');
      component.linkToken.next('link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6');
      fixture.detectChanges();
      let button = fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]');
      button.disabled = false;
      button.click();
      fixture.detectChanges();
      expect(component.showACHPopUpPayment).toHaveBeenCalled();
    });

    describe('plaid popup should be open', () => {
      let buttonContinue;
      beforeEach(() => {
        fixture.detectChanges();
        const termsAndConditionCheckbox = fixture.debugElement.query(By.css('#customerConsent')).nativeElement;
        buttonContinue = fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]');
        expect(component.linkToken.getValue()).toEqual(achLinkToken);
        component.linkToken.next(component.linkToken.getValue());
        expect(termsAndConditionCheckbox).toBeTruthy();
        expect(buttonContinue).toBeTruthy();
        expect(termsAndConditionCheckbox.checked).toBeFalse();
        expect(buttonContinue.disabled).toBeTrue();
        termsAndConditionCheckbox.click();
        fixture.detectChanges();
        expect(termsAndConditionCheckbox.checked).toBeTrue();
        expect(buttonContinue.disabled).toBeFalse();
      });

      it(' when user clicks open button', () => {
        // @ts-ignore
        plaidLinkService.createPlaid.and.returnValue(Promise.resolve(plaidLinkHandler));
        spyOn(checkoutComFlowFacade, 'updatePaymentAddress').and.returnValue(of(mockBillingAddress));
        fixture.detectChanges();
        buttonContinue.click();
        fixture.detectChanges();
        expect(plaidLinkService.createPlaid).toHaveBeenCalled();
      });

      it(' and should place order', () => {
        checkoutComAchFacade.requestPlaidSuccessOrder.and.returnValue(of(mockOrder));
        checkoutComAchFacade.getPlaidOrder.and.returnValue(of(mockOrder));
        component.placeOrder(metadata);
        dialogClose$.next({
          type: 'submit',
          parameters: metadata
        });
        fixture.detectChanges();
        expect(component.showLoadingIcon$.value).toBe(true);
        fixture.detectChanges();
        checkoutComAchFacade.getPlaidOrder().subscribe(order => expect(order).toEqual(mockOrder));
        expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'orderConfirmation' });
      });

      it('should show Popup Consents', () => {
        spyOn(launchDialogService, 'openDialogAndSubscribe');
        component.achEnabled$.next(true);
        fixture.detectChanges();
        let popupConsent = fixture.debugElement.query(By.css('#popup-consent')).nativeElement;
        fixture.detectChanges();
        popupConsent.click();
        expect(launchDialogService.openDialogAndSubscribe).toHaveBeenCalledWith(
          CHECKOUT_COM_LAUNCH_CALLER.APM_ACH_CONSENTS,
          component.element,
          { achMetadata: metadata }
        );
      });
    });
  });
});
