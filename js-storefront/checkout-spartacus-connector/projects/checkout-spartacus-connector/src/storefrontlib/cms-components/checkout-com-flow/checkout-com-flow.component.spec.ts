import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComFlowComponentInterface, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { MockCxSpinnerComponent } from '@checkout-tests/components';
import { queryDebugElementByCss } from '@checkout-tests/finders.mock';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { CheckoutWebComponents, Options, TokenizeResult } from '@checkout.com/checkout-web-components';
import { GlobalMessageService, GlobalMessageType, HttpErrorModel, LanguageService, LoggerService, QueryState, WindowRef } from '@spartacus/core';
import { of, throwError } from 'rxjs';

import { CheckoutComFlowComponent } from './checkout-com-flow.component';

const mockCheckoutWebComponents = {} as CheckoutWebComponents;
const customOptions: Partial<Options> = {
  translations: {
    'en': {
      'bank_account': 'Pay Now'
    }
  }
};
const mockFlowComponent = {
  name: '',
  selectedPaymentMethodId: '',
  selectedType: undefined,
  type: undefined,
  isAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isPayButtonRequired(): boolean {
    return false;
  },
  isValid(): boolean {
    return false;
  },
  submit(): void {
  },
  tokenize(): Promise<TokenizeResult | void> {
    return Promise.resolve(undefined);
  },
  unmount(): CheckoutComFlowComponentInterface {
    return undefined;
  },
  unselect(): void {
  },
  mount: jasmine.createSpy('mount')
};

