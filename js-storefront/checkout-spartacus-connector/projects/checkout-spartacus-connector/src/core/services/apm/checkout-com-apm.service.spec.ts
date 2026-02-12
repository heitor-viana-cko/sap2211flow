import { TestBed } from '@angular/core/testing';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { ApmData, PaymentType } from '@checkout-model/ApmData';
import { OccCmsComponentWithMedia } from '@checkout-model/ComponentData';
import { KlarnaInitParams } from '@checkout-model/Klarna';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { MockActiveCartFacade } from '@checkout-tests/services/cart-active.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressSetEvent, CheckoutPaymentDetailsCreatedEvent } from '@spartacus/checkout/base/root';
import {
  CmsService,
  CommandService,
  ConverterService,
  CurrencySetEvent,
  EventService,
  GlobalMessageService,
  LoginEvent, LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  PaymentDetails,
  QueryService,
  UserIdService
} from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { of, throwError } from 'rxjs';
import { CheckoutComApmService } from './checkout-com-apm.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('CheckoutComApmService', () => {
  let service: CheckoutComApmService;
  let userIdService: UserIdService;
  let activeCartFacade: ActiveCartFacade;
  let cmsService: jasmine.SpyObj<CmsService>;
  let convertService: ConverterService;
  let commandService: CommandService;
  let queryService: QueryService;
  let eventService: EventService;
  let checkoutComApmConnector: jasmine.SpyObj<CheckoutComApmConnector>;

  const userId = 'current';
  const cartId = '0000000';
  let mockComponent: OccCmsComponentWithMedia = {
    uid: 'component-uid',
    name: 'component-name'
  };

  beforeEach(() => {

    const cmsServiceSpy = jasmine.createSpyObj('CmsService', ['getComponentData']);

    const checkoutApmConnectorSpy = jasmine.createSpyObj('CheckoutComApmConnector', [
      'getAvailableApms',
      'requestAvailableApms',
      'createApmPaymentDetails'
    ]);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ActiveCartFacade,
          useClass: MockActiveCartFacade
        },
        {
          provide: UserIdService,
          useClass: MockUserIdService
        },
        {
          provide: CmsService,
          useValue: cmsServiceSpy
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        ConverterService,
        CommandService,
        QueryService,
        EventService,
        {
          provide: CheckoutComApmConnector,
          useValue: checkoutApmConnectorSpy
        },
      ]
    });

    service = TestBed.inject(CheckoutComApmService);

    activeCartFacade = TestBed.inject(ActiveCartFacade);
    userIdService = TestBed.inject(UserIdService);
    cmsService = TestBed.inject(CmsService) as jasmine.SpyObj<CmsService>;
    convertService = TestBed.inject(ConverterService);
    commandService = TestBed.inject(CommandService);
    queryService = TestBed.inject(QueryService);
    eventService = TestBed.inject(EventService);
    checkoutComApmConnector = TestBed.inject(CheckoutComApmConnector) as jasmine.SpyObj<CheckoutComApmConnector>;
    cmsService.getComponentData.and.returnValue(of(mockComponent));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestPaymentTypesQuery$', () => {
    it('should request available payment types successfully', (done) => {
      const apms: ApmData[] = [
        {
          code: PaymentType.iDeal,
          isRedirect: false,
          isUserDataRequired: true
        },
        {
          code: PaymentType.PayPal,
          isUserDataRequired: false
        },
        {
          code: PaymentType.Sepa,
          isRedirect: false,
          isUserDataRequired: true
        },
      ];
      checkoutComApmConnector.requestAvailableApms.and.returnValue(of(apms));

      service['requestPaymentTypesQuery$'].getState().subscribe((result) => {
        expect(result.data).toEqual(apms);
        done();
      });
    });

    it('should handle error when requesting available payment types', (done) => {
      const error = new Error('Request failed');
      checkoutComApmConnector.requestAvailableApms.and.returnValue(throwError(() => error));
      service['requestPaymentTypesQuery$'].getState().subscribe({
        next: (response) => {
          expect(response).toEqual({
            loading: false,
            error,
            data: undefined
          });
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should reload payment types query on specified events', () => {
      // @ts-ignore
      const reloadEvents = service.getPaymentTypesQueryReloadEvents();
      expect(reloadEvents).toContain(CurrencySetEvent);
      expect(reloadEvents).toContain(CheckoutDeliveryAddressSetEvent);
    });

    it('should reset payment types query on specified events', () => {
      // @ts-ignore
      const resetEvents = service.getPaymentTypesQueryResetEvents();
      expect(resetEvents).toContain(LoginEvent);
      expect(resetEvents).toContain(OrderPlacedEvent);
      expect(resetEvents).toContain(LogoutEvent);
    });
  });

  describe('createApmPaymentDetailsCommand', () => {
    it('should create APM payment details successfully', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = {
        type: PaymentType.Klarna,
        billingAddress: generateOneAddress()
      };
      const paymentDetails: PaymentDetails = {
        billingAddress: generateOneAddress(),
        id: '100',
        cardType: {
          code: PaymentType.Klarna,
          name: PaymentType.Klarna
        }
      };
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(of(paymentDetails));

      service.createApmPaymentDetails(apmPaymentDetails).subscribe((result) => {
        expect(result).toEqual(paymentDetails);
        done();
      });
    });

    it('should handle error when creating APM payment details', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = { /* mock data */ };
      const error = new Error('Creation failed');
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(throwError(() => error));

      service.createApmPaymentDetails(apmPaymentDetails).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should dispatch event after creating APM payment details', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = {
        type: PaymentType.Klarna,
        billingAddress: generateOneAddress()
      };
      const paymentDetails: PaymentDetails = {
        billingAddress: generateOneAddress(),
        id: '100',
        cardType: {
          code: PaymentType.Klarna,
          name: PaymentType.Klarna
        }
      };
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(of(paymentDetails));
      spyOn(eventService, 'dispatch').and.callThrough();

      service.createApmPaymentDetails(apmPaymentDetails).subscribe(() => {
        expect(eventService.dispatch).toHaveBeenCalledWith(
          jasmine.objectContaining({ paymentDetails: apmPaymentDetails }),
          CheckoutPaymentDetailsCreatedEvent
        );
        done();
      });
    });
  });

  describe('getApmByComponent', () => {
    it('should get APM by component successfully', (done) => {
      const componentUid = 'component-uid';
      const paymentType = PaymentType.PayPal;
      const apmData: ApmData = { code: paymentType, /* other properties */ };
      cmsService.getComponentData.and.returnValue(of(mockComponent));
      spyOn(convertService, 'pipeable').and.returnValue(() => of(apmData));

      service.getApmByComponent(componentUid, paymentType).subscribe((result) => {
        expect(result.code).toEqual(paymentType);
        done();
      });
    });

    it('should handle error when getting APM by component', (done) => {
      const componentUid = 'component-uid';
      const paymentType = PaymentType.PayPal;
      const error = new Error('Component data retrieval failed');
      cmsService.getComponentData.and.returnValue(throwError(() => error));

      service.getApmByComponent(componentUid, paymentType).subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('requestAvailableApms', () => {
    it('should request available APMs and return data successfully', (done) => {
      const apms: ApmData[] = [
        {
          code: PaymentType.iDeal,
          isRedirect: false,
          isUserDataRequired: true
        },
        {
          code: PaymentType.PayPal,
          isUserDataRequired: false
        },
        {
          code: PaymentType.Sepa,
          isRedirect: false,
          isUserDataRequired: true
        },
      ];
      checkoutComApmConnector.requestAvailableApms.and.returnValue(of(apms));

      service.requestAvailableApms().subscribe((result) => {
        expect(result.data).toEqual(apms);
        done();
      });
    });

    it('should handle error when requesting available APMs', (done) => {
      const error = new Error('Request failed');
      checkoutComApmConnector.requestAvailableApms.and.returnValue(throwError(() => error));

      service.requestAvailableApms().subscribe({
        next: (response) => {
          expect(response).toEqual({
            loading: false,
            error,
            data: undefined
          });
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('selectApm', () => {
    it('should select APM and update selectedApm$', (done) => {
      const apm: ApmData = {
        code: PaymentType.PayPal,
        isRedirect: false,
        isUserDataRequired: false
      };
      service.selectApm(apm);

      service.getSelectedApmFromState().subscribe((selectedApm) => {
        expect(selectedApm).toEqual(apm);
        done();
      });
    });
  });

  describe('getAvailableApmsFromState', () => {
    it('should return available APMs from state successfully', (done) => {
      const apms: ApmData[] = [
        {
          code: PaymentType.iDeal,
          isRedirect: false,
          isUserDataRequired: true
        },
        {
          code: PaymentType.PayPal,
          isUserDataRequired: false
        },
        {
          code: PaymentType.Sepa,
          isRedirect: false,
          isUserDataRequired: true
        },
      ];
      checkoutComApmConnector.requestAvailableApms.and.returnValue(of(apms));

      service.requestAvailableApms().subscribe();
      service.getAvailableApmsFromState().subscribe((result) => {
        expect(result).toEqual(apms);
        done();
      });
    });

    it('should handle error when retrieving available APMs from state', (done) => {
      const error = new Error('Request failed');
      checkoutComApmConnector.requestAvailableApms.and.returnValue(throwError(() => error));
      service.requestAvailableApms().subscribe();
      service.getAvailableApmsFromState().subscribe({
        next: (response) => {
          expect(response).toEqual(undefined);
          done();
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('getSelectedApmFromState', () => {
    it('should return the selected APM from state successfully', (done) => {
      const apm: ApmData = {
        code: PaymentType.PayPal,
        isRedirect: false,
        isUserDataRequired: false
      };
      service.selectApm(apm);

      service.getSelectedApmFromState().subscribe((selectedApm) => {
        expect(selectedApm).toEqual(apm);
        done();
      });
    });

    it('should return CARD if no APM is selected', (done) => {
      service.getSelectedApmFromState().subscribe((selectedApm) => {
        expect(selectedApm).toEqual({ code: PaymentType.Card });
        done();
      });
    });
  });

  describe('getIsApmLoadingFromState', () => {
    it('should return true if APMs are loading from state', (done) => {
      service['availableApms$'].next({
        loading: true,
        data: null,
        error: false
      });

      service.getIsApmLoadingFromState().subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
        done();
      });
    });

    it('should return false if APMs are not loading from state', (done) => {
      spyOn(service['requestPaymentTypesQuery$'], 'getState').and.returnValue(of({
        loading: false,
        data: null,
        error: false
      }));

      service.getIsApmLoadingFromState().subscribe((isLoading) => {
        expect(isLoading).toBeFalse();
        done();
      });
    });

    it('should handle error when retrieving APM loading state', (done) => {
      const error = new Error('Request failed');
      spyOn(service['requestPaymentTypesQuery$'], 'getState').and.returnValue(throwError(() => error));
      service.requestAvailableApms().subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createApmPaymentDetails', () => {
    it('should create APM payment details successfully', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = {
        type: PaymentType.Klarna,
        billingAddress: generateOneAddress()
      };
      const paymentDetails: PaymentDetails = {
        billingAddress: generateOneAddress(),
        id: '100',
        cardType: {
          code: PaymentType.Klarna,
          name: PaymentType.Klarna
        }
      };
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(of(paymentDetails));

      service.createApmPaymentDetails(apmPaymentDetails).subscribe((result) => {
        expect(result).toEqual(paymentDetails);
        done();
      });
    });

    it('should handle error when creating APM payment details', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = { /* mock data */ };
      const error = new Error('Creation failed');
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(throwError(() => error));

      service.createApmPaymentDetails(apmPaymentDetails).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should dispatch event after creating APM payment details', (done) => {
      const apmPaymentDetails: ApmPaymentDetails = {
        type: PaymentType.Klarna,
        billingAddress: generateOneAddress()
      };
      const paymentDetails: PaymentDetails = {
        billingAddress: generateOneAddress(),
        id: '100',
        cardType: {
          code: PaymentType.Klarna,
          name: PaymentType.Klarna
        }
      };
      checkoutComApmConnector.createApmPaymentDetails.and.returnValue(of(paymentDetails));
      spyOn(eventService, 'dispatch').and.callThrough();

      service.createApmPaymentDetails(apmPaymentDetails).subscribe(() => {
        expect(eventService.dispatch).toHaveBeenCalledWith(
          jasmine.objectContaining({ paymentDetails: apmPaymentDetails }),
          CheckoutPaymentDetailsCreatedEvent
        );
        done();
      });
    });
  });

  describe('getKlarnaInitParams', () => {
    it('should retrieve Klarna initialization parameters successfully', (done) => {
      const klarnaInitParams: KlarnaInitParams = { clientToken: 'test_token' };
      spyOn(service['getKlarnaInitParamsQuery$'], 'get').and.returnValue(of(klarnaInitParams));

      service.getKlarnaInitParams().subscribe((result) => {
        expect(result).toEqual(klarnaInitParams);
        done();
      });
    });

    it('should handle error when Klarna initialization parameters contain httpError', (done) => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({ error: 'Error occurred' });
      spyOn(service['getKlarnaInitParamsQuery$'], 'get').and.returnValue(of(errorResponse));

      service.getKlarnaInitParams().subscribe({
        next: (err) => {
          expect(err).toEqual(errorResponse);
          done();
        },
      });
    });
  });

  describe('getPaymentTypesQueryReloadEvents', () => {
    it('should return correct reload events for payment types query', () => {
      const reloadEvents = service['getPaymentTypesQueryReloadEvents']();
      expect(reloadEvents).toContain(CurrencySetEvent);
      expect(reloadEvents).toContain(CheckoutDeliveryAddressSetEvent);
    });
  });

  describe('getPaymentTypesQueryReloadEvents', () => {
    it('should return correct reset events for payment types query', () => {
      const resetEvents = service['getPaymentTypesQueryResetEvents']();
      expect(resetEvents).toContain(LoginEvent);
      expect(resetEvents).toContain(OrderPlacedEvent);
      expect(resetEvents).toContain(LogoutEvent);
    });
  });

  describe('checkoutPreconditions', () => {
    it('should return userId and cartId when checkout conditions are met', (done) => {
      spyOn(service['userIdService'], 'takeUserId').and.returnValue(of('user123'));
      spyOn(service['activeCartFacade'], 'takeActiveCartId').and.returnValue(of('cart123'));
      spyOn(service['activeCartFacade'], 'isGuestCart').and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe(([userId, cartId]) => {
        expect(userId).toBe('user123');
        expect(cartId).toBe('cart123');
        done();
      });
    });

    it('should throw error when userId is not available', (done) => {
      spyOn(service['userIdService'], 'takeUserId').and.returnValue(of(null));
      spyOn(service['activeCartFacade'], 'takeActiveCartId').and.returnValue(of('cart123'));
      spyOn(service['activeCartFacade'], 'isGuestCart').and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should throw error when cartId is not available', (done) => {
      spyOn(service['userIdService'], 'takeUserId').and.returnValue(of('user123'));
      spyOn(service['activeCartFacade'], 'takeActiveCartId').and.returnValue(of(null));
      spyOn(service['activeCartFacade'], 'isGuestCart').and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should throw error when userId is anonymous and cart is not guest', (done) => {
      spyOn(userIdService, 'takeUserId').and.returnValue(of(OCC_USER_ID_ANONYMOUS));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of('cart123'));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(false));

      service['checkoutPreconditions']().subscribe({
        next: () => {
          fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toBe('Checkout conditions not met');
          done();
        }
      });
    });

    it('should return userId and cartId when userId is anonymous and cart is guest', (done) => {
      spyOn(userIdService, 'takeUserId').and.returnValue(of(OCC_USER_ID_ANONYMOUS));
      spyOn(activeCartFacade, 'takeActiveCartId').and.returnValue(of('cart123'));
      spyOn(activeCartFacade, 'isGuestCart').and.returnValue(of(true));

      service['checkoutPreconditions']().subscribe(([userId, cartId]) => {
        expect(userId).toBe(OCC_USER_ID_ANONYMOUS);
        expect(cartId).toBe('cart123');
        done();
      });
    });
  });
});
