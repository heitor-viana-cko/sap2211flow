import { ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CHECKOUT_COM_LAUNCH_CALLER, CheckoutComOrderResult } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { generateOrder } from '@checkout-tests/fake-data/order.mock';
import { MockUrlPipe } from '@checkout-tests/pipes';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutReplenishmentFormService } from '@spartacus/checkout/scheduled-replenishment/components';
import { GlobalMessageService, GlobalMessageType, I18nTestingModule, RoutingService, WindowRef } from '@spartacus/core';
import { DaysOfWeek, ORDER_TYPE, recurrencePeriod, ReplenishmentOrder, ScheduledReplenishmentOrderFacade, ScheduleReplenishmentForm } from '@spartacus/order/root';
import { LAUNCH_CALLER, LaunchDialogService } from '@spartacus/storefront';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { CheckoutComPlaceOrderComponent } from './checkout-com-place-order.component';
import Spy = jasmine.Spy;

const mockReplenishmentOrderFormData: ScheduleReplenishmentForm = {
  numberOfDays: 'test-number-days',
  nthDayOfMonth: 'test-day-month',
  recurrencePeriod: recurrencePeriod.WEEKLY,
  numberOfWeeks: 'test-num-of-weeks',
  replenishmentStartDate: 'test-date',
  daysOfWeek: [DaysOfWeek.FRIDAY]
};

const successResponse = {
  successful: true,
  redirectUrl: 'http://example.com'
};

const mockReplenishmentOrderFormData$ = new BehaviorSubject<ScheduleReplenishmentForm>(
  mockReplenishmentOrderFormData
);

const order = generateOrder();

const errorResponse = {
  error: {
    errors: [
      {
        message: 'error',
        type: 'error'
      }
    ]
  },
  details: [
    {
      message: 'error',
      type: 'error'
    }
  ]
};

class MockCheckoutReplenishmentFormService {
  getOrderType(): Observable<ORDER_TYPE> {
    return of();
  }

  getScheduleReplenishmentFormData(): Observable<ScheduleReplenishmentForm> {
    return mockReplenishmentOrderFormData$.asObservable();
  }

  setScheduleReplenishmentFormData(
    _formData: ScheduleReplenishmentForm
  ): void {
  }

  resetScheduleReplenishmentFormData(): void {
  }
}

class MockRoutingService {
  go(): void {
  }

  getRouterState() {
    return of({});
  }
}

class MockCheckoutStepService {
  steps = {};

  getPreviousCheckoutStepUrl() {

  }
}

const mockComponent = { destroy: jasmine.createSpy('destroy') };

