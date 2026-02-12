import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { MockCxIconComponent, MockCxSpinnerComponent } from '@checkout-tests/components';
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComPaymentFacade } from '@checkout-tests/services/checkout-com-payment.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockCheckoutDeliveryAddressFacade } from '@checkout-tests/services/chekout-delivery-address.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { MockUserAddressService } from '@checkout-tests/services/user-address.service.mock';
import { MockUserPaymentService } from '@checkout-tests/services/user-payment.service.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService, CheckoutPaymentFormComponent } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  AddressValidation,
  CardType,
  Country,
  FeatureConfigService,
  FeaturesConfigModule,
  GlobalMessageService, GlobalMessageType,
  I18nTestingModule,
  PaymentDetails,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { CardComponent, FormErrorsModule, LaunchDialogService, NgSelectA11yModule } from '@spartacus/storefront';
import { of } from 'rxjs';
import { CheckoutComFramesFormModule } from '../checkout-com-frames-form/checkout-com-frames-form.module';
import { FrameCardTokenizedEvent } from '../checkout-com-frames-form/interfaces';
import { CheckoutComFramesInputModule } from '../checkout-com-frames-input/checkout-com-frames-input.module';
import { CheckoutComPaymentFormComponent } from './checkout-com-payment-form.component';
import createSpy = jasmine.createSpy;

const mockBillingCountries: Country[] = [
  {
    isocode: 'CA',
    name: 'Canada',
  },
];

const mockCardTypes: CardType[] = [
  {
    'code': 'amex',
    'name': 'American Express'
  },
  {
    'code': 'jcb',
    'name': 'JCB'
  },
  {
    'code': 'maestro',
    'name': 'Maestro'
  },
  {
    'code': 'undefined'
  },
  {
    'code': 'discover',
    'name': 'Discover'
  },
  {
    'code': 'switch',
    'name': 'Switch'
  },
  {
    'code': 'visa',
    'name': 'Visa'
  },
  {
    'code': 'mastercard',
    'name': 'Mastercard'
  },
  {
    'code': 'mastercard_eurocard',
    'name': 'Mastercard/Eurocard'
  },
  {
    'code': 'americanexpress',
    'name': 'American Express'
  },
  {
    'code': 'diners',
    'name': 'Diner\'s Club'
  },
  {
    'code': 'dinersclubinternational',
    'name': 'Diners Club International'
  }
];

const mockBillingAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  line1: 'Green Street',
  line2: '420',
  town: 'Montreal',
  postalCode: 'H3A',
  country: { isocode: 'CA' },
  region: { isocodeShort: 'QC' },
};

const mockAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart',
  line2: 'line2',
  town: 'town',
  region: { isocode: 'JP-27' },
  postalCode: 'zip',
  country: { isocode: 'JP' },
};

const mockBillingCountriesEmpty: Country[] = [];

let controls: {
  payment: UntypedFormGroup['controls'];
  billingAddress: UntypedFormGroup['controls'];
};

const mockPayment: any = {
  cardType: {
    code: mockCardTypes[0].code,
  },
  accountHolderName: 'Test Name',
  cardNumber: '1234123412341234',
  expiryMonth: '02',
  expiryYear: 2022,
  cvn: '123',
  defaultPayment: false,
  save: false,
};

const mokPaymentForm = {
  defaultPayment: false,
  save: false,
  accountHolderName: mockPayment.accountHolderName,
};

class MockFeatureConfigService implements Partial<FeatureConfigService> {
  isEnabled(_feature: string): boolean {
    return false;
  }
}

