import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComApmApplepayComponent } from '@checkout-components/checkout-com-apm-component/checkout-com-apm-applepay/checkout-com-apm-applepay.component';
import { CheckoutComApplepayFacade } from '@checkout-facades/checkout-com-applepay.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { ApplePayPaymentRequest, ApplepaySession, ApplePayShippingContactUpdate, ApplePayShippingMethodUpdate } from '@checkout-model/ApplePay';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { GlobalMessageService, GlobalMessageType, I18nTestingModule, RoutingService, UserIdService, WindowRef } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { FormErrorsModule } from '@spartacus/storefront';
import { of, throwError } from 'rxjs';

const mockSession: ApplepaySession = {
  applePayMerchantSession: 'mockSession'
};

const mockApplePayPaymentRequest: ApplePayPaymentRequest = {
  countryCode: 'US',
  currencyCode: 'USD'
};

describe('CheckoutComApmApplepayComponent', () => {
  let component: CheckoutComApmApplepayComponent;
  let fixture: ComponentFixture<CheckoutComApmApplepayComponent>;
  let userIdService: jasmine.SpyObj<UserIdService>;
  let activeCartService: jasmine.SpyObj<ActiveCartService>;
  let orderFacade: jasmine.SpyObj<CheckoutComOrderFacade>;
  let routingService: jasmine.SpyObj<RoutingService>;
  let windowRef: jasmine.SpyObj<WindowRef>;
  let checkoutComApplepayFacade: jasmine.SpyObj<CheckoutComApplepayFacade>;
  let globalMessageService: GlobalMessageService;

  beforeEach(async () => {
    const userIdServiceSpy = jasmine.createSpyObj('UserIdService', ['getUserId']);
    const activeCartServiceSpy = jasmine.createSpyObj('ActiveCartService', ['getActiveCartId']);
    const orderFacadeSpy = jasmine.createSpyObj('CheckoutComOrderFacade', ['getOrderDetails', 'setPlacedOrder']);
    const routingServiceSpy = jasmine.createSpyObj('RoutingService', ['go']);
    const windowRefSpy = jasmine.createSpyObj('WindowRef', ['nativeWindow']);
    const checkoutComApplepayFacadeSpy = jasmine.createSpyObj('CheckoutComApplepayFacade', [
      'createSession',
      'getPaymentRequestFromState',
      'getMerchantSessionFromState',
      'getDeliveryAddressUpdateFromState',
      'getDeliveryMethodUpdateFromState',
      'getPaymentAuthorizationFromState',
      'resetApplepaySession'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComApmApplepayComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormErrorsModule,
        I18nTestingModule,
      ],
      providers: [
        {
          provide: UserIdService,
          useValue: userIdServiceSpy
        },
        {
          provide: ActiveCartService,
          useValue: activeCartServiceSpy
        },
        {
          provide: CheckoutComOrderFacade,
          useValue: orderFacadeSpy
        },
        {
          provide: RoutingService,
          useValue: routingServiceSpy
        },
        {
          provide: WindowRef,
          useValue: windowRefSpy
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComApplepayFacade,
          useValue: checkoutComApplepayFacadeSpy
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmApplepayComponent);
    component = fixture.componentInstance;
    userIdService = TestBed.inject(UserIdService) as jasmine.SpyObj<UserIdService>;
    activeCartService = TestBed.inject(ActiveCartService) as jasmine.SpyObj<ActiveCartService>;
    orderFacade = TestBed.inject(CheckoutComOrderFacade) as jasmine.SpyObj<CheckoutComOrderFacade>;
    routingService = TestBed.inject(RoutingService) as jasmine.SpyObj<RoutingService>;
    windowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    checkoutComApplepayFacade = TestBed.inject(CheckoutComApplepayFacade) as jasmine.SpyObj<CheckoutComApplepayFacade>;
    globalMessageService = TestBed.inject(GlobalMessageService);
    spyOn(component['logger'], 'error');
  });

  it('should place Apple Pay order when getCardId is called', () => {
    spyOn(component, 'placeApplePayOrder');

    component.getCardId();

    expect(component.placeApplePayOrder).toHaveBeenCalled();
  });

  describe('getPaymentRequest', () => {
    it('should retrieve and modify payment request, then create Apple Pay session', () => {
      //@ts-ignore
      spyOn(component, 'modifyPaymentRequest').and.returnValue(mockApplePayPaymentRequest);
      checkoutComApplepayFacade.getPaymentRequestFromState.and.returnValue(of(mockApplePayPaymentRequest));
      checkoutComApplepayFacade.createSession.and.returnValue({});

      component.getPaymentRequest();

      //@ts-ignore
      expect(component.modifyPaymentRequest).toHaveBeenCalledWith(mockApplePayPaymentRequest);
      expect(checkoutComApplepayFacade.createSession).toHaveBeenCalledWith(mockApplePayPaymentRequest);
    });

    it('should log error if payment request retrieval fails', () => {
      const error = new Error('Error');
      checkoutComApplepayFacade.getPaymentRequestFromState.and.returnValue(throwError(() => error));

      component.getPaymentRequest();

      expect(component['logger'].error).toHaveBeenCalledWith('placeApplePayOrder err', { error });
    });
  });

  describe('getMerchantSessionFromState', () => {
    it('should complete merchant validation successfully', () => {

      checkoutComApplepayFacade.getMerchantSessionFromState.and.returnValue(of(mockSession));
      // @ts-ignore
      component.applePaySession = { completeMerchantValidation: jasmine.createSpy() };

      component.getMerchantSessionFromState();
      // @ts-ignore
      expect(component.applePaySession.completeMerchantValidation).toHaveBeenCalledWith(mockSession);
    });

    it('should log error if merchant validation fails', () => {
      const error = new Error('Error');
      checkoutComApplepayFacade.getMerchantSessionFromState.and.returnValue(throwError(() => error));

      component.getMerchantSessionFromState();

      expect(component['logger'].error).toHaveBeenCalledWith('merchant session with error', { error });
    });
  });

  describe('getDeliveryAddressUpdate', () => {
    it('should complete shipping contact selection successfully', () => {
      const mockUpdate: ApplePayShippingContactUpdate = { newShippingMethods: [] };
      checkoutComApplepayFacade.getDeliveryAddressUpdateFromState.and.returnValue(of(mockUpdate));
      // @ts-ignore
      component.applePaySession = { completeShippingContactSelection: jasmine.createSpy() };

      component.getDeliveryAddressUpdate();
      // @ts-ignore
      expect(component.applePaySession.completeShippingContactSelection).toHaveBeenCalledWith(mockUpdate);
    });

    it('should log error if shipping contact selection fails', () => {
      const error = new Error('Error');
      checkoutComApplepayFacade.getDeliveryAddressUpdateFromState.and.returnValue(throwError(() => error));

      component.getDeliveryAddressUpdate();

      expect(component['logger'].error).toHaveBeenCalledWith('delivery address update with error', { error });
    });
  });

  describe('getDeliveryMethodUpdate', () => {
    it('should complete shipping method selection successfully', () => {
      const mockUpdate: ApplePayShippingMethodUpdate = {
        newTotal: {
          type: 'test',
          label: 'label',
          amount: '100'
        },
        newLineItems: [{
          type: 'test1',
          label: 'label2',
          amount: '100'
        }]
      };
      checkoutComApplepayFacade.getDeliveryMethodUpdateFromState.and.returnValue(of(mockUpdate));
      // @ts-ignore
      component.applePaySession = { completeShippingMethodSelection: jasmine.createSpy() };

      component.getDeliveryMethodUpdate();
      // @ts-ignore
      expect(component.applePaySession.completeShippingMethodSelection).toHaveBeenCalledWith(mockUpdate);
    });

    it('should log error if shipping method selection fails', () => {
      const error = new Error('Error');
      checkoutComApplepayFacade.getDeliveryMethodUpdateFromState.and.returnValue(throwError(() => error));

      component.getDeliveryMethodUpdate();

      expect(component['logger'].error).toHaveBeenCalledWith('delivery method update with error', { error });
    });
  });

  describe('getPaymentAuthorization', () => {
    it('should complete payment successfully', () => {
      const mockAuthorization = {
        status: 'SUCCESS',
        orderData: { code: '100' }
      };
      const mockApplePaySession = {
        STATUS_SUCCESS: 'SUCCESS',
        STATUS_FAILURE: 'FAILURE',
        completePayment: jasmine.createSpy()
      };
      spyOn(component, 'createApplepaySession').and.returnValue(mockApplePaySession);
      checkoutComApplepayFacade.getPaymentAuthorizationFromState.and.returnValue(of(mockAuthorization));
      // @ts-ignore
      component.applePaySession = mockApplePaySession;

      component.getPaymentAuthorization();

      expect(mockApplePaySession.completePayment).toHaveBeenCalledWith({ status: 'SUCCESS' });
      expect(checkoutComApplepayFacade.resetApplepaySession).toHaveBeenCalled();
      expect(orderFacade.setPlacedOrder).toHaveBeenCalledWith(mockAuthorization.orderData);
    });

    it('should return a failed session', () => {
      const mockAuthorization = { status: 'FAILURE' };
      const mockApplePaySession = {
        STATUS_SUCCESS: 'SUCCESS',
        STATUS_FAILURE: 'FAILURE',
        completePayment: jasmine.createSpy()
      };
      spyOn(component, 'createApplepaySession').and.returnValue(mockApplePaySession);
      checkoutComApplepayFacade.getPaymentAuthorizationFromState.and.returnValue(of(mockAuthorization));
      // @ts-ignore
      component.applePaySession = mockApplePaySession;

      component.getPaymentAuthorization();
      expect(mockApplePaySession.completePayment).toHaveBeenCalledWith({ status: 'FAILURE' });
      expect(orderFacade.setPlacedOrder).not.toHaveBeenCalled();
    });

    it('should log error if payment authorization fails', () => {
      const error = new Error('Error');
      checkoutComApplepayFacade.getPaymentAuthorizationFromState.and.returnValue(throwError(() => error));

      component.getPaymentAuthorization();

      expect(component['logger'].error).toHaveBeenCalledWith('payment authorization with error', { error });
    });
  });

  describe('getOrderDetails', () => {
    it('should navigate to order confirmation page if order details are retrieved', () => {
      const mockOrder: Order = { code: '123' };
      orderFacade.getOrderDetails.and.returnValue(of(mockOrder));

      component.getOrderDetails();

      expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'orderConfirmation' });
    });

    it('should log error if retrieving order details fails', () => {
      const error = new Error('Error');
      orderFacade.getOrderDetails.and.returnValue(throwError(() => error));

      component.getOrderDetails();

      expect(component['logger'].error).toHaveBeenCalledWith('return to order confirmation with errors', { error });
    });
  });

  describe('placeApplePayOrder', () => {
    it('should call all necessary methods to place Apple Pay order', () => {
      spyOn(component, 'getPaymentRequest');
      spyOn(component, 'getMerchantSessionFromState');
      spyOn(component, 'getDeliveryAddressUpdate');
      spyOn(component, 'getDeliveryMethodUpdate');
      spyOn(component, 'getPaymentAuthorization');
      spyOn(component, 'getOrderDetails');

      component.placeApplePayOrder();

      expect(component.getPaymentRequest).toHaveBeenCalled();
      expect(component.getMerchantSessionFromState).toHaveBeenCalled();
      expect(component.getDeliveryAddressUpdate).toHaveBeenCalled();
      expect(component.getDeliveryMethodUpdate).toHaveBeenCalled();
      expect(component.getPaymentAuthorization).toHaveBeenCalled();
      expect(component.getOrderDetails).toHaveBeenCalled();
    });
  });

  describe('modifyPaymentRequest', () => {
    it('should return the same payment request object', () => {
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD'
      };

      // @ts-ignore
      const result = component.modifyPaymentRequest(paymentRequest);

      expect(result).toBe(paymentRequest);
    });

    it('should handle empty payment request object', () => {
      const paymentRequest: ApplePayPaymentRequest = {};

      // @ts-ignore
      const result = component.modifyPaymentRequest(paymentRequest);

      expect(result).toBe(paymentRequest);
    });
  });

  describe('showErrors', () => {
    it('should display error message when info is provided', () => {
      const info = 'Error occurred';

      component.showErrors(info);

      expect(globalMessageService.add).toHaveBeenCalledWith(info, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should display error message when info is not provided', () => {
      component.showErrors();

      expect(globalMessageService.add).toHaveBeenCalledWith(undefined, GlobalMessageType.MSG_TYPE_ERROR);
    });
  });
});