import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { CheckoutComBillingAddressFormComponent } from "@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component";
import { CheckoutComConnector } from "@checkout-core/connectors/checkout-com/checkout-com.connector";
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComPaymentFacade } from "@checkout-facades/checkout-com-payment.facade";
import { PaymentType } from "@checkout-model/ApmData";
import { CheckoutComBillingAddressFormService } from "@checkout-services/billing-address-form/checkout-com-billing-address-form.service";
import { MockCxSpinnerComponent } from "@checkout-tests/components";
import { generateBillingFromFromAddress, generateOneAddress } from "@checkout-tests/fake-data/address.mock";
import { queryDebugElementByCss } from "@checkout-tests/finders.mock";
import { MockCheckoutComBillingAddressFormService } from "@checkout-tests/services/checkout-billing-address-form.service.mock";
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComPaymentFacade } from "@checkout-tests/services/checkout-com-payment.facade.mock";
import { MockCheckoutComConnector } from "@checkout-tests/services/checkout-com.connector.mock";
import { MockCheckoutDeliveryAddressFacade } from "@checkout-tests/services/chekout-delivery-address.service.mock";
import { MockGlobalMessageService } from "@checkout-tests/services/global-message.service.mock";
import { MockLaunchDialogService } from "@checkout-tests/services/launch-dialog.service.mock";
import { MockTranslationService } from "@checkout-tests/services/translations.services.mock";
import { MockUserAddressService } from "@checkout-tests/services/user-address.service.mock";
import { MockUserPaymentService } from "@checkout-tests/services/user-payment.service.mock";
import { NgSelectModule } from "@ng-select/ng-select";
import { CheckoutBillingAddressFormService } from "@spartacus/checkout/base/components";
import { CheckoutDeliveryAddressFacade } from "@spartacus/checkout/base/root";
import {
  EventService,
  FeaturesConfigModule,
  GlobalMessageService,
  I18nTestingModule,
  LoggerService,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from "@spartacus/core";
import { CardComponent, FormErrorsModule, LaunchDialogService, NgSelectA11yModule } from "@spartacus/storefront";
import { timeout } from "rxjs/operators";

import { CheckoutComApmFawryComponent } from "./checkout-com-apm-fawry.component";

const billingAddress = generateOneAddress();
const billingAddressFormData = generateBillingFromFromAddress(billingAddress);

describe("CheckoutComApmFawryComponent", () => {
  let component: CheckoutComApmFawryComponent;
  let fixture: ComponentFixture<CheckoutComApmFawryComponent>;
  const mobileNumber = "01055518212";
  let userAddressService: UserAddressService;
  let userPaymentService: UserPaymentService;
  let checkoutDeliveryAddressFacade: CheckoutComCheckoutBillingAddressFacade;
  let logger: LoggerService;
  let eventService: EventService;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        I18nTestingModule,
        NgSelectModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule
      ],
      declarations: [
        CheckoutComApmFawryComponent,
        CheckoutComBillingAddressFormComponent,
        MockCxSpinnerComponent,
        CardComponent
      ],
      providers: [
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useClass: MockCheckoutDeliveryAddressFacade
        },
        {
          provide: UserPaymentService,
          useClass: MockUserPaymentService
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: UserAddressService,
          useClass: MockUserAddressService
        },
        {
          provide: CheckoutBillingAddressFormService,
          useClass: MockCheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComPaymentFacade,
          useClass: MockCheckoutComPaymentFacade
        },
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmFawryComponent);
    userAddressService = TestBed.inject(UserAddressService);
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    component = fixture.componentInstance;
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getContinueButton = () => {
    return queryDebugElementByCss(fixture, "button[data-test-id=\"fawry-continue-btn\"]");
  };

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should send MobileNumber field", (done) => {
    billingAddressFormService.setSameAsDeliveryAddress(true);
    fixture.detectChanges();

    component.setPaymentDetails.subscribe((event) => {
      expect(event.billingAddress).toBeNull();
      expect(event.paymentDetails).toEqual({
        type: PaymentType.Fawry,
        mobileNumber
      });

      done();
    });
    component.mobileNumberCtrl.setValue(mobileNumber);
    fixture.detectChanges();
    component.next();
  });

  it("should not call setPaymentDetails event if billing address is not valid", (done) => {
    component.mobileNumberCtrl.setValue(mobileNumber);
    component.sameAsDeliveryAddress = false;
    component.setPaymentDetails.pipe(timeout(2)).subscribe({
      error: (err) => {
        expect(err.message).toEqual("Timeout has occurred");
        done();
      }
    });
    component.billingAddressForm.setValue(billingAddressFormData);
    fixture.detectChanges();
    component.next();
  });

  describe("next", () => {
    it("should proceed to next step with valid mobile number and same as delivery address", (done) => {
      billingAddressFormService.setSameAsDeliveryAddress(true);
      component.mobileNumberCtrl.setValue("01055518212");
      fixture.detectChanges();

      component.setPaymentDetails.subscribe((event) => {
        expect(event.billingAddress).toBeNull();
        expect(event.paymentDetails).toEqual({
          type: PaymentType.Fawry,
          mobileNumber: "01055518212"
        });
        done();
      });

      component.next();
    });

    it("should proceed to next step with valid mobile number and different billing address", (done) => {
      spyOn(billingAddressFormService, "isBillingAddressSameAsDeliveryAddress").and.returnValue(false);
      component.mobileNumberCtrl.setValue("01055518212");
      component.billingAddressForm.setValue(billingAddressFormData);
      fixture.detectChanges();

      component.setPaymentDetails.subscribe((event) => {
        fixture.detectChanges();
        expect(event.billingAddress).toEqual(billingAddressFormData);
        expect(event.paymentDetails).toEqual({
          type: PaymentType.Fawry,
          mobileNumber: "01055518212"
        });
        done();
      });

      component.next();
    });

    it("should use the billing address if given", (done) => {
      component.mobileNumberCtrl.setValue(mobileNumber);
      spyOn(billingAddressFormService, "isBillingAddressSameAsDeliveryAddress").and.returnValue(false);
      component.setPaymentDetails.subscribe((event) => {
        expect(event.billingAddress).toEqual(billingAddressFormData);
        done();
      });
      component.billingAddressForm.setValue(billingAddressFormData);
      fixture.detectChanges();
      component.next();
    });

    it("should not proceed to next step with invalid mobile number", () => {
      component.mobileNumberCtrl.setValue("invalid");
      fixture.detectChanges();

      spyOn(component.setPaymentDetails, "emit");
      component.next();
      expect(component.setPaymentDetails.emit).not.toHaveBeenCalled();
    });

    it("should not proceed to next step with invalid billing address", () => {
      spyOn(billingAddressFormService, "isBillingAddressSameAsDeliveryAddress").and.returnValue(false);
      component.mobileNumberCtrl.setValue("01055518212");
      component.billingAddressForm.setValue({
        ...billingAddressFormData,
        firstName: ""
      });
      fixture.detectChanges();

      spyOn(component.setPaymentDetails, "emit");
      component.next();
      expect(component.setPaymentDetails.emit).not.toHaveBeenCalled();
    });
  });

  describe("UI components", () => {
    it("should have Mobile Number field", () => {
      fixture.detectChanges();
      expect(queryDebugElementByCss(fixture, "input[data-test-id=\"fawry-number-input\"]")).toBeTruthy();
    });

    it("continue button should be disabled on init", () => {
      fixture.detectChanges();
      expect(getContinueButton().nativeElement["disabled"]).toEqual(true);
    });

    it("continue button should be disabled on wrong format (+)", () => {
      fixture.detectChanges();
      component.mobileNumberCtrl.setValue("+01055518212");
      fixture.detectChanges();
      expect(getContinueButton().nativeElement["disabled"]).toEqual(true);
    });

    it("continue button should be disabled on wrong format (letter)", () => {
      fixture.detectChanges();
      component.mobileNumberCtrl.setValue("a01055518212");
      fixture.detectChanges();
      expect(getContinueButton().nativeElement["disabled"]).toEqual(true);
    });

    it("continue button should be enabled on correct format", () => {
      fixture.detectChanges();
      component.mobileNumberCtrl.setValue("01055518212");
      fixture.detectChanges();
      expect(getContinueButton().nativeElement["disabled"]).toEqual(false);
    });
  });
});