describe('CheckoutComPaymentFormComponent', () => {
  let component: CheckoutComPaymentFormComponent;
  let fixture: ComponentFixture<CheckoutComPaymentFormComponent>;
  let mockCheckoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let mockUserPaymentService: UserPaymentService;
  let mockGlobalMessageService: GlobalMessageService;
  let launchDialogService: jasmine.SpyObj<LaunchDialogService>;
  let mockUserAddressService: UserAddressService;
  let mockCheckoutBillingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    const launchDialogServiceSpy = jasmine.createSpyObj('LaunchDialogService', ['open ', 'closeDialog']);

    await TestBed.configureTestingModule({
      declarations: [CheckoutComPaymentFormComponent,
        CheckoutPaymentFormComponent,
        CardComponent,
        MockCxIconComponent,
        MockCxSpinnerComponent,
        CheckoutComBillingAddressFormComponent,
      ],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        CheckoutComFramesInputModule,
        CheckoutComFramesFormModule,
        NgSelectModule,
        I18nTestingModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule,
      ],
      providers: [
        {
          provide: LaunchDialogService,
          useValue: launchDialogServiceSpy
        },
        {
          provide: CheckoutComPaymentFacade,
          useClass: MockCheckoutComPaymentFacade,
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useClass: MockCheckoutDeliveryAddressFacade,
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
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: FeatureConfigService,
          useClass: MockFeatureConfigService
        },
        CheckoutComBillingAddressFormService,
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: CheckoutBillingAddressFormService,
          useClass: CheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ],
    }).overrideComponent(CheckoutPaymentFormComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPaymentFormComponent);
    component = fixture.componentInstance;
    launchDialogService = TestBed.inject(LaunchDialogService) as jasmine.SpyObj<LaunchDialogService>;
    mockCheckoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    mockUserPaymentService = TestBed.inject(UserPaymentService);
    mockGlobalMessageService = TestBed.inject(GlobalMessageService);
    mockUserAddressService = TestBed.inject(UserAddressService);
    mockCheckoutBillingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);

    controls = {
      payment: component.paymentForm.controls,
      billingAddress: component.billingAddressForm.controls,
    };
    spyOn(component.setPaymentDetails, 'emit').and.callThrough();
    spyOn(component.closeForm, 'emit').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should patch the form if the payment details is provided', () => {
    const mockPaymentDetails: PaymentDetails = {
      id: 'test',
    };
    component.paymentDetails = mockPaymentDetails;
    spyOn(component.paymentForm, 'patchValue').and.callThrough();

    component.ngOnInit();

    expect(component.paymentForm.patchValue).toHaveBeenCalledWith(
      mockPaymentDetails
    );
  });

  it('it should NOT patch the form if the payment details is NOT provided', () => {
    spyOn(component.paymentForm, 'patchValue').and.callThrough();

    component.ngOnInit();

    expect(component.paymentForm.patchValue).not.toHaveBeenCalled();
  });

  it('should call ngOnInit to get billing countries', () => {
    mockUserPaymentService.getAllBillingCountries = createSpy().and.returnValue(
      of(mockBillingCountries)
    );

    component.ngOnInit();
    component.countries$.subscribe((countries: Country[]) => {
      expect(countries).toBe(mockBillingCountries);
    });
  });

  it('should call ngOnInit to get supported card types if they exist', () => {
    checkoutComFlowFacade.getPaymentCardTypes = createSpy().and.returnValue(of(mockCardTypes));

    component.ngOnInit();
    component.cardTypes$.subscribe((cardTypes: CardType[]) => {
      expect(cardTypes).toEqual(mockCardTypes);
    });
  });

  it('should call ngOnInit to get shipping address set in cart', () => {
    mockCheckoutDeliveryAddressFacade.getDeliveryAddressState =
      createSpy().and.returnValue(
        of({
          loading: false,
          error: false,
          data: mockAddress
        })
      );

    component.ngOnInit();
    component.deliveryAddress$.subscribe((address) => {
      expect(address).toEqual(mockAddress);
    });
  });

  it('should call ngOnInit to load billing countries', () => {
    mockUserPaymentService.getAllBillingCountries = createSpy().and.returnValue(
      of(mockBillingCountriesEmpty)
    );

    component.ngOnInit();
    component.countries$.subscribe((countries: Country[]) => {
      expect(countries).toBe(mockBillingCountriesEmpty);
      expect(mockUserPaymentService.loadBillingCountries).toHaveBeenCalled();
    });
  });

  it('should add address with address verification result "accept"', () => {
    const mockAddressVerificationResult = { decision: 'ACCEPT' };
    component.ngOnInit();
    spyOn(component, 'next');
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );
    expect(component.next).toHaveBeenCalled();
  });

  it('should display error message with address verification result "reject"', () => {
    const mockAddressVerificationResult: AddressValidation = {
      decision: 'REJECT',
    };
    component.ngOnInit();
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );
    expect(mockGlobalMessageService.add).toHaveBeenCalled();
  });

  it('should open suggested address with address verification result "review"', () => {
    const mockAddressVerificationResult: AddressValidation = {
      decision: 'REVIEW',
    };
    spyOn(component, 'openSuggestedAddress');
    component.ngOnInit();
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );
    expect(component.openSuggestedAddress).toHaveBeenCalled();
  });

  it('should call toggleDefaultPaymentMethod() with defaultPayment flag set to false', () => {
    component.paymentForm.value.defaultPayment = true;
    component.paymentForm.value.save = false;
    component.toggleDefaultPaymentMethod();
    expect(component.paymentForm.value.defaultPayment).toBeFalsy();
  });

  it('should call next()', () => {
    component.loading = false;
    component.submitting$.next(false);
    component.processing = false;
    component.sameAsDeliveryAddress = true;
    component.showSameAsDeliveryAddressCheckbox$ = of(true);
    spyOn(mockCheckoutBillingAddressFormService, 'isBillingAddressSameAsDeliveryAddress').and.returnValue(true);
    spyOn(component.submitting$, 'next').and.callThrough();
    spyOn(component.submitEvent$, 'next').and.callThrough();
    spyOn(component['logger'], 'error');
    component.ngOnInit();
    component.paymentForm.setValue(mokPaymentForm);

    fixture.detectChanges();
    component.next();
    expect(component.submitting$.next).toHaveBeenCalledWith(true);
    expect(component.submitEvent$.next,).toHaveBeenCalled();
    expect(component['logger'].error).toHaveBeenCalledWith('tokenization failed', {
      errorCode: 'frames_not_found',
      message: null
    });
  });

  it('should call close()', () => {
    component.close();
    expect(component.closeForm.emit).toHaveBeenCalled();
  });

  it('should call toggleSameAsDeliveryAddress()', () => {
    spyOn(component, 'toggleSameAsDeliveryAddress').and.callThrough();
    component.sameAsDeliveryAddress = true;

    component.toggleSameAsDeliveryAddress();

    expect(component.toggleSameAsDeliveryAddress).toHaveBeenCalled();
    expect(component.sameAsDeliveryAddress).toBeFalsy();
  });

  it('should call verifyAddress() when billing address not same as shipping', () => {
    spyOn(component, 'next');
    mockUserAddressService.verifyAddress = createSpy().and.returnValue(
      of({
        decision: 'ACCEPT',
      })
    );

    component.sameAsDeliveryAddress = true;

    component.verifyAddress();

    expect(component.next).toHaveBeenCalled();

    component.sameAsDeliveryAddress = false;
    component.verifyAddress();
    expect(mockUserAddressService.verifyAddress).toHaveBeenCalled();
  });

  it('should convert card type from frames to spartacus', () => {
    // @ts-ignore
    component.spartacusCardTypes = mockCardTypes;
    fixture.detectChanges();
    expect(component.getCardTypeFromTokenizedEvent('Visa')).toEqual({
      code: 'visa',
      name: 'Visa'
    });
    expect(component.getCardTypeFromTokenizedEvent('Mastercard')).toEqual({
      code: 'mastercard',
      name: 'Mastercard'
    });
    expect(component.getCardTypeFromTokenizedEvent('Maestro')).toEqual({
      code: 'maestro',
      name: 'Maestro'
    });
    expect(component.getCardTypeFromTokenizedEvent('Discover')).toEqual({
      code: 'discover',
      name: 'Discover'
    });
  });

  describe('UI continue button', () => {
    const getContinueBtn = () =>
      fixture.debugElement.query(By.css('#continueButton'));

    it('should call "next" function when being clicked and when form is valid - with billing address', () => {
      component.loading = false;
      component.submitting$.next(false);
      component.processing = false;
      checkoutComFlowFacade.getPaymentCardTypes = createSpy().and.returnValue(of(mockCardTypes));
      mockCheckoutDeliveryAddressFacade.getDeliveryAddressState = createSpy().and.returnValue(
        of({
          loading: false,
          error: false,
          data: mockAddress
        })
      );
      mockUserPaymentService.getAllBillingCountries = createSpy().and.returnValue(of(mockBillingCountries));
      spyOn(component, 'next');

      component.showSameAsDeliveryAddressCheckbox$ = of(false);
      component.sameAsDeliveryAddress = true;

      component.paymentForm.setValue(mokPaymentForm);
      fixture.detectChanges();

      getContinueBtn().nativeElement.click();
      expect(component.next).toHaveBeenCalledTimes(1);

      // set values for payment form
      controls.payment['accountHolderName'].setValue('test accountHolderName');
      controls.payment['save'].setValue(false);

      // set values for billing address form
      controls.billingAddress['firstName'].setValue(
        mockBillingAddress.firstName
      );
      controls.billingAddress['lastName'].setValue(mockBillingAddress.lastName);
      controls.billingAddress['line1'].setValue(mockBillingAddress.line1);
      controls.billingAddress['line2'].setValue(mockBillingAddress.line2);
      controls.billingAddress['town'].setValue(mockBillingAddress.town);
      controls.billingAddress.country['controls'].isocode.setValue(
        mockBillingAddress.country
      );
      controls.billingAddress.region['controls'].isocodeShort.setValue(
        mockBillingAddress.region
      );
      controls.billingAddress['postalCode'].setValue(
        mockBillingAddress.postalCode
      );

      fixture.detectChanges();
      getContinueBtn().nativeElement.click();
      expect(component.next).toHaveBeenCalledTimes(2);
    });

    it('should call "next" function when being clicked and when form is valid - and same as delivery address is checked', () => {
      checkoutComFlowFacade.getPaymentCardTypes = createSpy().and.returnValue(of(mockCardTypes));
      mockCheckoutDeliveryAddressFacade.getDeliveryAddressState = createSpy().and.returnValue(
        of({
          loading: false,
          error: false,
          data: mockAddress
        })
      );
      mockUserPaymentService.getAllBillingCountries = createSpy().and.returnValue(of(mockBillingCountries));
      spyOn(component, 'next');

      // hide billing address
      //component.sameAsDeliveryAddress = true;
      mockCheckoutBillingAddressFormService.setSameAsDeliveryAddress(true);

      fixture.detectChanges();
      getContinueBtn().nativeElement.click();
      expect(component.next).toHaveBeenCalledTimes(0);

      // set values for payment form
      controls.payment['accountHolderName'].setValue('test accountHolderName');
      controls.payment['save'].setValue(false);
      component.paymentForm.patchValue({
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvn: '123',
      });

      fixture.detectChanges();
      getContinueBtn().nativeElement.click();
      expect(component.next).toHaveBeenCalledTimes(1);
    });

    it('should check setAsDefaultField to determine whether setAsDefault checkbox to be displayed', () => {
      component.setAsDefaultField = true;
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('[data-testid="setAsDefault"]')).length
      ).toEqual(1);
    });

    it('should check setAsDefaultField to determine whether setAsDefault checkbox not to be displayed', () => {
      component.setAsDefaultField = false;
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('[data-testid="setAsDefault"]')).length
      ).toEqual(0);
    });

    it('should show continue button when show same as delivery address is checked', () => {
      component['sameAsDeliveryAddress$'] = of(true);
      component.paymentMethodsCount = 1;
      fixture.detectChanges();
      expect(getContinueBtn().nativeElement.textContent.trim()).toContain('common.continue');
    });

    it('should hide continue button when show same as delivery address is not selected', () => {
      component['showBillingAddressForm$'] = of(true);
      component.paymentMethodsCount = 1;
      fixture.detectChanges();
      expect(getContinueBtn()).toBeFalsy();
    });
  });

  describe('UI close/back button', () => {
    const getBackBtn = () => fixture.debugElement.query(By.css('#backButton'));
    const getChangePaymentBtn = () => fixture.debugElement.query(By.css('#changePaymentButton'));
    it('should call "back" function after being clicked', () => {
      component.paymentMethodsCount = 0;
      component.ngOnInit();
      spyOn(component, 'back');
      fixture.detectChanges();
      getBackBtn().nativeElement.click();
      fixture.detectChanges();
      expect(component.back).toHaveBeenCalled();
    });

    it('should call back()', () => {
      spyOn(component.goBack, 'emit').and.callThrough();
      component.back();

      expect(component.goBack.emit).toHaveBeenCalledWith();
    });

    it('should call "close" function after being clicked', () => {
      component.paymentMethodsCount = 1;
      fixture.detectChanges();
      spyOn(component, 'close');
      getChangePaymentBtn().nativeElement.click();
      fixture.detectChanges();
      expect(component.close).toHaveBeenCalled();
    });

    it('should show choose address button when show same as delivery address is checked', () => {
      component['sameAsDeliveryAddress$'] = of(true);
      component.paymentMethodsCount = 1;
      fixture.detectChanges();
      expect(getChangePaymentBtn().nativeElement.textContent.trim()).toContain('paymentForm.changePayment');
    });
  });

  describe('tokenized', () => {

    const tokenizedEvent: FrameCardTokenizedEvent = {
      bin: '4242',
      card_type: 'Credit',
      card_category: 'Consumer',
      expires_on: '12/25',
      expiry_month: '12',
      expiry_year: '25',
      last4: '1111',
      type: 'visa',
      token: 'somesessionstoken',
      scheme: 'Visa',
      preferred_scheme: 'visa',
    };
    const framesCardHolder = {
      cardNumberPlaceholder: 'paymentForm.frames.placeholders.cardNumberPlaceholder',
      expiryMonthPlaceholder: 'paymentForm.frames.placeholders.expiryMonthPlaceholder',
      expiryYearPlaceholder: 'paymentForm.frames.placeholders.expiryYearPlaceholder',
      cvvPlaceholder: 'paymentForm.frames.placeholders.cvvPlaceholder',
    };
    beforeEach(() => {
      // @ts-ignore
      spyOn(component, 'getFramesLocalization').and.returnValue(of(framesCardHolder));

      component.paymentForm.setValue({
        accountHolderName: 'Ronnie James Dio',
        save: false,
        defaultPayment: true,
      });
    });

    it('should trigger cardHolder event', (done) => {
      const name = 'Erik Slagter';
      component.bindPaymentFormChanges();
      component.framesCardholder$.subscribe((cardHolderEvent) => {
        expect(cardHolderEvent).toEqual({
          name
        });

        done();
      });

      component.paymentForm.get('accountHolderName').setValue(name);
    });

    it('should handle tokenize and call setPaymentDetails', (done) => {
      mockCheckoutBillingAddressFormService.setSameAsDeliveryAddress(true);

      component.setPaymentDetails
        .subscribe((paymentDetailsEvent) => {
          const {
            paymentDetails,
            billingAddress
          } = paymentDetailsEvent;
          expect(paymentDetails).toEqual({
            accountHolderName: 'Ronnie James Dio',
            saved: false,
            defaultPayment: true,
            addressLine1: undefined,
            addressLine2: undefined,
            city: undefined,
            country: undefined,
            postalCode: undefined,
            billingAddress: null,
            cardNumber: '4242******1111',
            cardType: {
              code: 'visa',
              name: 'Visa'
            },
            expiryMonth: '12',
            expiryYear: '25',
            paymentToken: 'somesessionstoken',
            type: 'VISA',
            cardBin: '4242',
            scheme: 'visa'
          });
          expect(billingAddress).toBeNull();

          done();
        });

      component.tokenized(tokenizedEvent);
    });

    it('should handle tokenize with billing address and call setPaymentDetails', (done) => {
      const billingAddress = {
        firstName: 'Ronnie James',
        lastName: 'Dio',
        line1: 'line 1',
        line2: 'line 2',
        postalCode: '46001',
        town: 'SameVille',
        region: {
          isocodeShort: 'xx',
        },
        country: {
          isocode: 'ES'
        } as Country,
      };
      mockCheckoutBillingAddressFormService.setSameAsDeliveryAddress(false);
      mockCheckoutBillingAddressFormService.getBillingAddressForm().setValue(billingAddress);

      component.setPaymentDetails
        .subscribe((paymentDetailsEvent: { paymentDetails: CheckoutComPaymentDetails, billingAddress: Address }) => {
          const {
            paymentDetails,
            billingAddress
          } = paymentDetailsEvent;

          expect(mockCheckoutBillingAddressFormService.isBillingAddressFormValid()).toBeTrue();

          expect(paymentDetails).toEqual({
            accountHolderName: 'Ronnie James Dio',
            saved: false,
            defaultPayment: true,
            addressLine1: 'line 1',
            addressLine2: 'line 2',
            city: 'SameVille',
            country: {
              isocode: 'ES'
            },
            postalCode: '46001',
            billingAddress,
            cardNumber: '4242******1111',
            cardType: {
              code: 'visa',
              name: 'Visa'
            },
            expiryMonth: '12',
            expiryYear: '25',
            paymentToken: 'somesessionstoken',
            type: 'VISA',
            cardBin: '4242',
            scheme: 'visa'
          } as any);
          expect(billingAddress).toEqual(billingAddress);

          done();
        });

      component.tokenized(tokenizedEvent);
    });

    it('should get translations for frames placeholders', (done) => {
      component.ngOnInit();
      fixture.detectChanges();
      component.framesLocalization$.subscribe(res => {
          expect(res).toEqual({
            cardNumberPlaceholder: 'paymentForm.frames.placeholders.cardNumberPlaceholder',
            expiryMonthPlaceholder: 'paymentForm.frames.placeholders.expiryMonthPlaceholder',
            expiryYearPlaceholder: 'paymentForm.frames.placeholders.expiryYearPlaceholder',
            cvvPlaceholder: 'paymentForm.frames.placeholders.cvvPlaceholder',
          });

          done();
        })
        .unsubscribe();
    });
  });
});
