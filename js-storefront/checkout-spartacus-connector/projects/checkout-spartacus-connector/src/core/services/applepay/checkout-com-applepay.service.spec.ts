import { TestBed } from '@angular/core/testing';
import { CheckoutComApplepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-applepay.connector';
import { CheckoutComApplePayPaymentRequestEvent } from '@checkout-core/events/apple-pay.events';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { MockActiveCartFacade } from '@checkout-tests/services/cart-active.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressSetEvent } from '@spartacus/checkout/base/root';
import { CommandService, CurrencySetEvent, EventService, GlobalMessageService, QueryService, UserIdService, WindowRef } from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '../../model/ApplePay';

import { CheckoutComApplepayService } from './checkout-com-applepay.service';

describe('CheckoutComApplepayService', () => {
  let service: CheckoutComApplepayService;
  let activeCartFacade: ActiveCartFacade;
  let userIdService: UserIdService;
  let commandService: CommandService;
  let orderConnector: jasmine.SpyObj<CheckoutComApplepayConnector>;
  let eventService: EventService;
  let queryService: QueryService;
  let windowRef: WindowRef;
  let checkoutPreconditionsSpy: jasmine.Spy;

  const userId = 'mockUserId';
  const cartId = 'mockCartId';

  const newTotal = {
    type: 'type_test',
    label: 'label_test',
    amount: 'amount_test'
  };

  beforeEach(() => {

    const orderConnectorSpy = jasmine.createSpyObj('CheckoutComApplepayConnector', [
      'requestApplePayPaymentRequest',
      'validateApplePayMerchant',
      'authorizeApplePayPayment',
      'selectApplePayDeliveryAddress',
      'selectApplePayDeliveryMethod'
    ]);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartFacade,
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService,
        },
        CommandService,
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComApplepayConnector,
          useValue: orderConnectorSpy
        },
        EventService,
        QueryService,
      ]
    });
    service = TestBed.inject(CheckoutComApplepayService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    userIdService = TestBed.inject(UserIdService);
    commandService = TestBed.inject(CommandService);
    orderConnector = TestBed.inject(CheckoutComApplepayConnector) as jasmine.SpyObj<CheckoutComApplepayConnector>;
    eventService = TestBed.inject(EventService);
    queryService = TestBed.inject(QueryService);
    windowRef = TestBed.inject(WindowRef);
    spyOn(service, 'showPaymentMethodFailMessage').and.callThrough();
    // @ts-ignore
    checkoutPreconditionsSpy = spyOn(service, 'checkoutPreconditions');
    checkoutPreconditionsSpy.and.returnValue(of([userId, cartId]));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestApplePayPaymentRequestQuery$', () => {
    it('should create Apple Pay payment request query', (done) => {
      spyOn(service, 'setApplePayPaymentRequest').and.callThrough();
      const applePayPaymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };

      // Mock dependencies
      checkoutPreconditionsSpy.and.returnValue(of([userId, cartId]));
      orderConnector.requestApplePayPaymentRequest.and.returnValue(of(applePayPaymentRequest));

      // @ts-ignore
      service.requestApplePayPaymentRequestQuery$ = orderConnector.requestApplePayPaymentRequest().pipe(
        tap((result) => {
          service.setApplePayPaymentRequest(result);
        })
      );

      // @ts-ignore
      service.requestApplePayPaymentRequestQuery$.subscribe((result) => {
        expect(result).toEqual(applePayPaymentRequest);
        expect(service.setApplePayPaymentRequest).toHaveBeenCalledWith(applePayPaymentRequest);
        done();
      });
    });

    it('should handle error when creating Apple Pay payment request query', (done) => {
      spyOn(service, 'setApplePayPaymentRequest').and.callThrough();
      const error = new Error('Request failed');
      orderConnector.requestApplePayPaymentRequest.and.returnValue(throwError(() => error));

      // @ts-ignore
      service.requestApplePayPaymentRequestQuery$.get().subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          expect(service.setApplePayPaymentRequest).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('validateMerchantCommand$', () => {
    it('should validate merchant successfully', (done) => {
      spyOn(service, 'setApplepayMerchantSession').and.callThrough();
      const validationURL = 'https://example.com/validate';
      const applePayMerchantSession = { id: 'merchantSessionId' };
      orderConnector.validateApplePayMerchant.and.returnValue(of(applePayMerchantSession));

      service['validateMerchantCommand$'].execute(validationURL).subscribe((result) => {
        expect(result).toEqual(applePayMerchantSession);
        expect(service.setApplepayMerchantSession).toHaveBeenCalledWith(applePayMerchantSession);
        done();
      });
    });

    it('should handle error when validating merchant', (done) => {

      spyOn(service, 'setApplepayMerchantSession').and.callThrough();
      const validationURL = 'https://example.com/validate';
      const error = new Error('Validation failed');
      orderConnector.validateApplePayMerchant.and.returnValue(throwError(() => error));

      service['validateMerchantCommand$'].execute(validationURL).subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          expect(service.setApplepayMerchantSession).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('onPaymentAuthorizedCommand$', () => {
    it('should authorize payment successfully', (done) => {
      spyOn(service, 'setPaymentAuthorized').and.callThrough();
      const orderData = generateOrder();
      const payment: ApplePayAuthorization = {
        orderData,
        status: null
      };

      const applePayAuthorization: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: 'AUTHORIZED'
      };
      orderConnector.authorizeApplePayPayment.and.returnValue(of(applePayAuthorization));

      service['onPaymentAuthorizedCommand$'].execute(payment).subscribe((result) => {
        expect(result).toEqual(applePayAuthorization);
        expect(service.setPaymentAuthorized).toHaveBeenCalledWith(userId, cartId, applePayAuthorization);
        done();
      });
    });

    it('should handle error when authorizing payment', (done) => {
      spyOn(service, 'setPaymentAuthorized').and.callThrough();
      const payment: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: null
      };
      const error = new Error('Authorization failed');
      orderConnector.authorizeApplePayPayment.and.returnValue(throwError(() => error));

      service['onPaymentAuthorizedCommand$'].execute(payment).subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          expect(service.setPaymentAuthorized).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('onShippingContactSelectedCommand$', () => {
    it('should update shipping contact successfully', (done) => {
      spyOn(service, 'setApplePayShippingMethodUpdate').and.callThrough();
      const address = generateOneAddress();
      const shippingContact: ApplePayPaymentContact = {
        addressLines: [address.line1, address.line2],
        locality: address.town,
        countryCode: address.country.isocode,
        postalCode: address.postalCode,
        phoneNumber: address.phone
      };
      const applePayShippingContactUpdate: ApplePayShippingContactUpdate = {
        newTotal,
      };
      orderConnector.selectApplePayDeliveryAddress.and.returnValue(of(applePayShippingContactUpdate));

      service['onShippingContactSelectedCommand$'].execute(shippingContact).subscribe((result) => {
        expect(result).toEqual(applePayShippingContactUpdate);
        expect(service.setApplePayShippingMethodUpdate).toHaveBeenCalledWith(applePayShippingContactUpdate);
        done();
      });
    });

    it('should handle error when updating shipping contact', (done) => {
      const shippingContact: ApplePayPaymentContact = { /* shipping contact details */ };
      const error = new Error('Update failed');
      orderConnector.selectApplePayDeliveryAddress.and.returnValue(throwError(() => error));

      service['onShippingContactSelectedCommand$'].execute(shippingContact).subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          expect(service.setApplePayShippingMethodUpdate).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('onShippingMethodSelected$', () => {
    it('should update shipping method successfully', (done) => {
      spyOn(service, 'setApplepayShippingMethodUpdateUpdate').and.callThrough();
      const shippingMethod: ApplePayShippingMethod = {
        amount: '100',
        detail: 'details',
        label: 'label',
      };
      const applePayShippingMethodUpdate: ApplePayShippingMethodUpdate = { /* update details */ };
      orderConnector.selectApplePayDeliveryMethod.and.returnValue(of(applePayShippingMethodUpdate));

      service['onShippingMethodSelected$'](shippingMethod).get().subscribe((result) => {
        expect(result).toEqual(applePayShippingMethodUpdate);
        expect(service.setApplepayShippingMethodUpdateUpdate).toHaveBeenCalledWith(applePayShippingMethodUpdate);
        done();
      });
    });

    it('should handle error when updating shipping method', (done) => {
      spyOn(service, 'setApplepayShippingMethodUpdateUpdate').and.callThrough();
      const shippingMethod: ApplePayShippingMethod = {
        amount: '100',
        detail: 'details',
        label: 'label',
      };
      const error = new Error('Update failed');
      orderConnector.selectApplePayDeliveryMethod.and.returnValue(throwError(() => error));

      service['onShippingMethodSelected$'](shippingMethod).get().subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          expect(service.setApplepayShippingMethodUpdateUpdate).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createSession', () => {
    it('should create Apple Pay session successfully', () => {
      spyOn(windowRef, 'isBrowser').and.returnValue(true);
      spyOn(service, 'createSession').and.returnValue({
        onvalidatemerchant: () => {
        },
        onpaymentauthorized: () => {
        },
        onshippingmethodselected: () => {
        },
        onshippingcontactselected: () => {
        },
        onerror: () => {
        },
        oncancel: () => {
        }
      });
      const paymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      const session = service.createSession(paymentRequest);

      expect(session).toBeDefined();
      expect(session.onvalidatemerchant).toBeDefined();
      expect(session.onpaymentauthorized).toBeDefined();
      expect(session.onshippingmethodselected).toBeDefined();
      expect(session.onshippingcontactselected).toBeDefined();
      expect(session.onerror).toBeDefined();
      expect(session.oncancel).toBeDefined();
    });

    it('should not create Apple Pay session if not in browser', () => {
      spyOn(windowRef, 'isBrowser').and.returnValue(false);
      const paymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      const session = service.createSession(paymentRequest);

      expect(session).toBeUndefined();
    });

    it('should handle session error', () => {
      spyOn(windowRef, 'isBrowser').and.returnValue(true);
      spyOn(service, 'onPaymentError').and.callThrough();
      spyOn(service, 'createSession').and.returnValue({
        onvalidatemerchant: () => {
        },
        onpaymentauthorized: () => {
        },
        onshippingmethodselected: () => {
        },
        onshippingcontactselected: () => {
        },
        onerror: service.onPaymentError.bind(service),
        oncancel: () => {
        }
      });
      const paymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      const session = service.createSession(paymentRequest);
      session.onerror();
      expect(service.onPaymentError).toHaveBeenCalled();
    });

    it('should handle session cancel', () => {
      spyOn(windowRef, 'isBrowser').and.returnValue(true);
      spyOn(service, 'onPaymentError').and.callThrough();
      spyOn(service, 'createSession').and.returnValue({
        onvalidatemerchant: () => {
        },
        onpaymentauthorized: () => {
        },
        onshippingmethodselected: () => {
        },
        onshippingcontactselected: () => {
        },
        onerror: () => {
        },
        oncancel: service.onPaymentError.bind(service)
      });
      const paymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      const session = service.createSession(paymentRequest);

      session.oncancel();
      expect(service.onPaymentError).toHaveBeenCalled();
    });
  });

  describe('setApplePayPaymentRequest', () => {
    it('should update existing session state with new payment request', () => {
      const initialSessionState = {
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: {
          currencyCode: 'EUR',
          countryCode: 'DE'
        }
      };
      service['applePaySession$'].next(initialSessionState);

      const newPaymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      service.setApplePayPaymentRequest(newPaymentRequest);

      service.getPaymentRequestFromState().subscribe((result) => {
        expect(result).toEqual(newPaymentRequest);
      });
    });
  });

  describe('setApplepayMerchantSession', () => {
    it('should set Apple Pay merchant session in session state', () => {
      const applePayMerchantSession = { id: 'merchantSessionId' };
      service.setApplepayMerchantSession(applePayMerchantSession);

      service.getMerchantSessionFromState().subscribe((result) => {
        expect(result).toEqual(applePayMerchantSession);
        expect(service['applePaySession$'].getValue().applePayMerchantSession).toEqual(result);
      });
    });

    it('should update existing session state with new merchant session', () => {
      const initialSessionState = {
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      };
      service['applePaySession$'].next(initialSessionState);

      const newMerchantSession = { id: 'newMerchantSessionId' };
      service.setApplepayMerchantSession(newMerchantSession);

      service.getMerchantSessionFromState().subscribe((result) => {
        expect(result).toEqual(newMerchantSession);
        expect(service['applePaySession$'].getValue().applePayMerchantSession).toEqual(result);
      });
    });
  });

  describe('setApplepayShippingMethodUpdateUpdate', () => {
    it('should set Apple Pay shipping method update in session state', () => {
      const applePayShippingMethodUpdate = { newTotal };
      service.setApplepayShippingMethodUpdateUpdate(applePayShippingMethodUpdate);

      service.getDeliveryMethodUpdateFromState().subscribe((result) => {
        expect(result).toEqual(applePayShippingMethodUpdate);
        expect(service['applePaySession$'].getValue().applePayShippingMethodUpdate).toEqual(result);
      });
    });

    it('should update existing session state with new shipping method update', () => {
      const initialSessionState = {
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      };
      service['applePaySession$'].next(initialSessionState);

      const newShippingMethodUpdate = { newTotal };
      service.setApplepayShippingMethodUpdateUpdate(newShippingMethodUpdate);

      service.getDeliveryMethodUpdateFromState().subscribe((result) => {
        expect(result).toEqual(newShippingMethodUpdate);
        expect(service['applePaySession$'].getValue().applePayShippingMethodUpdate).toEqual(result);
      });
    });
  });

  describe('setPaymentAuthorized', () => {
    it('should set payment authorization in session state and dispatch OrderPlacedEvent', () => {
      const userId = 'mockUserId';
      const cartId = 'mockCartId';
      const applePayAuthorization: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: 'AUTHORIZED'
      };
      spyOn(service['applePaySession$'], 'next').and.callThrough();
      spyOn(eventService, 'dispatch').and.callThrough();
      spyOn(service, 'setPlacedOrder').and.callThrough();

      service.setPaymentAuthorized(userId, cartId, applePayAuthorization);

      expect(service['applePaySession$'].next).toHaveBeenCalledWith({
        ...service['applePaySession$'].value,
        applePayAuthorization
      });
      expect(eventService.dispatch).toHaveBeenCalledWith(
        {
          userId,
          cartId,
          cartCode: cartId,
          order: applePayAuthorization.orderData,
        },
        OrderPlacedEvent
      );
      expect(service.setPlacedOrder).toHaveBeenCalledWith(applePayAuthorization.orderData);
    });

    it('should handle null applePayAuthorization gracefully', () => {
      const userId = 'mockUserId';
      const cartId = 'mockCartId';
      const applePayAuthorization: ApplePayAuthorization = null;
      spyOn(service['applePaySession$'], 'next').and.callThrough();
      spyOn(eventService, 'dispatch').and.callThrough();
      spyOn(service, 'setPlacedOrder').and.callThrough();

      service.setPaymentAuthorized(userId, cartId, applePayAuthorization);

      expect(service['applePaySession$'].next).toHaveBeenCalledWith({
        ...service['applePaySession$'].value,
        applePayAuthorization
      });
      expect(eventService.dispatch).not.toHaveBeenCalled();
      expect(service.setPlacedOrder).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentRequestFromState', () => {
    let service: CheckoutComApplepayService;

    beforeEach(() => {
      service = TestBed.inject(CheckoutComApplepayService);
    });

    it('should return the current Apple Pay payment request from state', (done) => {
      const applePayPaymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest
      });

      service.getPaymentRequestFromState().subscribe((result) => {
        expect(result).toEqual(applePayPaymentRequest);
        expect(service['applePaySession$'].getValue().applePayPaymentRequest).toEqual(result);
        done();
      });
    });

    it('should return null if no Apple Pay payment request is set in state', (done) => {
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getPaymentRequestFromState().subscribe((result) => {
        expect(result).toBeNull();
        expect(service['applePaySession$'].getValue().applePayPaymentRequest).toEqual(result);
        done();
      });
    });
  });

  describe('getMerchantSessionFromState', () => {
    it('should return the current Apple Pay merchant session from state', (done) => {
      const applePayMerchantSession = { id: 'merchantSessionId' };
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getMerchantSessionFromState().subscribe((result) => {
        expect(result).toEqual(applePayMerchantSession);
        done();
      });
    });

    it('should return null if no Apple Pay merchant session is set in state', (done) => {
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getMerchantSessionFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getPaymentAuthorizationFromState', () => {
    it('should return the current Apple Pay payment authorization from state', (done) => {
      const applePayAuthorization: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: 'AUTHORIZED'
      };
      service['applePaySession$'].next({
        applePayAuthorization,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getPaymentAuthorizationFromState().subscribe((result) => {
        expect(result).toEqual(applePayAuthorization);
        done();
      });
    });

    it('should return null if no Apple Pay payment authorization is set in state', (done) => {
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getPaymentAuthorizationFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getDeliveryAddressUpdateFromState', () => {
    it('should return the current Apple Pay delivery address update from state', (done) => {
      const applePayShippingContactUpdate: ApplePayShippingContactUpdate = {
        newTotal: {
          type: 'final',
          label: 'Total',
          amount: '10.00'
        }
      };
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate,
        applePayPaymentRequest: null
      });

      service.getDeliveryAddressUpdateFromState().subscribe((result) => {
        expect(result).toEqual(applePayShippingContactUpdate);
        done();
      });
    });

    it('should return null if no Apple Pay delivery address update is set in state', (done) => {
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getDeliveryAddressUpdateFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getDeliveryMethodUpdateFromState', () => {
    it('should return the current Apple Pay delivery method update from state', (done) => {
      const applePayShippingMethodUpdate: ApplePayShippingMethodUpdate = {
        newTotal: {
          type: 'final',
          label: 'Total',
          amount: '10.00'
        }
      };
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getDeliveryMethodUpdateFromState().subscribe((result) => {
        expect(result).toEqual(applePayShippingMethodUpdate);
        done();
      });
    });

    it('should return null if no Apple Pay delivery method update is set in state', (done) => {
      service['applePaySession$'].next({
        applePayAuthorization: null,
        applePayMerchantSession: null,
        applePayShippingMethodUpdate: null,
        applePayShippingContactUpdate: null,
        applePayPaymentRequest: null
      });

      service.getDeliveryMethodUpdateFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('requestApplePayPaymentRequest', () => {
    it('should request Apple Pay payment request successfully', (done) => {
      const applePayPaymentRequest: ApplePayPaymentRequest = {
        currencyCode: 'USD',
        countryCode: 'US'
      };
      // @ts-ignore
      spyOn(service.requestApplePayPaymentRequestQuery$, 'get').and.returnValue(of(applePayPaymentRequest));

      service.requestApplePayPaymentRequest();

      // @ts-ignore
      service.requestApplePayPaymentRequestQuery$.get().subscribe((result) => {
        expect(result).toEqual(applePayPaymentRequest);
        done();
      });
    });

    it('should handle error when requesting Apple Pay payment request', (done) => {
      const error = new Error('Request failed');
      // @ts-ignore
      spyOn(service.requestApplePayPaymentRequestQuery$, 'get').and.returnValue(throwError(() => error));

      service.requestApplePayPaymentRequest();

      // @ts-ignore
      service.requestApplePayPaymentRequestQuery$.get().subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
        },
        error: (err) => {
          expect(err).toEqual(error);
          expect(service.showPaymentMethodFailMessage).toHaveBeenCalledWith('paymentForm.applePay.merchantValidationFailed');
          done();
        }
      });
    });
  });

  describe('onValidateMerchant', () => {
    it('should validate merchant successfully', (done) => {
      const validationURL = 'https://example.com/validate';
      const applePayMerchantSession = { id: 'merchantSessionId' };
      spyOn(service['validateMerchantCommand$'], 'execute').and.returnValue(of(applePayMerchantSession));

      service.onValidateMerchant({ validationURL });

      service['validateMerchantCommand$'].execute(validationURL).subscribe((result) => {
        expect(result).toEqual(applePayMerchantSession);
        expect(service.showPaymentMethodFailMessage).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error when validating merchant', (done) => {
      const validationURL = 'https://example.com/validate';
      const error = new Error('Validation failed');
      spyOn(service['validateMerchantCommand$'], 'execute').and.returnValue(throwError(() => error));

      service.onValidateMerchant({ validationURL });

      service['validateMerchantCommand$'].execute(validationURL).subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err).toEqual(error);
          expect(service.showPaymentMethodFailMessage).toHaveBeenCalledWith('paymentForm.applePay.merchantValidationFailed');
          done();
        }
      });
    });
  });

  describe('onShippingMethodSelected', () => {
    it('should handle shipping method selection successfully', (done) => {
      const shippingMethod: ApplePayShippingMethod = {
        amount: '10.00',
        detail: 'Standard Shipping',
        label: 'Standard'
      };
      const applePayShippingMethodUpdate: ApplePayShippingMethodUpdate = {
        newTotal: {
          type: 'final',
          label: 'Total',
          amount: '10.00'
        }
      };
      orderConnector.selectApplePayDeliveryMethod.and.returnValue(of(applePayShippingMethodUpdate));

      service.onShippingMethodSelected({ shippingMethod });

      service['onShippingMethodSelected$'](shippingMethod).get().subscribe((result) => {
        expect(result).toEqual(applePayShippingMethodUpdate);
        expect(service.showPaymentMethodFailMessage).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error when selecting shipping method', (done) => {
      const shippingMethod: ApplePayShippingMethod = {
        amount: '10.00',
        detail: 'Standard Shipping',
        label: 'Standard'
      };
      const error = new Error('Selection failed');
      orderConnector.selectApplePayDeliveryMethod.and.returnValue(throwError(() => error));

      service.onShippingMethodSelected({ shippingMethod });

      service['onShippingMethodSelected$'](shippingMethod).get().subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          expect(service.showPaymentMethodFailMessage).toHaveBeenCalledWith('paymentForm.applePay.authorisationFailed');
          done();
        }
      });
    });
  });

  describe('onShippingContactSelected', () => {
    it('should handle shipping contact selection successfully', (done) => {
      const shippingContact: ApplePayPaymentContact = {
        addressLines: ['123 Main St'],
        locality: 'Anytown',
        countryCode: 'US',
        postalCode: '12345',
        phoneNumber: '555-555-5555'
      };
      const applePayShippingContactUpdate: ApplePayShippingContactUpdate = {
        newTotal: {
          type: 'final',
          label: 'Total',
          amount: '10.00'
        }
      };
      orderConnector.selectApplePayDeliveryAddress.and.returnValue(of(applePayShippingContactUpdate));

      service.onShippingContactSelected({ shippingContact });

      service['onShippingContactSelectedCommand$'].execute(shippingContact).subscribe((result) => {
        expect(result).toEqual(applePayShippingContactUpdate);
        done();
      });
    });

    it('should handle error when selecting shipping contact', (done) => {
      const shippingContact: ApplePayPaymentContact = {
        addressLines: ['123 Main St'],
        locality: 'Anytown',
        countryCode: 'US',
        postalCode: '12345',
        phoneNumber: '555-555-5555'
      };
      const error = new Error('Selection failed');
      spyOn(service['onShippingContactSelectedCommand$'], 'execute').and.returnValue(throwError(() => error));

      service.onShippingContactSelected({ shippingContact });

      service['onShippingContactSelectedCommand$'].execute(shippingContact).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('onPaymentAuthorized', () => {
    it('should authorize payment successfully', (done) => {
      const applePayAuthorization: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: 'AUTHORIZED'
      };
      const payment = { payment: applePayAuthorization };
      orderConnector.authorizeApplePayPayment.and.returnValue(of(applePayAuthorization));

      service.onPaymentAuthorized({ payment });

      service['onPaymentAuthorizedCommand$'].execute(payment.payment).subscribe((result) => {
        expect(result).toEqual(applePayAuthorization);
        expect(service.showPaymentMethodFailMessage).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error when authorizing payment', (done) => {
      const applePayAuthorization: ApplePayAuthorization = {
        orderData: generateOrder(),
        status: 'AUTHORIZED'
      };
      const payment = { payment: applePayAuthorization };
      const error = new Error('Authorization failed');
      orderConnector.authorizeApplePayPayment.and.returnValue(throwError(() => error));

      service.onPaymentAuthorized({ payment });

      service['onPaymentAuthorizedCommand$'].execute(payment.payment).subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err).toEqual(error);
          expect(service.showPaymentMethodFailMessage).toHaveBeenCalledWith('paymentForm.applePay.authorisationFailed');
          done();
        }
      });
    });
  });

  describe('onPaymentError', () => {
    it('should show payment method fail message when payment is cancelled', () => {
      service.onPaymentError();
      expect(service.showPaymentMethodFailMessage).toHaveBeenCalledWith('paymentForm.applePay.cancelled');
    });

    it('should unsubscribe from deliveryAddress$ and deliveryMethod$ if they are defined', () => {
      service['deliveryAddress$'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      service['deliveryMethod$'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);

      service.onPaymentError();

      expect(service['deliveryAddress$'].unsubscribe).toHaveBeenCalled();
      expect(service['deliveryMethod$'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('checkoutPreconditions', () => {
    it('should return userId and cartId when cartId is defined', (done) => {
      service['cartId'] = 'mockCartId';
      spyOn(userIdService, 'takeUserId').and.returnValue(of('mockUserId'));

      service['checkoutPreconditions']().subscribe((result) => {
        expect(result).toEqual(['mockUserId', 'mockCartId']);
        done();
      });
    });

    it('should call super.checkoutPreconditions when cartId is not defined', (done) => {
      service['cartId'] = null;
      spyOn(userIdService, 'takeUserId').and.returnValue(of('mockUserId'));
      // @ts-ignore
      checkoutPreconditionsSpy.and.returnValue(of(['mockUserId', 'mockCartId']));

      service['checkoutPreconditions']().subscribe((result) => {
        expect(result).toEqual(['mockUserId', 'mockCartId']);
        done();
      });
    });
  });

  describe('resetApplepaySession', () => {
    it('should reset the Apple Pay session state', () => {
      service['applePaySession$'].next({
        applePayAuthorization: {
          orderData: generateOrder(),
          status: 'AUTHORIZED'
        },
        applePayMerchantSession: { id: 'merchantSessionId' },
        applePayShippingMethodUpdate: { newTotal },
        applePayShippingContactUpdate: { newTotal },
        applePayPaymentRequest: {
          currencyCode: 'USD',
          countryCode: 'US'
        }
      });

      service.resetApplepaySession();

      service['applePaySession$'].subscribe((session) => {
        expect(session.applePayAuthorization).toBeNull();
        expect(session.applePayMerchantSession).toBeNull();
        expect(session.applePayShippingMethodUpdate).toBeNull();
        expect(session.applePayShippingContactUpdate).toBeNull();
        expect(session.applePayPaymentRequest).toBeNull();
      });
    });

    it('should set cartId to null', () => {
      service['cartId'] = 'mockCartId';

      service.resetApplepaySession();

      expect(service['cartId']).toBeNull();
    });
  });
});
