import { EventEmitter } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { CheckoutComConnector } from "@checkout-core/connectors/checkout-com/checkout-com.connector";
import { ApmPaymentDetails } from "@checkout-core/interfaces";
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComPaymentFacade } from "@checkout-facades/checkout-com-payment.facade";

import { PaymentType } from "@checkout-model/ApmData";
import { CheckoutComBillingAddressFormService } from "@checkout-services/billing-address-form/checkout-com-billing-address-form.service";
import { MockLibCheckoutComBillingAddressFormComponent } from "@checkout-tests/components";
import { generateAddressFromFromAddress } from "@checkout-tests/fake-data/address.mock";
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
import { CheckoutBillingAddressFormService } from "@spartacus/checkout/base/components";
import { CheckoutDeliveryAddressFacade } from "@spartacus/checkout/base/root";
import { Address, EventService, GlobalMessageService, I18nTestingModule, LoggerService, TranslationService, UserAddressService, UserPaymentService } from "@spartacus/core";
import { FormErrorsModule, LaunchDialogService } from "@spartacus/storefront";
import { CheckoutComApmIdealComponent } from "./checkout-com-apm-ideal.component";

const mockAddress: Address = {
  firstName: "John",
  lastName: "Doe",
  titleCode: "mr",
  line1: "Toyosaki 2 create on cart",
  line2: "line2",
  town: "town",
  region: {
    isocode: "JP-27",
    isocodeShort: "27"
  },
  postalCode: "zip",
  country: { isocode: "AD" }
};
const formData = generateAddressFromFromAddress(mockAddress);
describe("CheckoutComApmIdealComponent", () => {
  let component: CheckoutComApmIdealComponent;
  let fixture: ComponentFixture<CheckoutComApmIdealComponent>;
  let setPaymentDetails = new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();
  let userAddressService: UserAddressService;
  let userPaymentService: UserPaymentService;
  let checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let logger: LoggerService;
  let eventService: EventService;
  let checkoutComPaymentFacade: CheckoutComPaymentFacade;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [I18nTestingModule, FormErrorsModule, ReactiveFormsModule],
        declarations: [CheckoutComApmIdealComponent, MockLibCheckoutComBillingAddressFormComponent],
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
          CheckoutComBillingAddressFormService,
          {
            provide: CheckoutBillingAddressFormService,
            useClass: CheckoutComBillingAddressFormService
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
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmIdealComponent);
    component = fixture.componentInstance;
    userAddressService = TestBed.inject(UserAddressService);
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    component = fixture.componentInstance;
    checkoutComPaymentFacade = TestBed.inject(CheckoutComPaymentFacade);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);

    setPaymentDetails = new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();
    component.setPaymentDetails = setPaymentDetails;
    component.sameAsShippingAddress = true;

    // simplified billing address form for tst
    component.billingAddressForm = billingAddressFormService.getBillingAddressForm();

    fixture.detectChanges();
  });

  afterEach(() => {
    if (setPaymentDetails) {
      setPaymentDetails.unsubscribe();
    }
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should use the billing address if given", (done) => {
    spyOn(billingAddressFormService, "isBillingAddressSameAsDeliveryAddress").and.returnValue(false);
    billingAddressFormService.billingAddress$.next(formData);
    component.sameAsShippingAddress = false;
    fixture.detectChanges();

    expect(document.querySelector("button[data-test-id=\"ideal-continue-btn\"]")["disabled"]).toEqual(false);

    setPaymentDetails
      .subscribe((event) => {
        expect(event.billingAddress).toEqual(formData);
        expect(event.paymentDetails).toEqual({ type: PaymentType.iDeal });
        done();
      });

    component.next();
  });

  it("should not call setPaymentDetails event if billing address is not valid", () => {
    component.sameAsShippingAddress = false;
    const billingAddress = {
      firstName: "John",
      lastName: ""
    } as Address;
    component.billingAddressForm.patchValue(billingAddress);

    fixture.detectChanges();

    expect(document.querySelector("button[data-test-id=\"ideal-continue-btn\"]")["disabled"]).toEqual(false);
  });
});

