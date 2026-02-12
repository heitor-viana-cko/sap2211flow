import { ChangeDetectorRef, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import {
  FrameCardBindChangedEvent,
  FrameCardTokenizationFailedEvent,
  FrameCardTokenizedEvent,
  FrameElementIdentifier,
  FramePaymentMethodChangedEvent,
  FramesCardholder,
  FramesConfig,
  FrameValidationChangedEvent
} from '@checkout-components/checkout-com-frames-form/interfaces';
import { CSS_CLASS_CARD_NUMBER, CSS_CLASS_CVV, CSS_CLASS_EXPIRY_DATE } from '@checkout-components/checkout-com-frames-input/interfaces';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreModule } from '@ngrx/store';
import { I18nTestingModule, TranslationService, UserIdService, WindowRef } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CheckoutComFramesInputModule } from '../checkout-com-frames-input/checkout-com-frames-input.module';

import { CheckoutComFramesFormComponent } from './checkout-com-frames-form.component';

const merchantKey = 'pk_test_d4727781-a79c-460e-9773-05d762c63e8f';

describe('CheckoutComFramesFormComponent', () => {
  let component: CheckoutComFramesFormComponent;
  let fixture: ComponentFixture<CheckoutComFramesFormComponent>;
  let checkoutComPaymentFacade: jasmine.SpyObj<CheckoutComPaymentFacade>;
  let userIdService: UserIdService;
  let windowRef: jasmine.SpyObj<WindowRef>;
  let ngZone: NgZone;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {

    const checkoutComPaymentServiceSpy = jasmine.createSpyObj('CheckoutComPaymentFacade', [
      'getIsABC',
      'getIsABCFromState',
      'getOccMerchantKeyFromState',
    ]);
    const mockWindowRefSpy = jasmine.createSpyObj('WindowRef', ['isBrowser', 'nativeWindow']);

    await TestBed.configureTestingModule({
      declarations: [CheckoutComFramesFormComponent],
      imports: [StoreModule.forRoot({}),
        ReactiveFormsModule,
        CheckoutComFramesInputModule,
        NgSelectModule,
        I18nTestingModule,
        FormErrorsModule,
      ],
      providers: [
        ChangeDetectorRef,
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService,
        },
        {
          provide: CheckoutComPaymentFacade,
          useValue: checkoutComPaymentServiceSpy
        },
        {
          provide: WindowRef,
          useValue: mockWindowRefSpy
        },
        {
          provide: ChangeDetectorRef,
          useValue: { detectChanges: jasmine.createSpy('detectChanges') }
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComFramesFormComponent);
    component = fixture.componentInstance;
    component.form = new UntypedFormGroup({});
    component.submitEvent = new Subject<void>();
    component.cardholderStream = new BehaviorSubject<any>(null);
    checkoutComPaymentFacade = TestBed.inject(CheckoutComPaymentFacade) as jasmine.SpyObj<CheckoutComPaymentFacade>;
    userIdService = TestBed.inject(UserIdService);
    windowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    cdr = TestBed.inject(ChangeDetectorRef);
    ngZone = TestBed.inject(NgZone);
    checkoutComPaymentFacade.getIsABC.and.returnValue(of({
      loading: false,
      data: true,
      error: false,
    }));
    checkoutComPaymentFacade.getIsABCFromState.and.returnValue(of(true));
    checkoutComPaymentFacade.getOccMerchantKeyFromState.and.returnValue(of(merchantKey));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getIsABCParam and listen for events if running in a browser', () => {
      // @ts-ignore
      spyOn(component, 'getIsABCParam');
      // @ts-ignore
      spyOn(component, 'listenForFramesEvents');
      // @ts-ignore
      spyOn(component, 'listenForSubmitEvent');
      // @ts-ignore
      spyOn(component, 'listenForCardHolder');

      windowRef.isBrowser.and.returnValue(true);

      component.ngOnInit();

      expect((component as any).getIsABCParam).toHaveBeenCalled();
      expect((component as any).listenForFramesEvents).toHaveBeenCalled();
      expect((component as any).listenForSubmitEvent).toHaveBeenCalled();
      expect((component as any).listenForCardHolder).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should attempt to initialize Frames', () => {
      spyOn(component as any, 'tryInitFrames');

      component.ngAfterViewInit();

      expect((component as any).tryInitFrames).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should set isDestroyed to true and complete the drop subject', () => {
      component.ngOnDestroy();

      expect(component['isDestroyed']).toBeTrue();
    });
  });

  describe('Input bindings', () => {
    it('should accept input properties', () => {
      const mockSubmitEvent = new Subject<void>();
      const mockCardholderStream = new BehaviorSubject<any>(null);

      component.submitEvent = mockSubmitEvent;
      component.cardholderStream = mockCardholderStream;
      component.cardNumberInputName = 'testCardNumber';
      component.expiryDateInputName = 'testExpiryDate';
      component.cvvInputName = 'testCvv';

      expect(component.submitEvent).toBe(mockSubmitEvent);
      expect(component.cardholderStream).toBe(mockCardholderStream);
      expect(component.cardNumberInputName).toBe('testCardNumber');
      expect(component.expiryDateInputName).toBe('testExpiryDate');
      expect(component.cvvInputName).toBe('testCvv');
    });
  });

  describe('getIsABCParam', () => {
    it('should set isABC to true and call listenForMerchantKey when isABC is true', () => {
      spyOn(component as any, 'listenForMerchantKey');
      checkoutComPaymentFacade.getIsABCFromState.and.returnValue(of(true));

      (component as any).getIsABCParam();

      expect(component.isABC).toBeTrue();
      expect((component as any).listenForMerchantKey).toHaveBeenCalled();
    });

    it('should set isABC to false and call listenForMerchantKey when isABC is false', () => {
      spyOn(component as any, 'listenForMerchantKey');
      checkoutComPaymentFacade.getIsABCFromState.and.returnValue(of(false));

      (component as any).getIsABCParam();

      expect(component.isABC).toBeFalse();
      expect((component as any).listenForMerchantKey).toHaveBeenCalled();
    });

    it('should not call listenForMerchantKey when isABC is null', () => {
      spyOn(component as any, 'listenForMerchantKey');
      checkoutComPaymentFacade.getIsABCFromState.and.returnValue(of(null));

      (component as any).getIsABCParam();

      expect((component as any).listenForMerchantKey).not.toHaveBeenCalled();
    });

    it('should log error when getIsABCParam subscription fails', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      checkoutComPaymentFacade.getIsABCFromState.and.returnValue(throwError(() => 'error'));

      (component as any).getIsABCParam();

      expect(consoleSpy).toHaveBeenCalledWith('getIsABCParam with errors', { error: 'error' });
    });
  });

  describe('listenForCardHolder', () => {
    it('should modify Frames cardholder when cardholderStream emits a value', () => {
      const cardholder: FramesCardholder = { name: 'John Doe' };
      spyOn(component as any, 'modifyFramesCardholder');
      component.cardholderStream = of(cardholder);

      (component as any).listenForCardHolder();

      expect((component as any).modifyFramesCardholder).toHaveBeenCalledWith(cardholder);
    });

    it('should log error when cardholderStream emits an error', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      spyOn(component, 'showErrors').and.callThrough();
      component.cardholderStream = throwError(() => 'error');

      (component as any).listenForCardHolder();

      expect(consoleSpy).toHaveBeenCalledWith('listenForCardHolder with errors', { error: 'error' });
      expect(component.showErrors).toHaveBeenCalledWith(
        { raw: 'error' },
        'listenForCardHolder with errors',
        'error'
      );
    });

    it('should not call modifyFramesCardholder when cardholderStream is null', () => {
      spyOn(component as any, 'modifyFramesCardholder');
      component.cardholderStream = null;

      (component as any).listenForCardHolder();

      expect((component as any).modifyFramesCardholder).not.toHaveBeenCalled();
    });
  });

  describe('listenForMerchantKey', () => {
    it('should set initial Frames configuration and modify public key on merchant key change', () => {
      const firstPublicKey = 'first_public_key';
      const newPublicKey = 'new_public_key';
      spyOn(component as any, 'setConfig');
      spyOn(component as any, 'modifyFramesPublicKey');
      checkoutComPaymentFacade.getOccMerchantKeyFromState.and.returnValues(of(firstPublicKey), of(newPublicKey));

      (component as any).listenForMerchantKey();

      expect((component as any).setConfig).toHaveBeenCalledWith({
        publicKey: firstPublicKey,
        cardTokenized: null,
        schemeChoice: false
      });
      expect((component as any).modifyFramesPublicKey).toHaveBeenCalledWith(newPublicKey);
    });

    it('should not modify public key if it remains the same', () => {
      const firstPublicKey = 'first_public_key';
      spyOn(component as any, 'setConfig');
      spyOn(component as any, 'modifyFramesPublicKey');
      checkoutComPaymentFacade.getOccMerchantKeyFromState.and.returnValues(of(firstPublicKey), of(firstPublicKey));

      (component as any).listenForMerchantKey();

      expect((component as any).setConfig).toHaveBeenCalledWith({
        publicKey: firstPublicKey,
        cardTokenized: null,
        schemeChoice: false
      });
      expect((component as any).modifyFramesPublicKey).not.toHaveBeenCalled();
    });

    it('should log error when listenForMerchantKey subscription fails', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      spyOn(component, 'showErrors').and.callThrough();
      checkoutComPaymentFacade.getOccMerchantKeyFromState.and.returnValue(throwError(() => 'error'));

      (component as any).listenForMerchantKey();

      expect(consoleSpy).toHaveBeenCalledWith('listenForMerchantKey with errors', { error: 'error' });
      expect(component.showErrors).toHaveBeenCalledWith(
        { key: 'paymentForm.merchantKeyFailed' },
        'listenForMerchantKey with errors',
        'error'
      );
    });
  });

  describe('getValidator', () => {
    it('should return null when fieldType is not recognized', () => {
      const result = (component as any).getValidator('unknownFieldType')();
      expect(result).toBeNull();
    });

    it('should return error object when validation status is not boolean', () => {
      component['validationStatusMap'].set(FrameElementIdentifier.CardNumber, undefined);
      const result = (component as any).getValidator(FrameElementIdentifier.CardNumber)();
      expect(result).toEqual({ cardNumberInvalid: true });
    });

    it('should return null when validation status is true', () => {
      component['validationStatusMap'].set(FrameElementIdentifier.CardNumber, true);
      const result = (component as any).getValidator(FrameElementIdentifier.CardNumber)();
      expect(result).toBeNull();
    });

    it('should return error object when validation status is false', () => {
      component['validationStatusMap'].set(FrameElementIdentifier.CardNumber, false);
      const result = (component as any).getValidator(FrameElementIdentifier.CardNumber)();
      expect(result).toEqual({ cardNumberInvalid: true });
    });

    it('should return error object for expiry date when validation status is false', () => {
      component['validationStatusMap'].set(FrameElementIdentifier.ExpiryDate, false);
      const result = (component as any).getValidator(FrameElementIdentifier.ExpiryDate)();
      expect(result).toEqual({ expiryDateInvalid: true });
    });

    it('should return error object for cvv when validation status is false', () => {
      component['validationStatusMap'].set(FrameElementIdentifier.Cvv, false);
      const result = (component as any).getValidator(FrameElementIdentifier.Cvv)();
      expect(result).toEqual({ cvvInvalid: true });
    });
  });

  describe('setConfig', () => {
    it('should set initial Frames configuration with provided initialConfig', () => {
      (component as any).localization = 'localization';
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      spyOn(component as any, 'getStyleConfig').and.returnValue({ base: { color: '#333' } });

      (component as any).setConfig(initialConfig);

      expect((component as any).config).toEqual({
        publicKey: 'test_key',
        style: { base: { color: '#333' } },
        ready: jasmine.any(Function),
        cardTokenized: jasmine.any(Function),
        frameActivated: jasmine.any(Function),
        frameFocus: jasmine.any(Function),
        frameBlur: jasmine.any(Function),
        frameValidationChanged: jasmine.any(Function),
        paymentMethodChanged: jasmine.any(Function),
        cardValidationChanged: jasmine.any(Function),
        cardSubmitted: jasmine.any(Function),
        cardTokenizationFailed: jasmine.any(Function),
        cardBinChanged: jasmine.any(Function),
        localization: 'localization'
      });
    });

    it('should set localization if provided', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      component.localization = { cardNumberPlaceholder: 'Card Number' };

      (component as any).setConfig(initialConfig);

      expect((component as any).config.localization).toEqual({ cardNumberPlaceholder: 'Card Number' });
    });

    it('should call framesReady.next(true) when ready is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).framesReady, 'next');

      (component as any).config.ready();

      expect((component as any).framesReady.next).toHaveBeenCalledWith(true);
    });

    it('should call cardTokenized.next with event when cardTokenized is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).cardTokenized, 'next');
      const event = { token: 'token' };

      (component as any).config.cardTokenized(event);

      expect((component as any).cardTokenized.next).toHaveBeenCalledWith(event);
    });

    it('should call frameActivated.next with event when frameActivated is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).frameActivated, 'next');
      const event = { element: 'cardNumber' };

      (component as any).config.frameActivated(event);

      expect((component as any).frameActivated.next).toHaveBeenCalledWith(event);
    });

    it('should call frameFocus.next with event when frameFocus is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).frameFocus, 'next');
      const event = { element: 'cardNumber' };

      (component as any).config.frameFocus(event);

      expect((component as any).frameFocus.next).toHaveBeenCalledWith(event);
    });

    it('should call frameBlur.next with event when frameBlur is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).frameBlur, 'next');
      const event = { element: 'cardNumber' };

      (component as any).config.frameBlur(event);

      expect((component as any).frameBlur.next).toHaveBeenCalledWith(event);
    });

    it('should call frameValidationChanged.next with event when frameValidationChanged is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).frameValidationChanged, 'next');
      const event = {
        element: 'cardNumber',
        isValid: true
      };

      (component as any).config.frameValidationChanged(event);

      expect((component as any).frameValidationChanged.next).toHaveBeenCalledWith(event);
    });

    it('should call paymentMethodChanged.next with event when paymentMethodChanged is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).paymentMethodChanged, 'next');
      const event = { paymentMethod: 'Visa' };

      (component as any).config.paymentMethodChanged(event);

      expect((component as any).paymentMethodChanged.next).toHaveBeenCalledWith(event);
    });

    it('should call cardValidationChanged.next with event when cardValidationChanged is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).cardValidationChanged, 'next');
      const event = { isValid: true };

      (component as any).config.cardValidationChanged(event);

      expect((component as any).cardValidationChanged.next).toHaveBeenCalledWith(event);
    });

    it('should call cardSubmitted.next when cardSubmitted is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).cardSubmitted, 'next');

      (component as any).config.cardSubmitted();

      expect((component as any).cardSubmitted.next).toHaveBeenCalled();
    });

    it('should call cardTokenizationFailed.next with event when cardTokenizationFailed is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).cardTokenizationFailed, 'next');
      const event = { errorCode: 'error' };

      (component as any).config.cardTokenizationFailed(event);

      expect((component as any).cardTokenizationFailed.next).toHaveBeenCalledWith(event);
    });

    it('should call cardBinChanged.next with event when cardBinChanged is called', () => {
      const initialConfig: FramesConfig = { publicKey: 'test_key' };
      (component as any).setConfig(initialConfig);
      spyOn((component as any).cardBinChanged, 'next');
      const event = { bin: '123456' };

      (component as any).config.cardBinChanged(event);

      expect((component as any).cardBinChanged.next).toHaveBeenCalledWith(event);
    });
  });

  describe('tryInitFrames', () => {
    it('should initialize Frames if initFrames returns true', () => {
      spyOn(component as any, 'initFrames').and.returnValue(true);

      (component as any).tryInitFrames();

      expect((component as any).initFrames).toHaveBeenCalledWith((component as any).config);
    });

    it('should retry initializing Frames if initFrames returns false', (done) => {
      spyOn(component as any, 'initFrames').and.returnValue(false);
      (component as any).tryInitFrames();

      setTimeout(() => {
        expect((component as any).initFrames).toHaveBeenCalledTimes(3);
        done();
      }, 200);
    });

    it('should not retry initializing Frames if component is destroyed', (done) => {
      spyOn(component as any, 'initFrames').and.returnValue(false);
      component['isDestroyed'] = true;

      (component as any).tryInitFrames();

      setTimeout(() => {
        expect((component as any).initFrames).toHaveBeenCalledTimes(1);
        done();
      }, 200);
    });
  });

  describe('initFrames', () => {
    it('should return false if config is not provided', () => {
      const result = (component as any).initFrames(null);
      expect(result).toBeFalse();
    });

    it('should return true if component is destroyed', () => {
      component['isDestroyed'] = true;
      const result = (component as any).initFrames({});
      expect(result).toBeTrue();
    });

    it('should return false if Frames is not found', () => {
      windowRef.nativeWindow['Frames'] = null;
      const result = (component as any).initFrames({});
      expect(result).toBeFalse();
    });

    it('should initialize Frames with provided config and return true', () => {
      const Frames = {
        init: jasmine.createSpy('init'),
        modes: { FEATURE_FLAG_SCHEME_CHOICE: 'scheme_choice' }
      };
      windowRef.nativeWindow['Frames'] = Frames;
      const config = { publicKey: 'test_key' };

      const result = (component as any).initFrames(config);

      expect(Frames.init).toHaveBeenCalledWith({
        ...config,
        modes: ['scheme_choice']
      });
      expect(result).toBeTrue();
      expect((component as any).framesInitialized).toBeTrue();
    });

    it('should return false if Frames initialization throws an error', () => {
      spyOn(component['logger'], 'error');
      const error = new Error('Initialization error');
      const Frames = {
        init: jasmine.createSpy('init').and.throwError(error),
        modes: { FEATURE_FLAG_SCHEME_CHOICE: 'scheme_choice' }
      };
      windowRef.nativeWindow['Frames'] = Frames;
      const config = { publicKey: 'test_key' };

      const result = (component as any).initFrames(config);

      expect(result).toBeFalse();
      expect(component['logger'].error).toHaveBeenCalledWith(error);
    });
  });

  describe('modifyFramesPublicKey', () => {
    it('should not modify Frames public key if publicKey is null', () => {
      const Frames = { publicKey: 'old_key' };
      windowRef.nativeWindow['Frames'] = Frames;

      (component as any).modifyFramesPublicKey(null);

      expect(Frames.publicKey).toBe('old_key');
    });

    it('should not modify Frames public key if Frames is not found', () => {
      windowRef.nativeWindow['Frames'] = null;

      (component as any).modifyFramesPublicKey('new_key');

      expect(windowRef.nativeWindow['Frames']).toBeNull();
    });

    it('should modify Frames public key if Frames is found', () => {
      const Frames = { publicKey: 'old_key' };
      windowRef.nativeWindow['Frames'] = Frames;

      (component as any).modifyFramesPublicKey('new_key');

      expect(Frames.publicKey).toBe('new_key');
    });

    it('should update config public key if config is available', () => {
      const Frames = { publicKey: 'old_key' };
      windowRef.nativeWindow['Frames'] = Frames;
      (component as any).config = { publicKey: 'old_key' };

      (component as any).modifyFramesPublicKey('new_key');

      expect((component as any).config.publicKey).toBe('new_key');
    });
  });

  describe('listenForFramesEvents', () => {
    beforeEach(() => {
      component.ngOnInit();
      component['listenForFramesEvents']();
      // @ts-ignore
      spyOn(component['ngZone'], 'run').and.callThrough();
      spyOn(component['cd'], 'detectChanges').and.callThrough();
      fixture.detectChanges();
    });
    it('should update validation status and form control on frameValidationChanged event', () => {
      const event: FrameValidationChangedEvent = {
        element: FrameElementIdentifier.CardNumber,
        isValid: true,
        isEmpty: false
      };
      spyOn(component as any, 'getElementByIdentifier').and.returnValue({
        markAsTouched: jasmine.createSpy(),
        markAsDirty: jasmine.createSpy(),
        updateValueAndValidity: jasmine.createSpy()
      });
      component['isABC'] = true;
      component['paymentMethod'] = 'visa';
      (component as any).frameValidationChanged.next(event);

      expect(component['validationStatusMap'].get(FrameElementIdentifier.CardNumber)).toBeTrue();
      expect(component['getElementByIdentifier']).toHaveBeenCalledWith(FrameElementIdentifier.CardNumber);
      expect(component['ngZone'].run).toHaveBeenCalled();
      expect(component['paymentIconCssClass$'].value).toBe('visa');
    });

    it('should set validators and update form control on frameActivated event', () => {
      const event = { element: FrameElementIdentifier.CardNumber };
      spyOn(component as any, 'getElementByIdentifier').and.returnValue({
        setValidators: jasmine.createSpy(),
        updateValueAndValidity: jasmine.createSpy()
      });
      spyOn(component as any, 'getValidator').and.returnValue(() => null);

      (component as any).frameActivated.next(event);

      expect(component['getElementByIdentifier']).toHaveBeenCalledWith(FrameElementIdentifier.CardNumber);
      expect(component['getValidator']).toHaveBeenCalledWith(FrameElementIdentifier.CardNumber);
      expect(component['ngZone'].run).toHaveBeenCalled();
    });

    it('should update showTooltip and detect changes on cardBinChanged event', () => {
      const event: FrameCardBindChangedEvent = { isCoBadged: true };

      (component as any).cardBinChanged.next(event);

      expect(component.showTooltip).toBeTrue();
      expect(component['cd'].detectChanges).toHaveBeenCalled();
    });

    it('should update payment method and emit paymentMethodChange on paymentMethodChanged event', () => {
      const event: FramePaymentMethodChangedEvent = { paymentMethod: 'Visa' };
      spyOn(component.paymentMethodChange, 'next');

      (component as any).paymentMethodChanged.next(event);

      expect(component.paymentMethodChange.next).toHaveBeenCalledWith(event);
      expect(component['paymentMethod']).toBe('visa');
    });

    it('should reset payment method on paymentMethodChanged event when paymentMethod is null', () => {
      const event: FramePaymentMethodChangedEvent = { paymentMethod: null };
      spyOn(component.paymentMethodChange, 'next');

      (component as any).paymentMethodChanged.next(event);

      expect(component.paymentMethodChange.next).toHaveBeenCalledWith(event);
      expect(component['paymentMethod']).toBe('');
    });

    it('should reset payment method and icon on frameValidationChanged event when empty', () => {
      const event: FrameValidationChangedEvent = {
        element: FrameElementIdentifier.CardNumber,
        isValid: false,
        isEmpty: true
      };
      spyOn(component as any, 'getElementByIdentifier').and.returnValue({
        markAsTouched: jasmine.createSpy(),
        markAsDirty: jasmine.createSpy(),
        updateValueAndValidity: jasmine.createSpy()
      });

      (component as any).frameValidationChanged.next(event);

      expect(component['validationStatusMap'].get(FrameElementIdentifier.CardNumber)).toBeFalse();
      expect(component['paymentIconCssClass$'].value).toBe('');
      expect(component['paymentMethod']).toBe('');
    });
  });

  describe('getElementByIdentifier', () => {
    it('should return undefined if control name is not found', () => {
      spyOn(component as any, 'getInputNameByIdentifier').and.returnValue(null);

      const result = (component as any).getElementByIdentifier(FrameElementIdentifier.CardNumber);

      expect(result).toBeUndefined();
    });

    it('should return form control if control name is found', () => {
      const controlName = 'cardNumber';
      const control = { value: '1234' } as AbstractControl;
      spyOn(component as any, 'getInputNameByIdentifier').and.returnValue(controlName);
      component.form.controls[controlName] = control;

      const result = (component as any).getElementByIdentifier(FrameElementIdentifier.CardNumber);

      expect(result).toBe(control);
    });

    it('should return undefined if form control is not found', () => {
      const controlName = 'cardNumber';
      spyOn(component as any, 'getInputNameByIdentifier').and.returnValue(controlName);
      component.form.controls[controlName] = undefined;

      const result = (component as any).getElementByIdentifier(FrameElementIdentifier.CardNumber);

      expect(result).toBeUndefined();
    });
  });

  describe('getInputNameByIdentifier', () => {
    it('should return cardNumberInputName for CardNumber identifier', () => {
      component.cardNumberInputName = 'testCardNumber';
      const result = (component as any).getInputNameByIdentifier(FrameElementIdentifier.CardNumber);
      expect(result).toBe('testCardNumber');
    });

    it('should return expiryDateInputName for ExpiryDate identifier', () => {
      component.expiryDateInputName = 'testExpiryDate';
      const result = (component as any).getInputNameByIdentifier(FrameElementIdentifier.ExpiryDate);
      expect(result).toBe('testExpiryDate');
    });

    it('should return cvvInputName for Cvv identifier', () => {
      component.cvvInputName = 'testCvv';
      const result = (component as any).getInputNameByIdentifier(FrameElementIdentifier.Cvv);
      expect(result).toBe('testCvv');
    });

    it('should return undefined for unknown identifier', () => {
      const result = (component as any).getInputNameByIdentifier('unknownIdentifier' as FrameElementIdentifier);
      expect(result).toBeUndefined();
    });
  });

  describe('listenForSubmitEvent', () => {
    beforeEach(() => {
      component.submitEvent = new Subject<void>();
      component.ngOnInit();
      component['listenForSubmitEvent']();
      fixture.detectChanges();
    });
    it('should emit tokenized event on successful card tokenization', () => {
      const event: FrameCardTokenizedEvent = { token: 'token' };
      spyOn(component.tokenized, 'emit');

      (component as any).cardTokenized.next(event);

      expect(component.tokenized.emit).toHaveBeenCalledWith(event);
    });

    it('should emit tokenizationFailed event on card tokenization failure', () => {
      const event: FrameCardTokenizationFailedEvent = {
        errorCode: 'error',
        message: 'failure'
      };
      spyOn(component.tokenizationFailed, 'emit');

      (component as any).cardTokenizationFailed.next(event);

      expect(component.tokenizationFailed.emit).toHaveBeenCalledWith(event);
    });

    it('should call submitCard on submitEvent', () => {
      spyOn(component as any, 'submitCard');
      (component.submitEvent as Subject<void>).next();

      expect((component as any).submitCard).toHaveBeenCalled();
    });

    it('should log error on cardTokenized subscription error', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      (component as any).cardTokenized.error('error');

      expect(consoleSpy).toHaveBeenCalledWith('pipe cardTokenized with errors', { error: 'error' });
    });

    it('should log error on cardTokenizationFailed subscription error', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      (component as any).cardTokenizationFailed.error('error');

      expect(consoleSpy).toHaveBeenCalledWith('pipe cardTokenizedFailed with errors', { error: 'error' });
    });

    it('should log error on submitEvent subscription error', () => {
      const consoleSpy = spyOn(component['logger'], 'error');
      (component.submitEvent as Subject<void>).error('error');
      expect(consoleSpy).toHaveBeenCalledWith('submitEvent with errors', { error: 'error' });
    });
  });

  describe('Output bindings', () => {
    beforeEach(() => {
      component.ngOnInit();
      component['listenForMerchantKey']();
      component['listenForSubmitEvent']();
      component['listenForFramesEvents']();
      fixture.detectChanges();
    });
    it('should emit tokenized event on successful tokenization', () => {
      spyOn(component.tokenized, 'emit');

      const tokenizedEvent: FrameCardTokenizedEvent = {
        token: 'token',
        bin: 'bin',
        scheme: 'Visa'
      };
      component['cardTokenized'].next(tokenizedEvent);
      expect(component.tokenized.emit).toHaveBeenCalledWith(tokenizedEvent);
    });

    it('should emit tokenizationFailed event on tokenization failure', () => {
      spyOn(component.tokenizationFailed, 'emit');

      const tokenizationFailedEvent: FrameCardTokenizationFailedEvent = {
        errorCode: 'error',
        message: 'failure'
      };
      component['cardTokenizationFailed'].next(tokenizationFailedEvent);

      expect(component.tokenizationFailed.emit).toHaveBeenCalledWith(tokenizationFailedEvent);
    });

    it('should emit paymentMethodChange on payment method change', () => {
      spyOn(component.paymentMethodChange, 'next');

      const paymentMethodChangeEvent: FramePaymentMethodChangedEvent = {
        paymentMethod: 'Visa',
        isValid: true
      };
      (component as any).paymentMethodChanged.next(paymentMethodChangeEvent);

      expect(component.paymentMethodChange.next).toHaveBeenCalledWith(paymentMethodChangeEvent);
    });
  });

  it('should have frames inputs', () => {
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_CARD_NUMBER).length).toBeGreaterThanOrEqual(1);
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_EXPIRY_DATE).length).toBeGreaterThanOrEqual(1);
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_CVV).length).toBeGreaterThanOrEqual(1);
  });
});

