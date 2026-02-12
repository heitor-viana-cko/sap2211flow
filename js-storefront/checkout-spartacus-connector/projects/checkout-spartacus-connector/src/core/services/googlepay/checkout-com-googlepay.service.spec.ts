import { TestBed } from '@angular/core/testing';
import { CheckoutComGooglepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-googlepay.connector';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { generateOneGooglePayMerchantConfiguration } from '@checkout-tests/fake-data/googlepay/google-pay.mock';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { MockActiveCartService } from '@checkout-tests/services/cart-active.service.mock';
import { globalMessageServiceSpy } from '@checkout-tests/services/global-message.service.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { StoreModule } from '@ngrx/store';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CommandService, EventService, GlobalMessageService, GlobalMessageType, QueryService, UserIdService, WindowRef } from '@spartacus/core';
import { EMPTY, of, throwError } from 'rxjs';
import {
  CallbackTrigger,
  GooglePayMerchantConfiguration,
  GooglePayPaymentExpressIntents,
  GooglePayPaymentRequest,
  IntermediatePaymentData,
  PaymentAuthorizationResult,
  PaymentDataRequestUpdate,
  PlaceOrderResponse
} from '../../model/GooglePay';

import { CheckoutComGooglepayService } from './checkout-com-googlepay.service';
import createSpy = jasmine.createSpy;

class MockEventService implements Partial<EventService> {
  get = createSpy().and.returnValue(EMPTY);
  dispatch = createSpy();
}

const googlePayAuth: GooglePayPaymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const email = 'test@test.com';
const billingAddress = generateOneAddress();
const deliveryAddress = generateOneAddress();
const paymentRequest: GooglePayPaymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  paymentMethodData: {
    tokenizationData: { token: '{"fake": "tokenData"}' },
    info: { billingAddress }
  },
  shippingAddress: deliveryAddress,
  email
};

