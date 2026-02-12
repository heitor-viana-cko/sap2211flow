import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComApplepayFacade } from '@checkout-facades/checkout-com-applepay.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { ApplePayPaymentRequest, ApplepaySession, ApplePayShippingContactUpdate } from '@checkout-model/ApplePay';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { MockActiveCartService } from '@checkout-tests/services/cart-active.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { GlobalMessageService, RoutingService, UserIdService, WindowRef } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { of } from 'rxjs';
import { CheckoutComExpressApplepayComponent } from './checkout-com-express-applepay.component';
import createSpy = jasmine.createSpy;

const order: Order = generateOrder();
const mockApplePayRequest: ApplePayPaymentRequest = {
  countryCode: 'US',
  currencyCode: 'USD',
  requiredBillingContactFields: [
    'postal'
  ],
  total: {
    amount: '123.00',
    label: 'Beans with toast',
    type: 'FINAL'
  },
  supportedNetworks: [],
  merchantCapabilities: []
};
const mockSession: ApplepaySession = {
  applePayMerchantSession: 'mockSession'
};
const mockUpdate: ApplePayShippingContactUpdate = { newShippingMethods: [] };
const mockAuthorization = {
  status: 'SUCCESS',
  orderData: { code: '100' }
};
const mockApplePaySession = {
  STATUS_SUCCESS: 'SUCCESS',
  STATUS_FAILURE: 'FAILURE',
  completePayment: jasmine.createSpy(),
  completeMerchantValidation: jasmine.createSpy(),
  completeShippingContactSelection: jasmine.createSpy(),
  completeShippingMethodSelection: jasmine.createSpy(),
};

class MockOrderFacade implements Partial<CheckoutComOrderFacade> {
  getOrderDetails = createSpy().and.returnValue(
    of({
      entries: [
        {
          entryNumber: 1,
          quantity: 1,
        },
      ],
    })
  );

  clearPlacedOrder() {
  }

  placeOrder() {
    return of(order);
  }

  setPlacedOrder() {

  }
}

class MockRoutingService {
  go(): void {
  }

  getRouterState() {
    return of({});
  }
}

describe('CheckoutComExpressApplepayComponent', () => {
  let component: CheckoutComExpressApplepayComponent;
  let fixture: ComponentFixture<CheckoutComExpressApplepayComponent>;

  let userIdService: jasmine.SpyObj<UserIdService>;
  let activeCartService: ActiveCartService;
  let orderFacade: CheckoutComOrderFacade;
  let routingService: jasmine.SpyObj<RoutingService>;
  let windowRef: WindowRef;
  let globalMessageService: GlobalMessageService;
  let checkoutComApplepayFacade: jasmine.SpyObj<CheckoutComApplepayFacade>;

  beforeEach(async () => {
    const userIdServiceSpy = jasmine.createSpyObj('UserIdService', ['takeUserId']);
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
      declarations: [CheckoutComExpressApplepayComponent],
      providers: [
        WindowRef,
        {
          provide: UserIdService,
          useValue: userIdServiceSpy
        },
        {
          provide: ActiveCartService,
          useValue: MockActiveCartService
        },
        {
          provide: CheckoutComOrderFacade,
          useClass: MockOrderFacade
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService,
        },
        {
          provide: CheckoutComApplepayFacade,
          useValue: checkoutComApplepayFacadeSpy
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComExpressApplepayComponent);
    component = fixture.componentInstance;
    userIdService = TestBed.inject(UserIdService) as jasmine.SpyObj<UserIdService>;
    activeCartService = TestBed.inject(ActiveCartService);
    orderFacade = TestBed.inject(CheckoutComOrderFacade);
    routingService = TestBed.inject(RoutingService) as jasmine.SpyObj<RoutingService>;
    windowRef = TestBed.inject(WindowRef);
    globalMessageService = TestBed.inject(GlobalMessageService);
    checkoutComApplepayFacade = TestBed.inject(CheckoutComApplepayFacade) as jasmine.SpyObj<CheckoutComApplepayFacade>;
    checkoutComApplepayFacade.getPaymentRequestFromState.and.returnValue(of(mockApplePayRequest));
    checkoutComApplepayFacade.getMerchantSessionFromState.and.returnValue(of(mockSession));
    checkoutComApplepayFacade.getDeliveryAddressUpdateFromState.and.returnValue(of(mockUpdate));
    checkoutComApplepayFacade.getDeliveryMethodUpdateFromState.and.returnValue(of(mockUpdate));
    checkoutComApplepayFacade.getPaymentAuthorizationFromState.and.returnValue(of(mockAuthorization));
    checkoutComApplepayFacade.createSession.and.returnValue(mockApplePaySession);

    spyOn(component, 'createApplepaySession').and.returnValue(mockApplePaySession);
    // @ts-ignore
    component.applePaySession = mockApplePaySession;
    component.getPaymentAuthorization();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onExpressClick', () => {
    it('should emit buttonApplePayClicked event when expressCheckout is true', () => {
      spyOn(component.buttonApplePayClicked, 'emit');
      component.expressCheckout = true;

      component.onExpressClick();

      expect(component.buttonApplePayClicked.emit).toHaveBeenCalledWith(true);

    });

    it('should call placeApplePayOrder when expressCheckout is true', () => {
      spyOn(component, 'placeApplePayOrder');
      component.expressCheckout = true;

      component.onExpressClick();

      expect(component.placeApplePayOrder).toHaveBeenCalled();
    });

    it('should call placeApplePayOrder when expressCheckout is false', () => {
      spyOn(component, 'placeApplePayOrder');
      component.expressCheckout = false;

      component.onExpressClick();

      expect(component.placeApplePayOrder).toHaveBeenCalled();
    });
  });

  describe('modifyPaymentRequest', () => {
    it('should add required shipping contact fields to payment request', () => {
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD'
      };
      const modifiedRequest = component['modifyPaymentRequest'](paymentRequest);

      expect(modifiedRequest.requiredShippingContactFields).toEqual(['postalAddress', 'name', 'email']);
    });

    it('should retain existing fields in payment request', () => {
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD'
      };
      const modifiedRequest = component['modifyPaymentRequest'](paymentRequest);

      expect(modifiedRequest.countryCode).toBe('US');
      expect(modifiedRequest.currencyCode).toBe('USD');
    });

    it('should override existing requiredShippingContactFields in payment request', () => {
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        requiredShippingContactFields: ['phone']
      };
      const modifiedRequest = component['modifyPaymentRequest'](paymentRequest);

      expect(modifiedRequest.requiredShippingContactFields).toEqual(['postalAddress', 'name', 'email']);
    });

    it('should handle empty payment request', () => {
      const paymentRequest: ApplePayPaymentRequest = {};
      const modifiedRequest = component['modifyPaymentRequest'](paymentRequest);

      expect(modifiedRequest.requiredShippingContactFields).toEqual(['postalAddress', 'name', 'email']);
    });
  });
});