describe('CheckoutComPlaceOrderComponent', () => {
  let component: CheckoutComPlaceOrderComponent;
  let fixture: ComponentFixture<CheckoutComPlaceOrderComponent>;
  let controls: UntypedFormGroup['controls'];

  let orderFacade: jasmine.SpyObj<CheckoutComOrderFacade>;
  let checkoutReplenishmentFormService: CheckoutReplenishmentFormService;
  let routingService: RoutingService;
  let stepsService: CheckoutStepService;
  let launchDialogService: LaunchDialogService;
  let scheduledReplenishmentOrderFacade: jasmine.SpyObj<ScheduledReplenishmentOrderFacade>;
  let globalMessageService: jasmine.SpyObj<GlobalMessageService>;
  let windowRef: jasmine.SpyObj<WindowRef>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let flowIsEnabledSpy: Spy;

  beforeEach(
    waitForAsync(() => {
      const globalMessageServiceSpy = jasmine.createSpyObj('GlobalMessageService', ['add']);
      const windowRefSpy = jasmine.createSpyObj('WindowRef', [], {
        nativeWindow: {
          location: { href: '' },
          history: { back: jasmine.createSpy('back') }
        }
      });
      const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
        params: of({ shopId: 'exampleId' }),
        fragment: of(null)
      });
      const scheduledReplenishmentOrderFacadeSpy = jasmine.createSpyObj('ScheduledReplenishmentOrderFacade', ['scheduleReplenishmentOrder']);
      const checkoutComOrderFacadeSpy = jasmine.createSpyObj('CheckoutComOrderFacade', ['placeOrder', 'clearPlacedOrder', 'getOrderResultFromState']);
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, RouterTestingModule, I18nTestingModule],
        declarations: [MockUrlPipe, CheckoutComPlaceOrderComponent],
        providers: [
          {
            provide: CheckoutComOrderFacade,
            useValue: checkoutComOrderFacadeSpy
          },
          {
            provide: RoutingService,
            useClass: MockRoutingService
          },
          {
            provide: LaunchDialogService,
            useClass: MockLaunchDialogService
          },
          ViewContainerRef,
          {
            provide: CheckoutReplenishmentFormService,
            useClass: MockCheckoutReplenishmentFormService
          },
          {
            provide: ScheduledReplenishmentOrderFacade,
            useValue: scheduledReplenishmentOrderFacadeSpy
          },
          {
            provide: GlobalMessageService,
            useValue: globalMessageServiceSpy
          },
          {
            provide: WindowRef,
            useValue: windowRefSpy
          },
          {
            provide: CheckoutStepService,
            useClass: MockCheckoutStepService
          },
          {
            provide: ActivatedRoute,
            useValue: activatedRouteSpy
          },
          {
            provide: CheckoutComFlowFacade,
            useClass: MockCheckoutComFlowFacade
          }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPlaceOrderComponent);
    component = fixture.componentInstance;

    controls = component.checkoutSubmitForm.controls;

    orderFacade = TestBed.inject(CheckoutComOrderFacade) as jasmine.SpyObj<CheckoutComOrderFacade>;
    scheduledReplenishmentOrderFacade = TestBed.inject(ScheduledReplenishmentOrderFacade) as jasmine.SpyObj<ScheduledReplenishmentOrderFacade>;
    checkoutReplenishmentFormService = TestBed.inject(
      CheckoutReplenishmentFormService
    );
    routingService = TestBed.inject(RoutingService);
    stepsService = TestBed.inject(CheckoutStepService);
    launchDialogService = TestBed.inject(LaunchDialogService);
    globalMessageService = TestBed.inject(GlobalMessageService) as jasmine.SpyObj<GlobalMessageService>;
    windowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    spyOn(checkoutReplenishmentFormService, 'setScheduleReplenishmentFormData').and.callThrough();
    spyOn(checkoutReplenishmentFormService, 'resetScheduleReplenishmentFormData').and.callThrough();
    spyOn(launchDialogService, 'clear').and.callThrough();
    // @ts-ignore
    spyOn(launchDialogService, 'launch').and.returnValue(of(mockComponent));
    orderFacade.placeOrder.and.returnValue(of(order));
    orderFacade.getOrderResultFromState.and.returnValue(of(successResponse));
    flowIsEnabledSpy = spyOn(checkoutComFlowFacade, 'getIsFlowEnabled').and.returnValue(of(false));
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when order type is PLACE_ORDER', () => {
    it('should not place order when checkbox not checked', () => {
      submitForm(ORDER_TYPE.PLACE_ORDER, false);

      expect(orderFacade.placeOrder).not.toHaveBeenCalled();
      expect(scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder).not.toHaveBeenCalled();
    });

    describe('place order error', () => {
      beforeEach(() => {
        component.currentOrderType = ORDER_TYPE.PLACE_ORDER;
        component.checkoutSubmitForm.setControl('termsAndConditions', new FormControl(true));
        orderFacade.placeOrder.and.returnValue(throwError(() => errorResponse));
      });

      it('should clear and destroy component if placedOrder is defined', (doneFn) => {
        component.submitForm();
        // @ts-ignore
        expect(launchDialogService.clear).toHaveBeenCalledWith(LAUNCH_CALLER.PLACE_ORDER_SPINNER);
        // @ts-ignore
        component.placedOrder.subscribe((): void => {
          expect(mockComponent.destroy).toHaveBeenCalled();
          doneFn();
        });

      });

      it('should not throw error if placedOrder is undefined', () => {
        component['placedOrder'] = undefined;

        expect(() => {
          if (component['placedOrder']) {
            component['placedOrder'].subscribe((component) => {
              launchDialogService.clear(LAUNCH_CALLER.PLACE_ORDER_SPINNER);
              if (component) {
                component.destroy();
              }
            }).unsubscribe();
          }
        }).not.toThrow();
      });

      it('should add global message with error type and message if error object is valid', () => {
        const errorTypeResponse = {
          error: {
            errors: [
              {
                message: 'Error message',
                type: 'ErrorType'
              }
            ]
          },
          details: []
        };
        orderFacade.placeOrder.and.returnValue(throwError(() => errorTypeResponse));
        component.submitForm();
        expect(globalMessageService.add).toHaveBeenCalledWith({ key: 'checkoutReview.errorType' }, GlobalMessageType.MSG_TYPE_ERROR);
      });

      it('should add global message with raw error message if error type is not a string', () => {
        const rawErrorMessage = {
          details: [
            {
              message: 'Something went wrong',
              type: 'ErrorType'
            }
          ]
        };

        orderFacade.placeOrder.and.returnValue(throwError(() => rawErrorMessage));
        component.submitForm();

        expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'Something went wrong: ErrorType' }, GlobalMessageType.MSG_TYPE_ERROR);
      });

      it('should add global message with raw error message if error object is null', () => {
        const nullErrorresponse = {
          error: {
            errors: [null]
          },
          details: []
        };

        orderFacade.placeOrder.and.returnValue(throwError(() => nullErrorresponse));
        component.submitForm();
        expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'undefined: undefined' }, GlobalMessageType.MSG_TYPE_ERROR);
      });

      it('should add global message with raw error message if error type is null', () => {
        const errorException = {
          error: {
            errors: [
              {
                message: 'Error message',
                type: null
              }
            ]
          },
          details: []
        };
        orderFacade.placeOrder.and.returnValue(throwError(() => errorException));

        component.submitForm();
        expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'Error message' }, GlobalMessageType.MSG_TYPE_ERROR);
      });

      it('should add global message with raw error message if response is null', () => {
        const errorException = null;

        orderFacade.placeOrder.and.returnValue(throwError(() => errorException));

        component.submitForm();
        expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'undefined: undefined' }, GlobalMessageType.MSG_TYPE_ERROR);
      });
    });
  });

  describe('when order type is SCHEDULE_REPLENISHMENT_ORDER', () => {
    it('should not schedule a replenishment order when checkbox not checked', () => {
      submitForm(ORDER_TYPE.SCHEDULE_REPLENISHMENT_ORDER, false);

      expect(orderFacade.placeOrder).not.toHaveBeenCalled();
      expect(scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder).not.toHaveBeenCalled();
    });

    it('should schedule a replenishment order when checkbox checked', () => {
      scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder.and.returnValue(of(order as ReplenishmentOrder));
      orderFacade.getOrderResultFromState.and.returnValue(of({
        order: order,
        successful: true
      }));
      submitForm(ORDER_TYPE.SCHEDULE_REPLENISHMENT_ORDER, true);

      expect(orderFacade.placeOrder).not.toHaveBeenCalled();
      expect(scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder).toHaveBeenCalled();
    });

    it('should change page and reset form data on a successful replenishment order', () => {
      spyOn(routingService, 'go');
      component.currentOrderType = ORDER_TYPE.SCHEDULE_REPLENISHMENT_ORDER;
      component.onSuccess();

      expect(routingService.go).toHaveBeenCalledWith({
        cxRoute: 'replenishmentConfirmation'
      });
      expect(checkoutReplenishmentFormService.resetScheduleReplenishmentFormData).toHaveBeenCalled();
    });
  });

  describe('when order was successfully placed', () => {
    it('should open popover dialog', () => {
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(
        true
      );
      component.currentOrderType = ORDER_TYPE.PLACE_ORDER;

      component.submitForm();

      expect(launchDialogService.launch).toHaveBeenCalledWith(
        LAUNCH_CALLER.PLACE_ORDER_SPINNER,
        component['vcr'] as ViewContainerRef
      );
    });
  });

  describe('Place order UI', () => {
    beforeEach(() => {
      component.ngOnInit();
      controls.termsAndConditions.setValue(true);
      fixture.detectChanges();
    });

    it('should have button DISABLED when a checkbox for weekday in WEEKLY view is NOT checked and terms and condition checked', () => {
      mockReplenishmentOrderFormData$.next({
        ...mockReplenishmentOrderFormData,
        daysOfWeek: []
      });

      fixture.detectChanges();

      expect(
        fixture.debugElement.nativeElement.querySelector('.btn-primary')
          .disabled
      ).toEqual(true);
    });
  });

  function submitForm(orderType: ORDER_TYPE, isTermsCondition: boolean): void {
    component.currentOrderType = orderType;
    controls.termsAndConditions.setValue(isTermsCondition);
    component.submitForm();
  }

  describe('submitForm', () => {
    it('should mark all fields as touched if form is invalid', () => {
      spyOn(component.checkoutSubmitForm, 'markAllAsTouched');
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(false);

      component.submitForm();

      expect(component.checkoutSubmitForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should handle error when order placement fails', () => {
      const errorResponse = {
        details: [{
          message: 'Error message',
          type: 'Error type'
        }]
      };
      orderFacade.placeOrder.and.returnValue(throwError(() => errorResponse));
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(true);
      component.currentOrderType = ORDER_TYPE.PLACE_ORDER;

      component.submitForm();

      expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'Error message: Error type' }, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should handle error when scheduled replenishment order placement fails', () => {
      const errorResponse = {
        details: [{
          message: 'Error message',
          type: 'Error type'
        }]
      };
      scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder.and.returnValue(throwError(() => errorResponse));
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(true);
      component.currentOrderType = ORDER_TYPE.SCHEDULE_REPLENISHMENT_ORDER;

      component.submitForm();

      expect(globalMessageService.add).toHaveBeenCalledWith({ raw: 'Error message: Error type' }, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should redirect to the correct URL on successful order placement', () => {
      orderFacade.placeOrder.and.returnValue(of(order));
      orderFacade.getOrderResultFromState.and.returnValue(of(successResponse));
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(true);
      windowRef.nativeWindow.location.href = successResponse.redirectUrl;
      component.currentOrderType = ORDER_TYPE.PLACE_ORDER;

      component.submitForm();

      expect(windowRef.nativeWindow.location.href).toBe('http://example.com');
    });

    it('should navigate to the previous checkout step on unsuccessful order placement', () => {
      const orderResult = { successful: false };
      orderFacade.getOrderResultFromState.and.returnValue(of(orderResult));
      orderFacade.placeOrder.and.returnValue(of(order));
      spyOnProperty(component.checkoutSubmitForm, 'valid').and.returnValue(true);
      spyOn(routingService, 'go');
      component.currentOrderType = ORDER_TYPE.PLACE_ORDER;

      component.submitForm();

      // @ts-ignore
      expect(routingService.go).toHaveBeenCalledWith(stepsService.getPreviousCheckoutStepUrl(component.activatedRoute));
    });

    it('should call submitFlow when flow is enabled', () => {
      spyOn(component, 'submitFlow');
      spyOn(component, 'submitNASForm');
      flowIsEnabledSpy.and.returnValue(of(true));

      component.submitForm();

      expect(component.submitFlow).toHaveBeenCalled();
      expect(component.submitNASForm).not.toHaveBeenCalled();
    });

    it('should call submitNASForm when flow is not enabled', () => {
      spyOn(component, 'submitFlow');
      spyOn(component, 'submitNASForm');
      flowIsEnabledSpy.and.returnValue(of(false));

      component.submitForm();

      expect(component.submitNASForm).toHaveBeenCalled();
      expect(component.submitFlow).not.toHaveBeenCalled();
    });

    it('should handle error when getIsFlowEnabled throws an error', () => {
      const error = new Error('Flow check error');
      spyOn(component['logger'], 'error');
      flowIsEnabledSpy.and.returnValue(throwError(() => error));

      component.submitForm();

      expect(component['logger'].error).toHaveBeenCalledWith('Error checking if flow is enabled', { error });
    });
  });

  describe('is Flow enabled', () => {
    it('should open dialog and subscribe to dialogClose', () => {
      spyOn(launchDialogService, 'openDialogAndSubscribe');

      component.submitFlow();

      expect(launchDialogService.openDialogAndSubscribe).toHaveBeenCalledWith(
        CHECKOUT_COM_LAUNCH_CALLER.FLOW_POPUP,
        component.element,
        {}
      );
    });
  });

  describe('orderResults', () => {
    it('should redirect to the correct URL if redirectUrl is present', () => {
      const result = {
        redirect: { redirectUrl: 'http://example.com' },
        successful: true
      } as CheckoutComOrderResult;
      orderFacade.getOrderResultFromState.and.returnValue(of(result));
      component.orderResults();

      expect(windowRef.nativeWindow.location.href).toBe('http://example.com');
    });

    it('should navigate to the previous checkout step if order is not successful', () => {
      const result = { successful: false } as CheckoutComOrderResult;
      orderFacade.getOrderResultFromState.and.returnValue(of(result));
      spyOn(routingService, 'go');

      component.orderResults();

      // @ts-ignore
      expect(routingService.go).toHaveBeenCalledWith(stepsService.getPreviousCheckoutStepUrl(component.activatedRoute));
    });

    it('should call onSuccess if order is successful and no redirectUrl is present', () => {
      const result = { successful: true } as CheckoutComOrderResult;
      orderFacade.getOrderResultFromState.and.returnValue(of(result));
      spyOn(component, 'onSuccess');

      component.orderResults();

      expect(component.onSuccess).toHaveBeenCalled();
    });

    it('should log an error if getOrderResultFromState throws an error', () => {
      const error = new Error('error');
      orderFacade.getOrderResultFromState.and.returnValue(throwError(() => error));
      spyOn(component['logger'], 'error');

      component.orderResults();

      expect(component['logger'].error).toHaveBeenCalledWith('getOrderResultFromState with error', { err: error });
    });
  });

});