describe('CheckoutComFlowComponent', () => {
  let component: CheckoutComFlowComponent;
  let fixture: ComponentFixture<CheckoutComFlowComponent>;
  let windowRef: WindowRef;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let loggerService: LoggerService;
  let globalMessageService: GlobalMessageService;
  let languageService: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {

    languageService = jasmine.createSpyObj('LanguageService', ['getActive']);
    languageService.getActive.and.returnValue(of('en'));

    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComFlowComponent,
          MockCxSpinnerComponent
        ],
        providers: [
          LoggerService,
          WindowRef,
          ChangeDetectorRef,
          {
            provide: CheckoutComFlowFacade,
            useClass: MockCheckoutComFlowFacade
          },
          {
            provide: GlobalMessageService,
            useClass: MockGlobalMessageService
          },
          {
            provide: LanguageService,
            useValue: languageService
          }
        ]
      })
      .compileComponents();

    TestBed.overrideComponent(CheckoutComFlowComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });

    fixture = TestBed.createComponent(CheckoutComFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    loggerService = TestBed.inject(LoggerService);
    globalMessageService = TestBed.inject(GlobalMessageService);
    windowRef = TestBed.inject(WindowRef);
    languageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call initializeFlowObservables', () => {
      spyOn<any>(component, 'initializeFlowObservables');

      component.ngOnInit();

      expect(component['initializeFlowObservables']).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call initializeFlow on the facade', () => {
      spyOn(checkoutComFlowFacade, 'initializeFlow');
      component.ngAfterViewInit();

      expect(checkoutComFlowFacade.initializeFlow).toHaveBeenCalled();
    });

    it('should call listenForFlowEnabled', () => {
      spyOn<any>(component, 'listenForFlowEnabled');

      component.ngAfterViewInit();

      expect(component['listenForFlowEnabled']).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should set checkoutInstance to null if it is defined', () => {
      component['checkoutInstance'] = {} as any;
      component['flowComponent'] = mockFlowComponent;

      component.ngOnDestroy();

      expect(component['checkoutInstance']).toBeNull();
    });

    it('should not throw an error if checkoutInstance is already null', () => {
      component['checkoutInstance'] = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('createPaymentSessions', () => {
    it('should return CheckoutWebComponents when both observables emit valid values', (done) => {
      const mockPublicKey = 'test-public-key';
      const mockPaymentSessionState = {
        loading: false,
        data: {}
      } as QueryState<CheckoutComPaymentDetails>;

      spyOn(checkoutComFlowFacade, 'createPaymentSessions').and.returnValue(of(mockCheckoutWebComponents));
      spyOn(checkoutComFlowFacade, 'getFlowPublicKey').and.returnValue(of(mockPublicKey));
      spyOn(checkoutComFlowFacade, 'requestPaymentSession').and.returnValue(of(mockPaymentSessionState));

      component.createPaymentSessions(customOptions).subscribe((result) => {
        expect(result).toBe(mockCheckoutWebComponents);
        done();
      });
    });

    it('should not call loadWebComponents if getFlowPublicKey emits an empty value', (done) => {
      spyOn(checkoutComFlowFacade, 'getFlowPublicKey').and.returnValue(of(undefined));
      spyOn(checkoutComFlowFacade, 'requestPaymentSession');

      component.createPaymentSessions(customOptions).subscribe({
        complete: () => {
          expect(checkoutComFlowFacade.requestPaymentSession).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('initializeFlowObservables', () => {
    it('should set isLoading$ to the value returned by getIsProcessing', () => {
      const mockIsProcessing$ = of(true);
      spyOn(checkoutComFlowFacade, 'getIsProcessing').and.returnValue(mockIsProcessing$);

      component['initializeFlowObservables']();

      expect(component.isLoading$).toBe(mockIsProcessing$);
    });

    it('should set isEnabled$ to the value returned by getIsFlowEnabled', () => {
      const mockIsFlowEnabled$ = of(true);
      spyOn(checkoutComFlowFacade, 'getIsFlowEnabled').and.returnValue(mockIsFlowEnabled$);

      component['initializeFlowObservables']();

      expect(component.isEnabled$).toBe(mockIsFlowEnabled$);
    });
  });

  describe('listenForFlowEnabled', () => {
    it('should call createPaymentSessions when isEnabled$ emits true', () => {
      const mockCheckoutWebComponents = {} as CheckoutWebComponents;
      spyOn<any>(component, 'createPaymentSessions').and.returnValue(of(mockCheckoutWebComponents));
      spyOn<any>(component, 'handleWebComponentsLoaded');

      component['isEnabled$'] = of(true);

      component['listenForFlowEnabled']();

      expect(component['createPaymentSessions']).toHaveBeenCalled();
      expect(component['handleWebComponentsLoaded']).toHaveBeenCalledWith(mockCheckoutWebComponents);
    });

    it('should call handleWebComponentsError when createPaymentSessions throws an error', () => {
      const mockError = { message: 'Error' } as HttpErrorModel;
      spyOn<any>(component, 'createPaymentSessions').and.returnValue(throwError(() => mockError));
      spyOn<any>(component, 'handleWebComponentsError');

      component['isEnabled$'] = of(true);

      component['listenForFlowEnabled']();

      expect(component['handleWebComponentsError']).toHaveBeenCalledWith(mockError);
    });

    it('should not call createPaymentSessions if isEnabled$ emits false', () => {
      spyOn<any>(component, 'createPaymentSessions');

      component['isEnabled$'] = of(false);

      component['listenForFlowEnabled']();

      expect(component['createPaymentSessions']).not.toHaveBeenCalled();
    });
  });

  describe('handleWebComponentsLoaded', () => {
    it('should set checkoutInstance to the provided checkout object', () => {
      const mockCheckout = {} as CheckoutWebComponents;
      spyOn<any>(component, 'mountFlowComponent');

      component['handleWebComponentsLoaded'](mockCheckout);

      expect(component['checkoutInstance']).toBe(mockCheckout);
    });

    it('should call mountFlowComponent with the provided checkout object', () => {
      const mockCheckout = {} as CheckoutWebComponents;
      spyOn<any>(component, 'mountFlowComponent');

      component['handleWebComponentsLoaded'](mockCheckout);

      expect(component['mountFlowComponent']).toHaveBeenCalled();
      expect(component['checkoutInstance']).toBe(mockCheckout);
    });
  });

  describe('handleWebComponentsError', () => {
    it('should set webComponentsError to the error message if provided', () => {
      const mockError = { message: 'Test error message' } as HttpErrorModel;
      spyOn(loggerService, 'error');

      component['handleWebComponentsError'](mockError);

      expect(component.webComponentsError).toBe('Test error message');
      expect(loggerService.error).toHaveBeenCalledWith(mockError);
      expect(globalMessageService.add).toHaveBeenCalledWith('Test error message', GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should set webComponentsError to a default message if error message is not provided', () => {
      const mockError = {} as HttpErrorModel;
      spyOn(loggerService, 'error');

      component['handleWebComponentsError'](mockError);

      expect(component.webComponentsError).toBe('Unknown error loading payment components');
      expect(loggerService.error).toHaveBeenCalledWith(mockError);
      expect(globalMessageService.add).toHaveBeenCalledWith('Unknown error loading payment components', GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should handle null or undefined error gracefully', () => {
      spyOn(loggerService, 'error');

      component['handleWebComponentsError'](null);

      expect(component.webComponentsError).toBe('Unknown error loading payment components');
      expect(loggerService.error).toHaveBeenCalledWith(null);
      expect(globalMessageService.add).toHaveBeenCalledWith('Unknown error loading payment components', GlobalMessageType.MSG_TYPE_ERROR);
    });
  });

  describe('mountFlowComponent', () => {
    it('should call checkout.create with "flow" and mount the component to the container', () => {
      const mockCheckout = jasmine.createSpyObj('CheckoutWebComponents', ['create']);
      const mockFlowComponent = jasmine.createSpyObj('CheckoutComFlowComponentInterface', ['mount']);
      mockCheckout.create.and.returnValue(mockFlowComponent);
      component['checkoutInstance'] = mockCheckout;

      const mockContainer = document.createElement('div');
      spyOn(document, 'getElementById').and.returnValue(mockContainer);

      component['mountFlowComponent']();

      expect(mockCheckout.create).toHaveBeenCalledWith('flow');
      expect(mockFlowComponent.mount).toHaveBeenCalledWith(mockContainer);
    });

    it('should call handleWebComponentsError if the container is not found', () => {
      spyOn(document, 'getElementById').and.returnValue(null);
      spyOn<any>(component, 'handleWebComponentsError');
      spyOn(loggerService, 'error');
      const mockCheckout = jasmine.createSpyObj('CheckoutWebComponents', ['create', 'unmount', 'mount']);
      mockCheckout.create.and.throwError('Mounting error');
      component['checkoutInstance'] = mockCheckout;
      component['flowComponent'] = mockFlowComponent;

      component['mountFlowComponent']();

      expect(component['handleWebComponentsError']).toHaveBeenCalledWith({ message: 'Payment container not found' });
      expect(loggerService.error).toHaveBeenCalledWith('Flow container not found in DOM');
    });

    it('should call handleWebComponentsError if an error occurs during mounting', () => {
      const mockCheckout = jasmine.createSpyObj('CheckoutWebComponents', ['create', 'unmount']);
      mockCheckout.create.and.throwError('Mounting error');
      component['checkoutInstance'] = mockCheckout;

      spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
      spyOn<any>(component, 'handleWebComponentsError');

      component['mountFlowComponent']();

      expect(component['handleWebComponentsError']).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('should not proceed if windowRef.isBrowser returns false', () => {
      spyOn(windowRef, 'isBrowser').and.returnValue(false);
      spyOn(document, 'getElementById');
      spyOn(loggerService, 'error');
      component['flowComponent'] = mockFlowComponent;

      component['mountFlowComponent']();

      expect(document.getElementById).not.toHaveBeenCalled();
      expect(loggerService.error).not.toHaveBeenCalled();
    });
  });

  describe('UI component', () => {
    it('displays the spinner when loading', () => {
      component.isLoading$ = of(true);
      fixture.detectChanges();
      const spinner = queryDebugElementByCss(fixture, 'cx-spinner');
      expect(spinner).toBeTruthy();
    });

    it('hides the form when loading', () => {
      component.isLoading$ = of(true);
      fixture.detectChanges();
      const form = queryDebugElementByCss(fixture, 'form');
      expect(form.nativeElement.hidden).toBeTrue();
    });

    it('displays the form when not loading', () => {
      component.isLoading$ = of(false);
      fixture.detectChanges();
      const form = queryDebugElementByCss(fixture, 'form');
      expect(form.nativeElement.hidden).toBeFalse();
    });

    it('renders the flow container', () => {
      fixture.detectChanges();
      const flowContainer = queryDebugElementByCss(fixture, '#flow-container');
      expect(flowContainer).toBeTruthy();
    });
  });
});
