import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComCustomerConfiguration, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { MockCheckoutComPaymentConnector } from '@checkout-tests/connectors/checkout-com-payment-connector.mock';
import { MockActiveCartService } from '@checkout-tests/services/cart-active.service.mock';
import { MockCheckoutQueryFacade } from '@checkout-tests/services/checkout-query.mock';
import { MockEventService } from '@checkout-tests/services/event-service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockUserIdService } from '@checkout-tests/services/user.service.mock';
import { EnvironmentUnion } from '@checkout.com/checkout-web-components';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutPaymentDetailsSetEvent, CheckoutQueryFacade, CheckoutState } from '@spartacus/checkout/base/root';
import {
  Address,
  CommandService,
  EventService,
  GlobalMessageService,
  LoadUserPaymentMethodsEvent,
  OCC_USER_ID_ANONYMOUS,
  QueryService,
  QueryState,
  UserIdService
} from '@spartacus/core';
import { of, throwError } from 'rxjs';
import { CheckoutComPaymentService } from './checkout-com-payment.service';

const mockUserId = 'mockUserId';
const mockPaymentInfo: CheckoutComPaymentDetails = {
  id: 'mockPaymentId',
  cardBin: 'xxxx',
  accountHolderName: 'Erik Slagter',
  cardNumber: '4242424242424242',
  cvn: '100',
  expiryYear: '2022',
  expiryMonth: '12'
};
const merchantConfiguration: CheckoutComCustomerConfiguration = {
  publicKey: 'pk_1234123121',
  environment: 'sandbox' as EnvironmentUnion
};