describe('CheckoutComGooglepayService', () => {
  let service: CheckoutComGooglepayService;
  let activeCartFacade: ActiveCartFacade;
  let userIdService: UserIdService;
  let commandService: CommandService;
  let globalMessageService: GlobalMessageService;
  let orderConnector: jasmine.SpyObj<CheckoutComGooglepayConnector>;
  let eventService: EventService;
  let queryService: QueryService;
  let windowRef: jasmine.SpyObj<WindowRef>;
  const userId = 'mockUserId';
  const cartId = 'cartId';
  let checkoutComPaymentService: jasmine.SpyObj<CheckoutComPaymentService>;
  let checkoutComPaymentConnector: jasmine.SpyObj<CheckoutComPaymentConnector>;

  const merchantConfiguration: GooglePayMerchantConfiguration = {
    'baseCardPaymentMethod': {
      'parameters': {
        'allowedAuthMethods': ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        'allowedCardNetworks': ['AMEX', 'DISCOVER', 'MASTERCARD', 'JCB', 'VISA', 'INTERAC'],
        'billingAddressParameters': {
          'format': 'FULL'
        },
        'billingAddressRequired': true
      },
      'type': 'CARD'
    },
    'clientSettings': {
      'environment': 'TEST'
    },
    'gateway': 'checkoutltd',
    'gatewayMerchantId': 'pk_test_c59321e8-953d-464d-bcfc-bb8785d05001',
    'merchantId': '01234567890123456789',
    'merchantName': 'e2yCheckoutCom',
    'transactionInfo': {
      'currencyCode': 'USD',
      'totalPrice': '16.99',
      'totalPriceStatus': 'FINAL'
    }
  };
  const checkoutComGooglepayConnectorSpy = jasmine.createSpyObj('CheckoutComGooglepayConnector', [
    'getGooglePayMerchantConfiguration',
    'authoriseGooglePayPayment',
    'setGooglePayDeliveryInfo'
  ]);
  const checkoutComPaymentServiceSpy = jasmine.createSpyObj('CheckoutComPaymentService', ['updatePaymentAddress']);
  const checkoutComPaymentConnectorSpy = jasmine.createSpyObj('CheckoutComPaymentConnector', ['placeOrder']);
  const windowRefSpy = jasmine.createSpyObj('WindowRef', [], {
    nativeWindow: {
      location: { href: '' },
      history: { back: jasmine.createSpy('back') },
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        CommandService,
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartService
        },
        {
          provide: GlobalMessageService,
          useValue: globalMessageServiceSpy
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: CheckoutComGooglepayConnector,
          useValue: checkoutComGooglepayConnectorSpy
        },
        {
          provide: CheckoutComPaymentService,
          useValue: checkoutComPaymentServiceSpy
        },
        {
          provide: CheckoutComPaymentConnector,
          useValue: checkoutComPaymentConnectorSpy
        },
        QueryService,
        CommandService
      ]
    });

    service = TestBed.inject(CheckoutComGooglepayService);
    orderConnector = TestBed.inject(CheckoutComGooglepayConnector) as jasmine.SpyObj<CheckoutComGooglepayConnector>;
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    globalMessageService = TestBed.inject(GlobalMessageService) as jasmine.SpyObj<GlobalMessageService>;
    userIdService = TestBed.inject(UserIdService);
    commandService = TestBed.inject(CommandService);
    orderConnector = TestBed.inject(CheckoutComGooglepayConnector) as jasmine.SpyObj<CheckoutComGooglepayConnector>;
    checkoutComPaymentService = TestBed.inject(CheckoutComPaymentService) as jasmine.SpyObj<CheckoutComPaymentService>;
    checkoutComPaymentConnector = TestBed.inject(CheckoutComPaymentConnector) as jasmine.SpyObj<CheckoutComPaymentConnector>;
    eventService = TestBed.inject(EventService);
    queryService = TestBed.inject(QueryService);
    windowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    // @ts-ignore
    spyOn(service, 'checkoutPreconditions').and.returnValue(of([userId, cartId]));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set Google Pay merchant configuration', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();

    service.setGooglePayMerchantConfiguration(merchantConfig);

    // @ts-ignore
    expect(service.googlePaySession$.getValue().googlePayMerchantConfiguration).toEqual(merchantConfig);
  });

  it('should update Google Pay merchant configuration while keeping other session data intact', () => {
    const initialSession = {
      googlePayMerchantConfiguration: null,
      googlePayAuth: {
        apiVersion: 2,
        apiVersionMinor: 0
      },
      googlePayPaymentDataUpdate: { newShippingOptionParameters: {} },
      googlePayPaymentAuthorizationResult: { transactionState: 'SUCCESS' }
    };
    // @ts-ignore
    service.googlePaySession$.next(initialSession);

    const newMerchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();

    service.setGooglePayMerchantConfiguration(newMerchantConfig);
    // @ts-ignore
    const updatedSession = service.googlePaySession$.getValue();
    expect(updatedSession.googlePayMerchantConfiguration).toEqual(newMerchantConfig);
    expect(updatedSession.googlePayAuth).toEqual(initialSession.googlePayAuth);
    expect(updatedSession.googlePayPaymentDataUpdate).toEqual(initialSession.googlePayPaymentDataUpdate);
    expect(updatedSession.googlePayPaymentAuthorizationResult).toEqual(initialSession.googlePayPaymentAuthorizationResult);
  });

  it('should set Google Pay auth in the session', () => {
    service.setGooglePayAuth(googlePayAuth);
    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayAuth).toEqual(googlePayAuth);
  });

  it('should update Google Pay auth while keeping other session data intact', () => {
    const initialSession = {
      googlePayAuth: null,
      googlePayMerchantConfiguration: { merchantName: 'Test Merchant' } as GooglePayMerchantConfiguration,
      googlePayPaymentDataUpdate: { newShippingOptionParameters: {} },
      googlePayPaymentAuthorizationResult: { transactionState: 'SUCCESS' }
    };
    //@ts-ignore
    service.googlePaySession$.next(initialSession);

    const newGooglePayAuth: GooglePayPaymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [],
    };

    service.setGooglePayAuth(newGooglePayAuth);
    //@ts-ignore
    const updatedSession = service.googlePaySession$.getValue();
    expect(updatedSession.googlePayAuth).toEqual(newGooglePayAuth);
    expect(updatedSession.googlePayMerchantConfiguration).toEqual(initialSession.googlePayMerchantConfiguration);
    expect(updatedSession.googlePayPaymentDataUpdate).toEqual(initialSession.googlePayPaymentDataUpdate);
    expect(updatedSession.googlePayPaymentAuthorizationResult).toEqual(initialSession.googlePayPaymentAuthorizationResult);
  });

  it('should set Google Pay payment data update in the session', () => {
    const paymentDataUpdate: PaymentDataRequestUpdate = { newShippingOptionParameters: {} };

    service.setGooglePayPaymentDataUpdate(paymentDataUpdate);

    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayPaymentDataUpdate).toEqual(paymentDataUpdate);
  });

  it('should update Google Pay payment data while keeping other session data intact', () => {
    const initialSession = {
      googlePayAuth: {
        apiVersion: 2,
        apiVersionMinor: 0
      },
      googlePayMerchantConfiguration: { merchantName: 'Test Merchant' } as GooglePayMerchantConfiguration,
      googlePayPaymentDataUpdate: null,
      googlePayPaymentAuthorizationResult: { transactionState: 'SUCCESS' }
    };
    //@ts-ignore
    service.googlePaySession$.next(initialSession);

    const newPaymentDataUpdate: PaymentDataRequestUpdate = { newShippingOptionParameters: {} };

    service.setGooglePayPaymentDataUpdate(newPaymentDataUpdate);

    //@ts-ignore
    const updatedSession = service.googlePaySession$.getValue();
    expect(updatedSession.googlePayPaymentDataUpdate).toEqual(newPaymentDataUpdate);
    expect(updatedSession.googlePayAuth).toEqual(initialSession.googlePayAuth);
    expect(updatedSession.googlePayMerchantConfiguration).toEqual(initialSession.googlePayMerchantConfiguration);
    expect(updatedSession.googlePayPaymentAuthorizationResult).toEqual(initialSession.googlePayPaymentAuthorizationResult);
  });

  it('should set Google Pay payment authorization result in the session', () => {
    const paymentAuthorizationResult: PaymentAuthorizationResult = { transactionState: 'SUCCESS' };

    service.setGooglePayPaymentAuthorizationResult(paymentAuthorizationResult);

    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayPaymentAuthorizationResult).toEqual(paymentAuthorizationResult);
  });

  it('should update Google Pay payment authorization result while keeping other session data intact', () => {
    const initialSession = {
      googlePayAuth: {
        apiVersion: 2,
        apiVersionMinor: 0
      },
      googlePayMerchantConfiguration: { merchantName: 'Test Merchant' } as GooglePayMerchantConfiguration,
      googlePayPaymentDataUpdate: { newShippingOptionParameters: {} },
      googlePayPaymentAuthorizationResult: null
    };
    //@ts-ignore
    service.googlePaySession$.next(initialSession);

    const newPaymentAuthorizationResult: PaymentAuthorizationResult = { transactionState: 'SUCCESS' };

    service.setGooglePayPaymentAuthorizationResult(newPaymentAuthorizationResult);

    //@ts-ignore
    const updatedSession = service.googlePaySession$.getValue();
    expect(updatedSession.googlePayPaymentAuthorizationResult).toEqual(newPaymentAuthorizationResult);
    expect(updatedSession.googlePayAuth).toEqual(initialSession.googlePayAuth);
    expect(updatedSession.googlePayMerchantConfiguration).toEqual(initialSession.googlePayMerchantConfiguration);
    expect(updatedSession.googlePayPaymentDataUpdate).toEqual(initialSession.googlePayPaymentDataUpdate);
  });

  it('should return the Google Pay merchant configuration from the state', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    service.setGooglePayMerchantConfiguration(merchantConfig);

    service.getMerchantConfigurationFromState().subscribe((config) => {
      expect(config).toEqual(merchantConfig);
    });
  });

  it('should return null if Google Pay merchant configuration is not set', () => {
    service.getMerchantConfigurationFromState().subscribe((config) => {
      expect(config).toBeNull();
    });
  });

  it('should request Google Pay merchant configuration successfully', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    checkoutComGooglepayConnectorSpy.getGooglePayMerchantConfiguration.and.returnValue(of(merchantConfig));
    service.requestMerchantConfiguration();
    expect(orderConnector.getGooglePayMerchantConfiguration).toHaveBeenCalledWith('mockUserId', 'cartId');
    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayMerchantConfiguration).toEqual(merchantConfig);
  });

  it('should authorize order successfully with valid payment request', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: '{"fake": "tokenData"}' }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const placeOrderResponse: PlaceOrderResponse = {
      orderData: { code: 'orderCode' },
      redirectUrl: null
    };
    orderConnector.authoriseGooglePayPayment.and.returnValue(of(placeOrderResponse));

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, paymentRequest.paymentMethodData.info.billingAddress, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'SUCCESS' });
  });

  it('should handle error when authorizing order', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: '{"fake": "tokenData"}' }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, paymentRequest.paymentMethodData.info.billingAddress, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should handle missing billing address in payment request', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: null },
        tokenizationData: { token: '{"fake": "tokenData"}' }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, null, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should handle missing token in payment request', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: null }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', null, paymentRequest.paymentMethodData.info.billingAddress, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should handle error when authorizing order', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: '{"fake": "tokenData"}' }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, paymentRequest.paymentMethodData.info.billingAddress, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should handle missing billing address in payment request', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: null },
        tokenizationData: { token: '{"fake": "tokenData"}' }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, null, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should handle missing token in payment request', () => {
    const paymentRequest: GooglePayPaymentRequest = {
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: null }
      },
      shippingAddress: generateOneAddress(),
      email: 'test@test.com'
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', null, paymentRequest.paymentMethodData.info.billingAddress, false, paymentRequest.shippingAddress, paymentRequest.email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(service['googlePaySession$'].getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should authorize Google Pay order successfully', () => {

    const placeOrderResponse: PlaceOrderResponse = {
      orderData: { code: 'orderCode' },
      redirectUrl: null
    };
    orderConnector.authoriseGooglePayPayment.and.returnValue(of(placeOrderResponse));

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, billingAddress, false, deliveryAddress, email
    );

    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'SUCCESS' });
  });

  it('should handle error when authorizing Google Pay order', () => {
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.authoriseOrder(paymentRequest, false);

    expect(orderConnector.authoriseGooglePayPayment).toHaveBeenCalledWith(
      'mockUserId', 'cartId', { fake: 'tokenData' }, billingAddress, false, deliveryAddress, email
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayPaymentAuthorizationResult).toEqual({ transactionState: 'ERROR' });
  });

  it('should update payment data successfully', () => {
    const paymentData: IntermediatePaymentData = { callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS };
    const paymentDataUpdate: PaymentDataRequestUpdate = { newShippingOptionParameters: {} };
    orderConnector.setGooglePayDeliveryInfo.and.returnValue(of(paymentDataUpdate));

    service.updatePaymentData(paymentData);

    expect(orderConnector.setGooglePayDeliveryInfo).toHaveBeenCalledWith('mockUserId', 'cartId', paymentData);
    //@ts-ignore
    expect(service.googlePaySession$.getValue().googlePayPaymentDataUpdate).toEqual(paymentDataUpdate);
  });

  it('should handle error when updating payment data', () => {
    const paymentData: IntermediatePaymentData = { callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS };
    const error = new Error('Update failed');
    orderConnector.setGooglePayDeliveryInfo.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    service.updatePaymentData(paymentData);

    expect(orderConnector.setGooglePayDeliveryInfo).toHaveBeenCalledWith('mockUserId', 'cartId', paymentData);
  });

  it('should create initial payment request with shipping address required', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    const result = service.createInitialPaymentRequest(merchantConfig, true);

    expect(result).toEqual({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [merchantConfig.baseCardPaymentMethod],
      shippingAddressRequired: true,
    });
  });

  it('should create initial payment request without shipping address required', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    const result = service.createInitialPaymentRequest(merchantConfig, false);

    expect(result).toEqual({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [merchantConfig.baseCardPaymentMethod],
      shippingAddressRequired: false,
    });
  });

  it('should create full payment request with valid merchant configuration', () => {
    const merchantConfig: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    const result = service.createFullPaymentRequest(merchantConfig);

    expect(result).toEqual({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          ...merchantConfig.baseCardPaymentMethod,
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: merchantConfig.gateway,
              gatewayMerchantId: merchantConfig.gatewayMerchantId
            }
          }
        }
      ],
      merchantInfo: {
        merchantName: merchantConfig.merchantName,
        merchantId: merchantConfig.merchantId
      },
      transactionInfo: {
        ...merchantConfig.transactionInfo,
      }
    });
  });

  it('should create full payment request with empty merchant name and id if not provided', () => {
    const merchantConfig: GooglePayMerchantConfiguration = {
      ...generateOneGooglePayMerchantConfiguration(),
      merchantName: undefined,
      merchantId: undefined
    };
    const result = service.createFullPaymentRequest(merchantConfig);

    expect(result.merchantInfo.merchantName).toBe('');
    expect(result.merchantInfo.merchantId).toBe('');
  });

  it('should add payment express intents with shipping address and option required', () => {
    const paymentRequest: GooglePayMerchantConfiguration = generateOneGooglePayMerchantConfiguration();
    const result = service.addPaymentExpressIntents(paymentRequest);

    expect(result).toEqual({
      ...paymentRequest,
      callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],
      shippingAddressRequired: true,
      emailRequired: true,
      shippingAddressParameters: {},
      shippingOptionRequired: true,
    });
  });

  it('should add payment express intents with empty shipping address parameters', () => {
    const paymentRequest: GooglePayPaymentExpressIntents = {
      ...generateOneGooglePayMerchantConfiguration(),
      shippingAddressParameters: undefined
    };
    const result = service.addPaymentExpressIntents(paymentRequest);

    expect(result.shippingAddressParameters).toEqual({});
  });

  it('should handle payment authorization successfully', async () => {
    orderConnector.authoriseGooglePayPayment.and.returnValue(of({
      redirectUrl: null,
      orderData: generateOrder()
    }));
    const paymentData: GooglePayPaymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: '{"token": "token"}' }
      }
    };
    const paymentAuthorizationResult: PaymentAuthorizationResult = { transactionState: 'SUCCESS' };
    service.setGooglePayPaymentAuthorizationResult(paymentAuthorizationResult);

    const result = await service.onPaymentAuthorized(paymentData);
    expect(result).toEqual({
      googlePayAuth: null,
      googlePayMerchantConfiguration: null,
      googlePayPaymentDataUpdate: null,
      googlePayPaymentAuthorizationResult: paymentAuthorizationResult
    });
  });

  it('should handle payment authorization with error', async () => {
    const paymentData: GooglePayPaymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      paymentMethodData: {
        info: { billingAddress: generateOneAddress() },
        tokenizationData: { token: '{"token": "token"}' }
      }
    };
    const error = new Error('Authorization failed');
    orderConnector.authoriseGooglePayPayment.and.returnValue(throwError(() => error));
    const consoleSpy = spyOn(console, 'error');

    try {
      await service.onPaymentAuthorized(paymentData);
    } catch (e) {
      expect(e).toEqual(error);
    }

    expect(consoleSpy).toHaveBeenCalledWith('Error authorising Google Pay payment', { error });
    expect(globalMessageService.add).toHaveBeenCalledWith({ key: 'paymentForm.googlepay.authorisationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
  });

  it('should update payment data successfully and resolve promise', async () => {
    const paymentData: IntermediatePaymentData = { callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS };
    const paymentDataUpdate: PaymentDataRequestUpdate = {
      newShippingOptionParameters: {
        shippingOptions: [
          {
            id: 'shippingOptionId',
            description: 'Shipping Option',
          },
          {
            id: 'shippingOptionId2',
            description: 'Shipping Option 2',
          }
        ]
      }
    };
    orderConnector.setGooglePayDeliveryInfo.and.returnValue(of(paymentDataUpdate));

    const result = await service.onPaymentDataChanged(paymentData);
    expect(result).toEqual(paymentDataUpdate);
  });

  it('should return Google Pay payment data update from state', (doneFn) => {
    const paymentDataUpdate: PaymentDataRequestUpdate = { newShippingOptionParameters: {} };
    service.setGooglePayPaymentDataUpdate(paymentDataUpdate);

    service.getGooglePayPaymentDataUpdateFromState().subscribe((update) => {
      expect(update).toEqual(paymentDataUpdate);
      doneFn();
    });
  });

  it('should return null if Google Pay payment data update is not set', (doneFn) => {
    service.getGooglePayPaymentDataUpdateFromState().subscribe((update) => {
      expect(update).toBeNull();
      doneFn();
    });
  });

  it('should update Google Pay payment data and return updated data', (doneFn) => {
    const paymentData: IntermediatePaymentData = { callbackTrigger: CallbackTrigger.SHIPPING_ADDRESS };
    const paymentDataUpdate: PaymentDataRequestUpdate = { newShippingOptionParameters: {} };
    orderConnector.setGooglePayDeliveryInfo.and.returnValue(of(paymentDataUpdate));

    service.updatePaymentData(paymentData).subscribe((update) => {
      expect(update).toEqual(paymentDataUpdate);
      doneFn();
    });
  });
});
