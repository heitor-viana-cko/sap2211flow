import { TestBed } from '@angular/core/testing';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { CheckoutComFlowConnector } from '@checkout-core/connectors/checkout-com-flow/checkout-com-flow.connector';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import { CheckoutComOrderPlacedEvent } from '@checkout-core/events/checkout-order.events';
import { CheckoutComCustomerConfiguration, CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { MockCheckoutComPaymentConnector } from '@checkout-tests/connectors/checkout-com-payment-connector.mock';
import { MockActiveCartService } from '@checkout-tests/services/cart-active.service.mock';
import { MockCheckoutQueryFacade } from '@checkout-tests/services/checkout-query.mock';
import { MockEventService } from '@checkout-tests/services/event-service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { CheckoutErrorType, CheckoutWebComponents, Component, Options, PayPaymentSessionSuccessfulResponse } from '@checkout.com/checkout-web-components';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutPaymentConnector } from '@spartacus/checkout/base/core';
import { CheckoutDeliveryAddressCreatedEvent, CheckoutDeliveryAddressSetEvent, CheckoutQueryFacade } from '@spartacus/checkout/base/root';
import {
  CommandService,
  CurrencySetEvent,
  EventService,
  GlobalMessageService,
  GlobalMessageType,
  LanguageSetEvent,
  LoginEvent,
  LogoutEvent,
  QueryService,
  QueryState,
  RoutingService,
  UserIdService
} from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { Observable, of, throwError } from 'rxjs';
import { CheckoutComFlowService } from './checkout-com-flow.service';

const publicKey = 'pk_test_12345';

const merchantConfiguration: CheckoutComCustomerConfiguration = {
  publicKey,
  environment: 'sandbox'
};

const mockPaymentSession = {
  id: 'session_123',
  token: 'token_abc'
};

const customOptions: Partial<Options> = {
  translations: {
    'en': {
      'bank_account': 'Pay Now'
    }
  }
};

describe('CheckoutComFlowService', () => {
  let service: CheckoutComFlowService;
  let checkoutComConnector: jasmine.SpyObj<CheckoutComConnector>;
  let checkoutComFlowConnector: jasmine.SpyObj<CheckoutComFlowConnector>;
  let activeCartFacade: ActiveCartFacade;
  let userIdService: UserIdService;
  let queryService: QueryService;
  let commandService: CommandService;
  let eventService: EventService;
  let checkoutPaymentConnector: jasmine.SpyObj<CheckoutPaymentConnector>;
  let checkoutQueryFacade: CheckoutQueryFacade;
  let globalMessageService: GlobalMessageService;
  let checkoutApmConnector: CheckoutComApmConnector;
  let mockWebComponents: any;
  let routingService: jasmine.SpyObj<RoutingService>;

  beforeEach(() => {
    mockWebComponents = {
      type: 'flow',
      selectedType: 'flow',
      selectedPaymentMethodId: undefined,
      name: 'Test Component',
      submit: jasmine.createSpy('submit'),
      tokenize: jasmine.createSpy('tokenize').and.returnValue(Promise.resolve({ token: 'test-token' })),
      isValid: jasmine.createSpy('isValid').and.returnValue(true),
      isAvailable: jasmine.createSpy('isAvailable').and.returnValue(Promise.resolve(true)),
      isPayButtonRequired: jasmine.createSpy('isPayButtonRequired').and.returnValue(false),
      unselect: jasmine.createSpy('unselect'),
      mount: jasmine.createSpy('mount').and.returnValue(mockWebComponents),
      unmount: jasmine.createSpy('unmount').and.returnValue(mockWebComponents)
    };

    checkoutPaymentConnector = jasmine.createSpyObj('CheckoutComPaymentConnector', [
      'createPaymentDetails',
      'getPaymentDetails',
      'updatePaymentDetails',
      'getPaymentCardTypes'
    ]);
    checkoutComFlowConnector = jasmine.createSpyObj('CheckoutComFlowConnector', [
      'requestIsFlowEnabled',
      'requestFlowUIConfiguration',
      'requestFlowPaymentSession'
    ]);

    checkoutComConnector = jasmine.createSpyObj('CheckoutComConnector', [
      'getMerchantKey',
      'getIsABC'
    ]);
    checkoutApmConnector = jasmine.createSpyObj('CheckoutComApmConnector', ['getApmPaymentMethods']);

    checkoutComConnector.getMerchantKey.and.returnValue(of(JSON.stringify(merchantConfiguration)));
    checkoutComFlowConnector.requestIsFlowEnabled.and.returnValue(of({ enabled: false }));
    checkoutComFlowConnector.requestFlowUIConfiguration.and.returnValue(of({}));
    checkoutComFlowConnector.requestFlowPaymentSession.and.returnValue(of({}));

    routingService = jasmine.createSpyObj('RoutingService', ['go']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutComFlowService,
        QueryService,
        CommandService,
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartService
        },
        {
          provide: CheckoutComPaymentConnector,
          useClass: MockCheckoutComPaymentConnector
        },
        {
          provide: CheckoutQueryFacade,
          useClass: MockCheckoutQueryFacade
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComConnector,
          useValue: checkoutComConnector
        },
        {
          provide: CheckoutComApmConnector,
          useValue: checkoutApmConnector
        },
        {
          provide: CheckoutComFlowConnector,
          useValue: checkoutComFlowConnector
        },
        {
          provide: RoutingService,
          useValue: routingService
        }
      ]
    });
    service = TestBed.inject(CheckoutComFlowService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    queryService = TestBed.inject(QueryService);
    commandService = TestBed.inject(CommandService);
    eventService = TestBed.inject(EventService);
    checkoutPaymentConnector = TestBed.inject(CheckoutComPaymentConnector) as jasmine.SpyObj<CheckoutComPaymentConnector>;
    checkoutQueryFacade = TestBed.inject(CheckoutQueryFacade);
    globalMessageService = TestBed.inject(GlobalMessageService);
    checkoutComConnector = TestBed.inject(CheckoutComConnector) as jasmine.SpyObj<CheckoutComConnector>;
    checkoutApmConnector = TestBed.inject(CheckoutComApmConnector);
    checkoutComFlowConnector = TestBed.inject(CheckoutComFlowConnector) as jasmine.SpyObj<CheckoutComFlowConnector>;
    userIdService = TestBed.inject(UserIdService);
    routingService = TestBed.inject(RoutingService) as jasmine.SpyObj<RoutingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIsProcessing', () => {
    it('should emit the current processing state as true when isProcessing$ is true', (done) => {
      service['isProcessing$'].next(true);

      service.getIsProcessing().subscribe((isProcessing) => {
        expect(isProcessing).toBeTrue();
        done();
      });
    });

    it('should emit the current processing state as false when isProcessing$ is false', (done) => {
      service['isProcessing$'].next(false);

      service.getIsProcessing().subscribe((isProcessing) => {
        expect(isProcessing).toBeFalse();
        done();
      });
    });

    it('should not emit any value if isProcessing$ is undefined', (done) => {
      service['isProcessing$'].next(undefined);

      service.getIsProcessing().subscribe((isProcessing) => {
        expect(isProcessing).toBeUndefined();
        done();
      });
    });
  });

  describe('getIsFlowEnabled', () => {
    it('should emit true when isFlowEnabled$ is set to true', (done) => {
      service['isFlowEnabled$'].next(true);

      service.getIsFlowEnabled().subscribe((isEnabled) => {
        expect(isEnabled).toBeTrue();
        done();
      });
    });

    it('should emit false when isFlowEnabled$ is set to false', (done) => {
      service['isFlowEnabled$'].next(false);

      service.getIsFlowEnabled().subscribe((isEnabled) => {
        expect(isEnabled).toBeFalse();
        done();
      });
    });

    it('should not emit any value if isFlowEnabled$ is not set', (done) => {
      service['isFlowEnabled$'].next(undefined);

      service.getIsFlowEnabled().subscribe((isEnabled) => {
        expect(isEnabled).toBeUndefined();
        done();
      });
    });
  });

  describe('getIsProcessingFlowEnabled', () => {
    it('should emit true when requestIsFlowEnabled is loading', (done) => {
      spyOn<any>(service, 'requestIsFlowEnabled').and.returnValue(of({ loading: true }));

      service.getIsProcessingFlowEnabled().subscribe((isProcessing) => {
        expect(isProcessing).toBeTrue();
        done();
      });
    });

    it('should emit false when requestIsFlowEnabled is not loading', (done) => {
      spyOn<any>(service, 'requestIsFlowEnabled').and.returnValue(of({ loading: false }));

      service.getIsProcessingFlowEnabled().subscribe((isProcessing) => {
        expect(isProcessing).toBeFalse();
        done();
      });
    });
  });

  describe('getIsProcessingFlowUIConfiguration', () => {
    it('should emit true when requestFlowUIConfiguration is loading', (done) => {
      spyOn<any>(service, 'requestFlowUIConfiguration').and.returnValue(of({ loading: true }));

      service.getIsProcessingFlowUIConfiguration().subscribe((isProcessing) => {
        expect(isProcessing).toBeTrue();
        done();
      });
    });

    it('should emit false when requestFlowUIConfiguration is not loading', (done) => {
      spyOn<any>(service, 'requestFlowUIConfiguration').and.returnValue(of({ loading: false }));

      service.getIsProcessingFlowUIConfiguration().subscribe((isProcessing) => {
        expect(isProcessing).toBeFalse();
        done();
      });
    });
  });

  describe('getIsProcessingRequestPaymentSession', () => {
    it('should emit true when payment session request is loading', (done) => {
      const mockState: QueryState<CheckoutComPaymentSession> = {
        loading: true,
        error: false,
        data: null
      };
      spyOn<any>(service, 'requestPaymentSession').and.returnValue(of(mockState));

      service.getIsProcessingRequestPaymentSession().subscribe((isProcessing) => {
        expect(isProcessing).toBeTrue();
        done();
      });
    });

    it('should emit false when payment session request is not loading', (done) => {
      const mockState: QueryState<CheckoutComPaymentSession> = {
        loading: false,
        error: false,
        data: null
      };
      spyOn<any>(service, 'requestPaymentSession').and.returnValue(of(mockState));

      service.getIsProcessingRequestPaymentSession().subscribe((isProcessing) => {
        expect(isProcessing).toBeFalse();
        done();
      });
    });
  });

  describe('getFlowUIConfiguration', () => {
    it('should return the current flow appearance configuration when it is set', () => {
      const mockConfiguration: CheckoutComFlowUIConfigurationData = { colorBackground: 'blue' };
      service['flowAppearanceConfiguration'] = mockConfiguration;

      const result = service.getFlowUIConfiguration();

      expect(result).toEqual(mockConfiguration);
    });

    it('should return an empty object when no flow appearance configuration is set', () => {
      service['flowAppearanceConfiguration'] = {};

      const result = service.getFlowUIConfiguration();

      expect(result).toEqual({});
    });
  });

  describe('getFlowPublicKey', () => {
    it('should emit the current public key when it is set', (done) => {
      service['occMerchantKey$'].next('test-public-key');

      service.getFlowPublicKey().subscribe((publicKey) => {
        expect(publicKey).toBe('test-public-key');
        done();
      });
    });

    it('should emit an empty string if no public key is set', (done) => {
      service['occMerchantKey$'].next('');

      service.getFlowPublicKey().subscribe((publicKey) => {
        expect(publicKey).toBe('');
        done();
      });
    });

    it('should not emit any value if occMerchantKey$ is undefined', (done) => {
      service['occMerchantKey$'].next(undefined);

      service.getFlowPublicKey().subscribe((publicKey) => {
        expect(publicKey).toBeUndefined();
        done();
      });
    });
  });

  describe('initializeFlow', () => {
    it('should request flow enabled state and public key when flow is enabled', () => {
      spyOn<any>(service, 'requestIsFlowEnabled').and.returnValue(of({
        loading: false,
        data: { enabled: true }
      }));

      service['setIsFlowEnabled'](true);
      spyOn<any>(service, 'requestPublicKey');
      spyOn<any>(service, 'requestFlowUIConfiguration').and.returnValue(of({}));

      service.initializeFlow();
      expect(service['requestIsFlowEnabled']).toHaveBeenCalled();
      expect(service['requestPublicKey']).toHaveBeenCalled();
      expect(service['requestFlowUIConfiguration']).toHaveBeenCalled();
    });

    it('should not request flow configuration or public key when flow is disabled', () => {
      spyOn<any>(service, 'requestIsFlowEnabled').and.returnValue(of({
        loading: false,
        data: { enabled: false }
      }));
      spyOn<any>(service['isFlowEnabled$'], 'pipe').and.returnValue(of(false));
      spyOn<any>(service, 'requestPublicKey');
      spyOn<any>(service, 'requestFlowUIConfiguration');

      service.initializeFlow();

      expect(service['requestIsFlowEnabled']).toHaveBeenCalled();
      expect(service['requestPublicKey']).not.toHaveBeenCalled();
      expect(service['requestFlowUIConfiguration']).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully when requesting flow enabled state', () => {
      spyOn<any>(service, 'requestIsFlowEnabled').and.returnValue(throwError(() => new Error('Error occurred')));
      spyOn<any>(service['isFlowEnabled$'], 'pipe');
      spyOn<any>(service, 'requestPublicKey');
      spyOn<any>(service, 'requestFlowUIConfiguration');

      service.initializeFlow();

      expect(service['requestIsFlowEnabled']).toHaveBeenCalled();
      expect(service['isFlowEnabled$'].pipe).not.toHaveBeenCalled();
      expect(service['requestPublicKey']).not.toHaveBeenCalled();
      expect(service['requestFlowUIConfiguration']).not.toHaveBeenCalled();
    });
  });

  describe('requestPaymentSession', () => {
    it('should return the current state of the payment session request', (done) => {
      const mockState: QueryState<CheckoutComPaymentSession> = {
        loading: false,
        error: false,
        data: {
          id: 'session-id',
          payment_session_token: 'token',
          payment_session_secret: 'secret'
        }
      };
      spyOn<any>(service['generatePaymentSession$'], 'getState').and.returnValue(of(mockState));

      service.requestPaymentSession().subscribe((state) => {
        expect(state).toEqual(mockState);
        done();
      });
    });

    it('should handle loading state correctly', (done) => {
      const mockState: QueryState<CheckoutComPaymentSession> = {
        loading: true,
        error: false,
        data: null
      };
      spyOn<any>(service['generatePaymentSession$'], 'getState').and.returnValue(of(mockState));

      service.requestPaymentSession().subscribe((state) => {
        expect(state.loading).toBeTrue();
        expect(state.data).toBeNull();
        done();
      });
    });

    it('should handle error state correctly', (done) => {
      const error = new Error('Payment session request failed');
      const mockState: QueryState<CheckoutComPaymentSession> = {
        loading: false,
        error,
        data: null
      };
      spyOn<any>(service['generatePaymentSession$'], 'getState').and.returnValue(of(mockState));

      service.requestPaymentSession().subscribe((state) => {
        expect(state.error).toBe(error);
        expect(state.data).toBeNull();
        done();
      });
    });
  });

  describe('createPaymentSessions', () => {
    it('should load web components when public key and payment session are available', (done) => {
      spyOn<any>(service, 'getFlowPublicKey').and.returnValue(of('test-public-key'));
      spyOn<any>(service, 'requestPaymentSession').and.returnValue(of({ data: { id: 'session-id' } }));
      spyOn<any>(service, 'loadWebComponents').and.returnValue(of({} as CheckoutWebComponents));

      service.createPaymentSessions(customOptions).subscribe((result) => {
        expect(service['loadWebComponents']).toHaveBeenCalledWith('test-public-key', { id: 'session-id' }, customOptions);
        expect(result).toEqual({} as CheckoutWebComponents);
        done();
      });
    });

    it('should not load web components if public key is not available', (done) => {
      spyOn<any>(service, 'getFlowPublicKey').and.returnValue(of(''));
      spyOn<any>(service, 'requestPaymentSession').and.returnValue(of({ data: { id: 'session-id' } }));
      spyOn<any>(service, 'loadWebComponents');

      service.createPaymentSessions(customOptions).subscribe({
        complete: () => {
          expect(service['loadWebComponents']).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should not load web components if payment session is not available', (done) => {
      spyOn<any>(service, 'getFlowPublicKey').and.returnValue(of('test-public-key'));
      spyOn<any>(service, 'requestPaymentSession').and.returnValue(of({ data: null }));
      spyOn<any>(service, 'loadWebComponents');

      service.createPaymentSessions(customOptions).subscribe({
        complete: () => {
          expect(service['loadWebComponents']).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('requestIsFlowEnabled', () => {
    it('should return the current state of the flow enabled request', (done) => {
      const mockState: QueryState<FlowEnabledDataResponseDTO> = {
        loading: false,
        error: false,
        data: { enabled: true }
      };
      spyOn(service['queryIsFlowEnabled$'], 'getState').and.returnValue(of(mockState));

      service['requestIsFlowEnabled']().subscribe((state) => {
        expect(state).toEqual(mockState);
        done();
      });
    });

    it('should handle loading state correctly', (done) => {
      const mockState: QueryState<FlowEnabledDataResponseDTO> = {
        loading: true,
        error: false,
        data: null
      };
      spyOn(service['queryIsFlowEnabled$'], 'getState').and.returnValue(of(mockState));

      service['requestIsFlowEnabled']().subscribe((state) => {
        expect(state.loading).toBeTrue();
        expect(state.data).toBeNull();
        done();
      });
    });

    it('should handle error state correctly', (done) => {
      const error = new Error('Flow enabled request failed');
      const mockState: QueryState<FlowEnabledDataResponseDTO> = {
        loading: false,
        error,
        data: null
      };
      spyOn(service['queryIsFlowEnabled$'], 'getState').and.returnValue(of(mockState));

      service['requestIsFlowEnabled']().subscribe((state) => {
        expect(state.error).toBe(error);
        expect(state.data).toBeNull();
        done();
      });
    });
  });

  describe('getDisableModalActions', () => {
    it('emits true when modal actions are disabled', (done) => {
      service['disableModalActions$'].next(true);

      service.getDisableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeTrue();
        done();
      });
    });

    it('emits false when modal actions are enabled', (done) => {
      service['disableModalActions$'].next(false);

      service.getDisableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeFalse();
        done();
      });
    });

    it('does not emit any value if disableModalActions$ is undefined', (done) => {
      service['disableModalActions$'].next(undefined);

      service.getDisableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeUndefined();
        done();
      });
    });
  });

  describe('setIsFlowEnabled', () => {
    it('should update isFlowEnabled$ with true when called with true', (done) => {
      service['setIsFlowEnabled'](true);
      service['isFlowEnabled$'].subscribe((isEnabled) => {
        expect(isEnabled).toBeTrue();
        done();
      });

    });

    it('should update isFlowEnabled$ with false when called with false', (done) => {
      service['setIsFlowEnabled'](false);
      service['isFlowEnabled$'].subscribe((isEnabled) => {
        expect(isEnabled).toBeFalse();
        done();
      });
    });
  });

  describe('requestFlowUIConfiguration', () => {
    it('should return the current state of the flow UI configuration request', (done) => {
      const mockState: QueryState<CheckoutComFlowUIConfigurationData> = {
        loading: false,
        error: false,
        data: { colorBackground: 'blue' }
      };
      spyOn(service['queryRequestFlowUIConfiguration$'], 'getState').and.returnValue(of(mockState));

      service['requestFlowUIConfiguration']().subscribe((state) => {
        expect(state).toEqual(mockState);
        done();
      });
    });

    it('should handle loading state correctly', (done) => {
      const mockState: QueryState<CheckoutComFlowUIConfigurationData> = {
        loading: true,
        error: false,
        data: null
      };
      spyOn(service['queryRequestFlowUIConfiguration$'], 'getState').and.returnValue(of(mockState));

      service['requestFlowUIConfiguration']().subscribe((state) => {
        expect(state.loading).toBeTrue();
        expect(state.data).toBeNull();
        done();
      });
    });

    it('should handle error state correctly', (done) => {
      const error = new Error('Flow UI configuration request failed');
      const mockState: QueryState<CheckoutComFlowUIConfigurationData> = {
        loading: false,
        error,
        data: null
      };
      spyOn(service['queryRequestFlowUIConfiguration$'], 'getState').and.returnValue(of(mockState));

      service['requestFlowUIConfiguration']().subscribe((state) => {
        expect(state.error).toBe(error);
        expect(state.data).toBeNull();
        done();
      });
    });
  });

  describe('setFlowPaymentSession', () => {
    it('should update flowPaymentSession$ with the provided payment session', (done) => {
      const mockPaymentSession: CheckoutComPaymentSession = {
        id: 'session-id',
        payment_session_token: 'token',
        payment_session_secret: 'secret'
      };
      service['setFlowPaymentSession'](mockPaymentSession);
      service['flowPaymentSession$'].subscribe((paymentSession) => {
        expect(paymentSession).toEqual(mockPaymentSession);
        done();
      });
    });
  });

  describe('setFlowUIConfiguration', () => {
    it('should update flowAppearanceConfiguration with the provided configuration', () => {
      const mockConfiguration: CheckoutComFlowUIConfigurationData = { colorBackground: 'blue' };

      service['setFlowUIConfiguration'](mockConfiguration);

      expect(service['flowAppearanceConfiguration']).toEqual(mockConfiguration);
    });

    it('should overwrite existing flowAppearanceConfiguration with the new configuration', () => {
      service['flowAppearanceConfiguration'] = { colorBackground: 'red' };
      const newConfiguration: CheckoutComFlowUIConfigurationData = { colorBackground: 'green' };

      service['setFlowUIConfiguration'](newConfiguration);

      expect(service['flowAppearanceConfiguration']).toEqual(newConfiguration);
    });

    it('should set flowAppearanceConfiguration to an empty object if provided configuration is empty', () => {
      const emptyConfiguration: CheckoutComFlowUIConfigurationData = {};

      service['setFlowUIConfiguration'](emptyConfiguration);

      expect(service['flowAppearanceConfiguration']).toEqual(emptyConfiguration);
    });
  });

  describe('requestPublicKey', () => {
    it('should call setFlowPublicKey with the retrieved public key', () => {
      const publicKey = 'test-public-key';
      spyOn(service, 'getOccMerchantKeyFromState').and.returnValue(of(publicKey));
      spyOn(service as any, 'setFlowPublicKey');

      (service as any).requestPublicKey();

      expect(service['setFlowPublicKey']).toHaveBeenCalledWith(publicKey);
    });

    it('should not call setFlowPublicKey if the retrieved public key is empty', () => {
      spyOn(service, 'getOccMerchantKeyFromState').and.returnValue(of(''));
      spyOn(service as any, 'setFlowPublicKey');

      (service as any).requestPublicKey();

      expect(service['setFlowPublicKey']).not.toHaveBeenCalled();
    });

    it('should not call setFlowPublicKey if the retrieved public key is undefined', () => {
      spyOn(service, 'getOccMerchantKeyFromState').and.returnValue(of(undefined));
      spyOn(service as any, 'setFlowPublicKey');

      (service as any).requestPublicKey();

      expect(service['setFlowPublicKey']).not.toHaveBeenCalled();
    });
  });

  describe('setFlowPublicKey', () => {
    it('should update occMerchantKey$ with the provided public key', (done) => {
      const publicKey = 'test-public-key';
      service['setFlowPublicKey'](publicKey);
      service['occMerchantKey$'].subscribe((publicKey) => {
        expect(publicKey).toBe(publicKey);
        done();
      });
    });

    it('should update occMerchantKey$ with an empty string when called with an empty string', (done) => {
      service['setFlowPublicKey']('');
      service['occMerchantKey$'].subscribe((publicKey) => {
        expect(publicKey).toBe('');
        done();
      });
    });

    it('should update occMerchantKey$ with undefined when called with undefined', (done) => {
      service['setFlowPublicKey'](undefined as unknown as string);
      service['occMerchantKey$'].subscribe((publicKey) => {
        expect(publicKey).toBeUndefined();
        done();
      });
    });
  });

  describe('loadWebComponents', () => {
    it('should create the correct options and call loadCheckoutWebComponents', (done) => {
      const expectedEnvironment = 'sandbox';
      let capturedOptions: any;
      spyOn(service['isProcessing$'], 'next');
      spyOn(service as any, 'getEnvironment').and.returnValue(expectedEnvironment);
      spyOn<any>(service, 'loadWebComponents').and.callFake((publicKey: string, paymentSession: any) => {
        service['isProcessing$'].next(true);
        capturedOptions = {
          publicKey,
          paymentSession,
          environment: service['getEnvironment']() || 'sandbox',
          appearance: service['flowAppearanceConfiguration'] || undefined,
          ...customOptions,
          ...service['defaultWebComponentsOptions'],
          ...service['customWebComponentsOptions']
        };

        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        next: (result) => {
          expect(capturedOptions).toEqual({
            publicKey: publicKey,
            paymentSession: mockPaymentSession,
            environment: expectedEnvironment,
            appearance: {},
            ...customOptions,
            ...service['defaultWebComponentsOptions'],
            ...service['customWebComponentsOptions']
          });
          expect(result).toEqual(mockWebComponents);
          expect(service['isProcessing$'].next).toHaveBeenCalledWith(true);
          done();
        }
      });
    });

    it('should use the appearance configuration when it is defined.', (done) => {
      const mockAppearance = { colorBackground: 'black' };
      service['flowAppearanceConfiguration'] = mockAppearance;

      let capturedOptions: any;

      spyOn<any>(service, 'loadWebComponents').and.callFake((publicKey: string, paymentSession: any) => {
        service['isProcessing$'].next(true);
        capturedOptions = {
          publicKey,
          paymentSession,
          environment: service['getEnvironment']() || 'sandbox',
          appearance: service['flowAppearanceConfiguration'] || undefined,
          ...service['defaultWebComponentsOptions'],
          ...service['customWebComponentsOptions']
        };

        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        next: () => {
          expect(capturedOptions.appearance).toEqual(mockAppearance);
          done();
        }
      });
    });

    it('should use the ‘production’ environment when getEnvironment returns it', (done) => {
      spyOn(service as any, 'getEnvironment').and.returnValue('production');

      let capturedOptions: any;

      spyOn<any>(service, 'loadWebComponents').and.callFake((publicKey: string, paymentSession: any) => {
        service['isProcessing$'].next(true);
        capturedOptions = {
          publicKey,
          paymentSession,
          environment: service['getEnvironment']() || 'sandbox',
          appearance: service['flowAppearanceConfiguration'] || undefined,
          ...customOptions,
          ...service['defaultWebComponentsOptions'],
          ...service['customWebComponentsOptions']
        };

        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        next: () => {
          expect(capturedOptions.environment).toBe('production');
          done();
        }
      });
    });

    it('should merge defaultWebComponentsOptions and customWebComponentsOptions', (done) => {
      service['defaultWebComponentsOptions'] = {
        publicKey: 'firstKey',
        paymentSession: {
          id: 'defaultSession'
        }
      };
      service['customWebComponentsOptions'] = {
        publicKey: 'new Key',
        appearance: {
          colorBackground: 'yellow'
        }
      };

      let capturedOptions: any;

      spyOn<any>(service, 'loadWebComponents').and.callFake((publicKey: string, paymentSession: any) => {
        service['isProcessing$'].next(true);
        capturedOptions = {
          publicKey,
          paymentSession,
          environment: service['getEnvironment']() || 'sandbox',
          appearance: service['flowAppearanceConfiguration'] || undefined,
          ...service['defaultWebComponentsOptions'],
          ...service['customWebComponentsOptions']
        };

        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        next: () => {
          expect(capturedOptions.publicKey).toBe('new Key');
          expect(capturedOptions.paymentSession.id).toBe('defaultSession');
          expect(capturedOptions.appearance.colorBackground).toBe('yellow');
          done();
        }
      });
    });

    it('should set isProcessing$ to true at startup', (done) => {
      const nextSpy = spyOn(service['isProcessing$'], 'next');

      spyOn<any>(service, 'loadWebComponents').and.callFake(() => {
        service['isProcessing$'].next(true);
        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        next: () => {
          expect(nextSpy).toHaveBeenCalledWith(true);
          done();
        }
      });
    });

    it('should propagate errors from loadCheckoutWebComponents', (done) => {
      const mockError = new Error('Load failed');

      spyOn<any>(service, 'loadWebComponents').and.callFake(() => {
        service['isProcessing$'].next(true);
        return new Observable(observer => {
          observer.error(mockError);
        });
      });

      service['loadWebComponents'](publicKey, mockPaymentSession, customOptions).subscribe({
        error: (error) => {
          expect(error).toEqual(mockError);
          done();
        }
      });
    });

    it('should convert the Promise to Observable', (done) => {
      spyOn<any>(service, 'loadWebComponents').and.callFake(() => {
        return new Observable(observer => {
          observer.next(mockWebComponents);
          observer.complete();
        });
      });

      const result$ = service['loadWebComponents'](publicKey, mockPaymentSession, customOptions);

      expect(result$.subscribe).toBeDefined();
      result$.subscribe({
        next: (result) => {
          expect(result).toEqual(mockWebComponents);
          done();
        }
      });
    });
  });

  describe('reloadOnPaymentSessionEvents', () => {
    it('returns the correct list of events for reloading the payment session', () => {
      const events = service.reloadOnPaymentSessionEvents();
      expect(events).toEqual([
        CheckoutDeliveryAddressCreatedEvent,
        CheckoutDeliveryAddressSetEvent,
        CheckoutComBillingAddressUpdatedEvent,
        CurrencySetEvent,
        LanguageSetEvent,
      ]);
    });
  });

  describe('resetOnPaymentSessionEvents', () => {
    it('returns the correct list of events for resetting the payment session', () => {
      const events = service.resetOnPaymentSessionEvents();
      expect(events).toEqual([
        LogoutEvent,
        LoginEvent,
        OrderPlacedEvent,
        CheckoutComOrderPlacedEvent
      ]);
    });
  });

  describe('defaultWebComponentsOptions', () => {
    it('should set isProcessing$ to false when onReady is called', () => {
      service['defaultWebComponentsOptions'].onReady(mockWebComponents);
      service['isProcessing$'].subscribe((isProcessing) => {
        expect(isProcessing).toBeFalse();
      });
    });

    it('should log an error and not navigate if payment status is not "Approved"', async () => {
      const mockPayment = { status: 'Declined' };
      const loggerSpy = spyOn(service['logger'], 'error');

      await service['defaultWebComponentsOptions'].onPaymentCompleted(mockWebComponents, mockPayment as PayPaymentSessionSuccessfulResponse);

      expect(loggerSpy).toHaveBeenCalledWith('Payment not authorised. Status: Declined');
      expect(routingService.go).not.toHaveBeenCalled();
    });

    it('should navigate to order confirmation if payment status is "Approved"', async () => {
      const mockPayment = {
        status: 'Approved',
        id: 'payment-id'
      } as PayPaymentSessionSuccessfulResponse;

      await service['defaultWebComponentsOptions'].onPaymentCompleted(mockWebComponents, mockPayment);

      expect(routingService.go).toHaveBeenCalledWith(
        { cxRoute: 'orderConfirmation' },
        {
          queryParams: {
            authorized: true,
            'cko-session-id': 'payment-id'
          }
        }
      );
    });

    it('should log an error and set isProcessing$ to false when onError is called', async () => {
      const mockError: any = {
        name: 'CheckoutError',
        message: 'Payment method error',
        type: CheckoutErrorType.PaymentMethod,
        status: 'Declined'
      };
      const loggerSpy = spyOn(service['logger'], 'error');
      const isProcessingSpy = spyOn(service['isProcessing$'], 'next');

      await service['defaultWebComponentsOptions'].onError(mockWebComponents, mockError);

      expect(globalMessageService.add).toHaveBeenCalledWith(
        { key: 'checkoutReview.paymentAuthorizationError' },
        GlobalMessageType.MSG_TYPE_ERROR
      );
      expect(loggerSpy).toHaveBeenCalledWith(mockError);
      expect(isProcessingSpy).toHaveBeenCalledWith(false);
    });

    it('should disable modal actions when onSubmit is called', (done) => {
      service['defaultWebComponentsOptions'].onSubmit({} as Component);

      service.getDisableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeTrue();
        done();
      });
    });
  });

});