describe('CheckoutComPaymentService', () => {
  let service: CheckoutComPaymentService;
  let activeCartFacade: ActiveCartFacade;
  let userIdService: UserIdService;
  let queryService: QueryService;
  let commandService: CommandService;
  let eventService: EventService;
  let checkoutPaymentConnector: CheckoutComPaymentConnector;
  let checkoutQueryFacade: CheckoutQueryFacade;
  let globalMessageService: GlobalMessageService;
  let checkoutComConnector: jasmine.SpyObj<CheckoutComConnector>;
  let checkoutApmConnector: CheckoutComApmConnector;
  let checkoutPaymentConnectorCreatePaymentDetailsSpy: jasmine.Spy;
  let checkoutPaymentConnectorUpdatePaymentDetailsSpy: jasmine.Spy;
  beforeEach(() => {
    const checkoutComPaymentConnectorSpy = jasmine.createSpyObj('CheckoutComPaymentConnector', [
      'createPaymentDetails',
      'getPaymentDetails',
      'updatePaymentDetails',
      'getPaymentCardTypes'
    ]);
    // const checkoutQueryFacadeSpy = jasmine.createSpyObj('CheckoutQueryFacade', ['getCheckoutDetailsState']);
    const checkoutComConnectorSpy = jasmine.createSpyObj('CheckoutComConnector', [
      'getMerchantKey',
      'getIsABC'
    ]);
    const checkoutApmConnectorSpy = jasmine.createSpyObj('CheckoutComApmConnector', ['getApmPaymentMethods']);
    TestBed.configureTestingModule({
      imports: [],
      providers: [
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
          useValue: checkoutComConnectorSpy
        },
        {
          provide: CheckoutComApmConnector,
          useValue: checkoutApmConnectorSpy
        }
      ]
    });

    service = TestBed.inject(CheckoutComPaymentService);
    activeCartFacade = TestBed.inject(ActiveCartFacade);
    queryService = TestBed.inject(QueryService);
    commandService = TestBed.inject(CommandService);
    eventService = TestBed.inject(EventService);
    checkoutPaymentConnector = TestBed.inject(CheckoutComPaymentConnector);
    checkoutQueryFacade = TestBed.inject(CheckoutQueryFacade);
    globalMessageService = TestBed.inject(GlobalMessageService);
    checkoutComConnector = TestBed.inject(CheckoutComConnector) as jasmine.SpyObj<CheckoutComConnector>;
    checkoutApmConnector = TestBed.inject(CheckoutComApmConnector);
    userIdService = TestBed.inject(UserIdService);

    checkoutPaymentConnectorCreatePaymentDetailsSpy = spyOn(checkoutPaymentConnector, 'createPaymentDetails');
    checkoutPaymentConnectorUpdatePaymentDetailsSpy = spyOn(checkoutPaymentConnector, 'updatePaymentDetails');
    const mockHttpResponse: HttpResponse<void> = new HttpResponse<void>({
      status: 204,
      statusText: 'No Content'
    });
    checkoutPaymentConnectorUpdatePaymentDetailsSpy.and.returnValue(of(mockHttpResponse));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createPaymentMethodCommand', () => {
    it('should retrieve OCC IsABC flag from state', (done) => {
      const isABC = true;
      checkoutComConnector.getIsABC.and.returnValue(of(isABC));

      service.getIsABCFromState().subscribe((flag) => {
        expect(flag).toEqual(isABC);
        done();
      });
    });

    it('should handle error when retrieving OCC IsABC flag', (done) => {
      const error = new Error('Error');
      checkoutComConnector.getIsABC.and.returnValue(throwError(() => error));

      service.getIsABCFromState().subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should create payment details and return created details', (done) => {
      checkoutPaymentConnectorCreatePaymentDetailsSpy.and.returnValue(of(mockPaymentInfo));

      service.createPaymentDetails(mockPaymentInfo).subscribe((details) => {
        expect(details).toEqual(mockPaymentInfo);
        done();
      });
    });

    it('should update payment details and return updated details', () => {
      service.updatePaymentDetails(mockPaymentInfo).subscribe((details) => {
        expect(details.status).toBe(204);
        expect(details.body).toBeNull();
      });
    });

    it('should handle error when updating payment details', (done) => {
      const error = new Error('Error');
      checkoutPaymentConnectorUpdatePaymentDetailsSpy.and.returnValue(throwError(() => error));

      service.updatePaymentDetails(mockPaymentInfo).subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('setPaymentAddressCommand', () => {
    it('should retrieve OCC merchant key from state', (done) => {
      checkoutComConnector.getMerchantKey.and.returnValue(of(JSON.stringify(merchantConfiguration)));

      service.getOccMerchantKeyFromState().subscribe((merchant) => {
        expect(merchant).toEqual(merchantConfiguration.publicKey);
        done();
      });
    });

    it('should handle error when retrieving OCC merchant key', (done) => {
      const error = new Error('Error');
      checkoutComConnector.getMerchantKey.and.returnValue(throwError(() => error));

      service.getOccMerchantKeyFromState().subscribe({
        next: (response) => {
          expect(response).toBe(null);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should return payment details from state', (done) => {
      service['paymentDetails$'].next(mockPaymentInfo);

      service.getPaymentDetailsFromState().subscribe((details) => {
        expect(details).toEqual(mockPaymentInfo);
        done();
      });
    });

    it('should return null if payment details are not set', (done) => {
      service['paymentDetails$'].next(null);

      service.getPaymentDetailsFromState().subscribe((details) => {
        expect(details).toBeNull();
        done();
      });
    });

    it('should update payment address and return updated address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      spyOn(checkoutPaymentConnector, 'setPaymentAddress').and.returnValue(of(address));

      service.updatePaymentAddress(address).subscribe((updatedAddress) => {
        expect(updatedAddress).toEqual(address);
        done();
      });
    });

    it('should handle error when updating payment address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const error = new Error('Error');
      spyOn(checkoutPaymentConnector, 'setPaymentAddress').and.returnValue(throwError(() => error));

      service.updatePaymentAddress(address).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('updatePaymentDetailsCommand', () => {
    it('should update payment details and return updated details', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: 'mockPaymentId' };
      service['updatePaymentDetailsCommand'].execute(paymentDetails).subscribe((details) => {
        expect(details.status).toBe(204);
        expect(details.body).toBeNull();
        done();
      });
    });

    it('should handle error when updating payment details', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: 'mockPaymentId' };
      const error = new Error('Error');
      checkoutPaymentConnectorUpdatePaymentDetailsSpy.and.returnValue(throwError(() => error));

      service['updatePaymentDetailsCommand'].execute(paymentDetails).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should dispatch events when updating payment details', (done) => {
      checkoutPaymentConnectorUpdatePaymentDetailsSpy.and.returnValue(of(mockPaymentInfo));

      service['updatePaymentDetailsCommand'].execute(mockPaymentInfo).subscribe(() => {
        expect(service['eventService'].dispatch).toHaveBeenCalledWith(
          {
            userId: mockUserId,
            paymentDetailsId: mockPaymentInfo.id
          },
          CheckoutPaymentDetailsSetEvent
        );
        expect(service['eventService'].dispatch).toHaveBeenCalledWith(
          { userId: mockUserId },
          LoadUserPaymentMethodsEvent
        );
        done();
      });
    });
  });

  describe('requestOccMerchantConfigurationQuery$', () => {
    it('should retrieve OCC merchant key and update state', (done) => {
      checkoutComConnector.getMerchantKey.and.returnValue(of(JSON.stringify(merchantConfiguration)));

      service['requestOccMerchantConfigurationQuery$'].get().subscribe((merchantConfig) => {
        expect(merchantConfig).toEqual(JSON.stringify(merchantConfiguration));
        expect(service['occMerchantKey$'].getValue()).toEqual(merchantConfiguration.publicKey);
        done();
      });
    });

    it('should handle error when retrieving OCC merchant key', (done) => {
      const error = new Error('Error');
      checkoutComConnector.getMerchantKey.and.returnValue(throwError(() => error));

      service['requestOccMerchantConfigurationQuery$'].get().subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          expect(service['occMerchantKey$'].getValue()).toBeNull();
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          expect(service['occMerchantKey$'].getValue()).toBeNull();
          done();
        }
      });
    });
  });

  describe('getIsABCQuery$', () => {
    it('should retrieve OCC IsABC flag and update state', (done) => {
      const isABC = true;
      checkoutComConnector.getIsABC.and.returnValue(of(isABC));

      service['getIsABCQuery$'].get().subscribe((flag) => {
        expect(flag).toEqual(isABC);
        expect(service['isABC$'].getValue()).toEqual(true);
        done();
      });
    });

    it('should handle error when retrieving OCC IsABC flag', (done) => {
      const error = new Error('Error');
      checkoutComConnector.getIsABC.and.returnValue(throwError(() => error));

      service['getIsABCQuery$'].get().subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          expect(service['isABC$'].getValue()).toBeFalse();
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          expect(service['isABC$'].getValue()).toBeFalse();
          done();
        }
      });
    });
  });

  describe('getOccMerchantKeyFromState', () => {
    it('should return the merchant key when it is available in the state', (done) => {
      const mockMerchantKey = 'mock-merchant-key';
      service['occMerchantKey$'].next(mockMerchantKey);

      service.getOccMerchantKeyFromState().subscribe((merchantKey) => {
        expect(merchantKey).toBe(mockMerchantKey);
        done();
      });
    });

    it('should return null when the merchant key is not set in the state', (done) => {
      service['occMerchantKey$'].next(null);

      service.getOccMerchantKeyFromState().subscribe((merchantKey) => {
        expect(merchantKey).toBeNull();
        done();
      });
    });

    it('should handle errors when requesting the merchant configuration', (done) => {
      const error = new Error('Error retrieving merchant configuration');
      spyOn(service, 'requestOccMerchantConfiguration').and.returnValue(throwError(() => error));

      service.getOccMerchantKeyFromState().subscribe({
        next: () => {
          fail('Expected an error, but got a value');
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('requestOccMerchantConfiguration', () => {
    it('should retrieve OCC merchant key successfully', (done) => {

      checkoutComConnector.getMerchantKey.and.returnValue(of(JSON.stringify(merchantConfiguration)));

      service.requestOccMerchantConfiguration().subscribe((merchantConfig) => {
        expect(merchantConfig).toEqual(JSON.stringify(merchantConfiguration));
        done();
      });
    });

    it('should handle error when retrieving OCC merchant key', (done) => {
      const error = new Error('Error');
      checkoutComConnector.getMerchantKey.and.returnValue(throwError(() => error));

      service.requestOccMerchantConfiguration().subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('canSaveCard', () => {
    it('should return true if user is not anonymous', () => {
      const userId = 'currentUser';
      expect(service.canSaveCard(userId)).toBeTrue();
    });

    it('should return false if user is anonymous', () => {
      const userId = OCC_USER_ID_ANONYMOUS;
      expect(service.canSaveCard(userId)).toBeFalse();
    });
  });

  describe('getPaymentDetailsFromState', () => {
    it('should return payment details from state', (done) => {
      service['paymentDetails$'].next(mockPaymentInfo);

      service.getPaymentDetailsFromState().subscribe((details) => {
        expect(details).toEqual(mockPaymentInfo);
        done();
      });
    });

    it('should return null if payment details are not set', (done) => {
      service['paymentDetails$'].next(null);

      service.getPaymentDetailsFromState().subscribe((details) => {
        expect(details).toBeNull();
        done();
      });
    });
  });

  describe('createPaymentDetails', () => {
    it('should create payment details and return created details', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: 'mockPaymentId' };
      checkoutPaymentConnectorCreatePaymentDetailsSpy.and.returnValue(of(paymentDetails));

      service.createPaymentDetails(paymentDetails).subscribe((details) => {
        expect(details).toEqual(paymentDetails);
        done();
      });
    });

    it('should handle error when creating payment details', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: 'mockPaymentId' };
      const error = new Error('Error');
      checkoutPaymentConnectorCreatePaymentDetailsSpy.and.returnValue(throwError(() => error));

      service.createPaymentDetails(paymentDetails).subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('updatePaymentDetails', () => {
    it('should update payment details and return updated details', (done) => {
      service.updatePaymentDetails(mockPaymentInfo).subscribe((details) => {
        expect(details.status).toBe(204);
        expect(details.body).toBeNull();
        done();
      });
    });

    it('should handle error when updating payment details', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = { id: 'mockPaymentId' };
      const error = new Error('Error');
      checkoutPaymentConnectorUpdatePaymentDetailsSpy.and.returnValue(throwError(() => error));

      service.updatePaymentDetails(paymentDetails).subscribe({
        next: (response) => {
          expect(response).toBe(undefined);
          done();
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getPaymentAddressFromState', () => {
    it('should return payment address from state', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      service['paymentAddress$'].next(address);

      service.getPaymentAddressFromState().subscribe((result) => {
        expect(result).toEqual(address);
        done();
      });
    });

    it('should return null if payment address is not set', (done) => {
      service['paymentAddress$'].next(null);

      service.getPaymentAddressFromState().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('updatePaymentAddress', () => {
    it('should update payment address and return updated address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      spyOn(service['setPaymentAddressCommand'], 'execute').and.returnValue(of(address));

      service.updatePaymentAddress(address).subscribe((updatedAddress) => {
        expect(updatedAddress).toEqual(address);
        done();
      });
    });

    it('should handle error when updating payment address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const error = new Error('Error');
      spyOn(service['setPaymentAddressCommand'], 'execute').and.returnValue(throwError(() => error));

      service.updatePaymentAddress(address).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('setPaymentAddress', () => {
    it('should set payment address and return updated address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      spyOn(service, 'updatePaymentAddress').and.returnValue(of(address));

      service.setPaymentAddress(address).subscribe((updatedAddress) => {
        expect(updatedAddress).toEqual(address);
        done();
      });
    });

    it('should handle error when setting payment address', (done) => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const error = new Error('Error');
      spyOn(service, 'updatePaymentAddress').and.returnValue(throwError(() => error));

      service.setPaymentAddress(address).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getIsABC', () => {
    it('should retrieve OCC IsABC flag and return its state', (done) => {
      const isABCState: QueryState<boolean> = {
        data: true,
        loading: false,
        error: false
      };
      spyOn(service['getIsABCQuery$'], 'getState').and.returnValue(of(isABCState));

      service.getIsABC().subscribe((state) => {
        expect(state).toEqual(isABCState);
        done();
      });
    });

    it('should handle error when retrieving OCC IsABC flag state', (done) => {
      const error = new Error('Error');
      spyOn(service['getIsABCQuery$'], 'getState').and.returnValue(throwError(() => error));

      service.getIsABC().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getIsABCFromState', () => {
    it('should retrieve OCC IsABC flag from state and return its value', (done) => {
      const isABCState: QueryState<boolean> = {
        data: true,
        loading: false,
        error: false
      };
      spyOn(service, 'getIsABC').and.returnValue(of(isABCState));

      service.getIsABCFromState().subscribe((flag) => {
        expect(flag).toBeTrue();
        done();
      });
    });

    it('should handle error when retrieving OCC IsABC flag from state', (done) => {
      const error = new Error('Error');
      spyOn(service, 'getIsABC').and.returnValue(throwError(() => error));

      service.getIsABCFromState().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getPaymentDetailsState', () => {
    it('should return payment details state with checkoutComPaymentInfo', (done) => {
      const checkoutState: QueryState<CheckoutState> = {
        data: { checkoutComPaymentInfo: mockPaymentInfo },
        loading: false,
        error: false
      };
      spyOn(checkoutQueryFacade, 'getCheckoutDetailsState').and.returnValue(of(checkoutState));

      service.getPaymentDetailsState().subscribe((state) => {
        expect(state.data).toEqual(mockPaymentInfo);
        done();
      });
    });

    it('should return payment details state with paymentInfo', (done) => {
      const checkoutState: QueryState<CheckoutState> = {
        data: { paymentInfo: mockPaymentInfo },
        loading: false,
        error: false
      };
      spyOn(checkoutQueryFacade, 'getCheckoutDetailsState').and.returnValue(of(checkoutState));

      service.getPaymentDetailsState().subscribe((state) => {
        expect(state.data).toEqual(mockPaymentInfo);
        done();
      });
    });

    it('should return undefined if no payment details are available', (done) => {
      const checkoutState: QueryState<CheckoutState> = {
        data: undefined,
        loading: false,
        error: false
      };
      spyOn(checkoutQueryFacade, 'getCheckoutDetailsState').and.returnValue(of(checkoutState));

      service.getPaymentDetailsState().subscribe((state) => {
        expect(state.data).toBeUndefined();
        done();
      });
    });

    it('should handle error state when retrieving payment details', (done) => {
      const checkoutState: QueryState<CheckoutState> = {
        data: undefined,
        loading: false,
        error: new Error('Error')
      };
      spyOn(checkoutQueryFacade, 'getCheckoutDetailsState').and.returnValue(of(checkoutState));

      service.getPaymentDetailsState().subscribe((state) => {
        expect(state.error).toEqual(new Error('Error'));
        done();
      });
    });
  });
});

