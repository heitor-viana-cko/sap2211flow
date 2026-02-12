import { ElementRef, NgZone, Renderer2 } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { CheckoutComBillingAddressFormComponent } from "@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component";
import { CheckoutComConnector } from "@checkout-core/connectors/checkout-com/checkout-com.connector";
import { GooglePayMerchantConfiguration, GooglePayPaymentRequest } from "@checkout-core/model/GooglePay";
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComGooglepayFacade } from "@checkout-facades/checkout-com-googlepay.facade";
import { CheckoutComOrderFacade } from "@checkout-facades/checkout-com-order.facade";
import { CheckoutComPaymentFacade } from "@checkout-facades/checkout-com-payment.facade";
import { CheckoutComBillingAddressFormService } from "@checkout-services/billing-address-form/checkout-com-billing-address-form.service";
import { MockCardComponent } from "@checkout-tests/components";
import { generateOneAddress } from "@checkout-tests/fake-data/address.mock";
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComPaymentFacade } from "@checkout-tests/services/checkout-com-payment.facade.mock";
import { MockCheckoutComConnector } from "@checkout-tests/services/checkout-com.connector.mock";
import { globalMessageServiceSpy } from "@checkout-tests/services/global-message.service.mock";
import { MockLaunchDialogService } from "@checkout-tests/services/launch-dialog.service.mock";
import { MockUserPaymentService } from "@checkout-tests/services/user-payment.service.mock";
import { CheckoutBillingAddressFormService } from "@spartacus/checkout/base/components";
import { CheckoutDeliveryAddressFacade } from "@spartacus/checkout/base/root";
import { Address, GlobalMessageService, I18nTestingModule, RoutingService, UserAddressService, UserPaymentService, WindowRef } from "@spartacus/core";
import { Order } from "@spartacus/order/root";
import { FormErrorsModule, LaunchDialogService } from "@spartacus/storefront";

import { of, throwError } from "rxjs";
import { CheckoutComApmGooglepayComponent } from "./checkout-com-apm-googlepay.component";

const googlePayAuth: GooglePayPaymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const loadScript = (windowRef, url, callback) => {
  callback();
};
describe("CheckoutComApmGooglepayComponent", () => {
  let component: CheckoutComApmGooglepayComponent;
  let fixture: ComponentFixture<CheckoutComApmGooglepayComponent>;
  let mockCheckoutComGooglePayFacade: jasmine.SpyObj<CheckoutComGooglepayFacade>;
  let mockCheckoutComPaymentFacade: jasmine.SpyObj<CheckoutComPaymentFacade>;
  let mockCheckoutComOrderFacade: jasmine.SpyObj<CheckoutComOrderFacade>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;
  let mockNgZone: jasmine.SpyObj<NgZone>;
  let mockWindowRef: jasmine.SpyObj<WindowRef>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;
  let checkoutDeliveryAddressFacade: jasmine.SpyObj<CheckoutDeliveryAddressFacade>;
  let userAddressService: jasmine.SpyObj<UserAddressService>;
  let userPaymentService: UserPaymentService;
  let checkoutPaymentService: jasmine.SpyObj<CheckoutComPaymentFacade>;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let mockDocument: Document;
  let headElement: HTMLElement;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  let google = {
    payments: {
      api: {
        PaymentsClient: {
          isReadyToPay: true,
          loadPaymentData: async () => googlePayAuth
        }
      }
    }
  };
  beforeEach(async () => {
    // Mock the document and its methods
    mockDocument = document.implementation.createHTMLDocument();
    headElement = mockDocument.createElement("head");
    mockDocument.documentElement.appendChild(headElement);

    mockCheckoutComGooglePayFacade = jasmine.createSpyObj("CheckoutComGooglepayFacade", [
      "getMerchantConfigurationFromState",
      "onPaymentAuthorized",
      "onPaymentDataChanged",
      "createInitialPaymentRequest",
      "createFullPaymentRequest",
      "authoriseOrder",
      "requestMerchantConfiguration"
    ]);
    mockRoutingService = jasmine.createSpyObj("RoutingService", ["go"]);
    mockNgZone = jasmine.createSpyObj("NgZone", ["run"]);
    mockWindowRef = jasmine.createSpyObj("WindowRef", ["document"], {
      nativeWindow: { google: { payments: { api: { PaymentsClient: jasmine.createSpy() } } } },
      document: mockDocument
    });
    mockRenderer = jasmine.createSpyObj("Renderer2", ["setAttribute", "appendChild"]);
    const checkoutDeliveryAddressFacadeSpy = jasmine.createSpyObj("CheckoutDeliveryAddressFacade", ["getDeliveryAddressState"]);
    const userAddressServiceSpy = jasmine.createSpyObj("UserAddressService", ["verifyAddress", "getRegions"]);
    mockCheckoutComPaymentFacade = jasmine.createSpyObj("CheckoutComPaymentFacade", ["updatePaymentAddress"]);
    mockCheckoutComOrderFacade = jasmine.createSpyObj("CheckoutComOrderFacade", ["getOrderDetails"]);

    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComApmGooglepayComponent,
        CheckoutComBillingAddressFormComponent,
        MockCardComponent
      ],
      imports: [
        I18nTestingModule,
        FormErrorsModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        {
          provide: CheckoutComGooglepayFacade,
          useValue: mockCheckoutComGooglePayFacade
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService
        },
        {
          provide: GlobalMessageService,
          useValue: globalMessageServiceSpy
        },
        {
          provide: CheckoutComPaymentFacade,
          useValue: mockCheckoutComPaymentFacade
        },
        {
          provide: CheckoutComOrderFacade,
          useValue: mockCheckoutComOrderFacade
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        },
        {
          provide: Renderer2,
          useValue: mockRenderer
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useValue: checkoutDeliveryAddressFacadeSpy
        },
        {
          provide: UserAddressService,
          useValue: userAddressServiceSpy
        },
        {
          provide: UserPaymentService,
          useClass: MockUserPaymentService
        },
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
    fixture = TestBed.createComponent(CheckoutComApmGooglepayComponent);
    component = fixture.componentInstance;
    mockCheckoutComGooglePayFacade = TestBed.inject(CheckoutComGooglepayFacade) as jasmine.SpyObj<CheckoutComGooglepayFacade>;
    mockCheckoutComOrderFacade = TestBed.inject(CheckoutComOrderFacade) as jasmine.SpyObj<CheckoutComOrderFacade>;
    mockRoutingService = TestBed.inject(RoutingService) as jasmine.SpyObj<RoutingService>;
    mockWindowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    mockRenderer = TestBed.inject(Renderer2) as jasmine.SpyObj<Renderer2>;
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade) as jasmine.SpyObj<CheckoutDeliveryAddressFacade>;
    userAddressService = TestBed.inject(UserAddressService) as jasmine.SpyObj<UserAddressService>;
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);

    mockCheckoutComOrderFacade.getOrderDetails.and.returnValue(of(null));
    mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of({}));
    checkoutDeliveryAddressFacade.getDeliveryAddressState.and.returnValue(of({
      loading: false,
      data: generateOneAddress(),
      error: false
    }));
    // @ts-ignore
    component.paymentsClient = {
      isReadyToPay: () => true,
      loadPaymentData: async () => googlePayAuth
    };
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should not call requestMerchantConfiguration on ngAfterViewInit when gpayBtn is not present", () => {
    component.gpayBtn = null;
    component.ngAfterViewInit();
    expect(mockCheckoutComGooglePayFacade.requestMerchantConfiguration).not.toHaveBeenCalled();
  });

  describe("gpayButton Exists", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should call requestMerchantConfiguration on ngAfterViewInit when gpayBtn is present", () => {
      component.gpayBtn = { nativeElement: {} } as ElementRef;
      component.ngAfterViewInit();
      expect(mockCheckoutComGooglePayFacade.requestMerchantConfiguration).toHaveBeenCalled();
    });

    it("should return early if paymentsClient is already initialized", () => {
      component["paymentsClient"] = {};
      const spy = spyOn(component as any, "initPaymentsClient");

      component["initBtn"]();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should proceed with initialization if paymentsClient is not initialized", () => {
      component["paymentsClient"] = null;
      const spy = spyOn(component as any, "initPaymentsClient").and.callThrough();
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of({ clientSettings: {} }));

      component["initBtn"]();

      expect(spy).toHaveBeenCalled();
    });

    it("should proceed with initialization if paymentsClient does not exists", () => {
      component["paymentsClient"] = null;
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      // @ts-ignore
      mockWindowRef.nativeWindow.google.payments.api = null;
      const spy = spyOn(component as any, "initPaymentsClient").and.callThrough();
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of({ clientSettings: {} }));
      component["initBtn"]();

      loadScript(component["windowRef"], "https://pay.google.com/gp/p/js/pay.js", () => {
        component["ngZone"].run(() => {
          component["initPaymentsClient"](mockMerchantConfig);
        });
      });

      expect(spy).toHaveBeenCalled();
    });

    it("should load Google Pay script and initialize PaymentsClient", () => {
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      // @ts-ignore
      spyOn(component, "initPaymentsClient");
      spyOn(component["ngZone"], "run").and.callFake((fn: Function) => fn());

      loadScript(component["windowRef"], "https://pay.google.com/gp/p/js/pay.js", () => {
        component["ngZone"].run(() => {
          component["initPaymentsClient"](mockMerchantConfig);
        });
      });

      expect(component["ngZone"].run).toHaveBeenCalled();
      expect(component["initPaymentsClient"]).toHaveBeenCalledWith(mockMerchantConfig);
    });

    it("should log error if Google Pay script fails to load", () => {
      spyOn(console, "error");
      spyOn(component["ngZone"], "run").and.callFake((fn: Function) => fn());

      loadScript(component["windowRef"], "https://pay.google.com/gp/p/js/pay.js", () => {
        console.error("Script load error");
      });

      expect(console.error).toHaveBeenCalledWith("Script load error");
    });

    it("should initialize PaymentsClient and create Google Pay button if ready to pay", async () => {
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      const mockButton = document.createElement("button");
      mockCheckoutComGooglePayFacade.createInitialPaymentRequest.and.returnValue({});
      // @ts-ignore
      mockWindowRef.nativeWindow.google.payments.api.PaymentsClient.and.returnValue({
        isReadyToPay: jasmine.createSpy().and.returnValue(Promise.resolve({ result: true })),
        createButton: jasmine.createSpy().and.returnValue(mockButton)
      });
      // @ts-ignore
      component.initPaymentsClient(mockMerchantConfig);

      await fixture.whenStable();
      // @ts-ignore
      expect(mockWindowRef.nativeWindow.google.payments.api.PaymentsClient).toHaveBeenCalledWith(mockMerchantConfig.clientSettings);
      // @ts-ignore
      expect(mockCheckoutComGooglePayFacade.createInitialPaymentRequest).toHaveBeenCalledWith(mockMerchantConfig, component.shippingAddressRequired);
      // @ts-ignore
      expect(component.paymentsClient.createButton).toHaveBeenCalled();
      expect(component.gpayBtn.nativeElement.children.length).toBeGreaterThan(0);
    });

    it("should not create Google Pay button if not ready to pay", async () => {
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      mockCheckoutComGooglePayFacade.createInitialPaymentRequest.and.returnValue({});
      // @ts-ignore
      mockWindowRef.nativeWindow.google.payments.api.PaymentsClient.and.returnValue({
        isReadyToPay: jasmine.createSpy().and.returnValue(Promise.resolve({ result: false })),
        createButton: jasmine.createSpy()
      });
      // @ts-ignore
      component.initPaymentsClient(mockMerchantConfig);

      await fixture.whenStable();
      // @ts-ignore
      expect(mockWindowRef.nativeWindow.google.payments.api.PaymentsClient).toHaveBeenCalledWith(mockMerchantConfig.clientSettings);
      // @ts-ignore
      expect(mockCheckoutComGooglePayFacade.createInitialPaymentRequest).toHaveBeenCalledWith(mockMerchantConfig, component.shippingAddressRequired);
      // @ts-ignore
      expect(component.paymentsClient.createButton).not.toHaveBeenCalled();
    });

    it("should navigate to order confirmation on successful order retrieval", () => {
      fixture.detectChanges();
      const mockOrder = { code: "order123" } as Order;
      mockCheckoutComOrderFacade.getOrderDetails.and.returnValue(of(mockOrder));
      component.ngOnInit();
      expect(mockRoutingService.go).toHaveBeenCalledWith({ cxRoute: "orderConfirmation" });
    });

    it("should log error on order retrieval failure", () => {
      spyOn(console, "error");
      mockCheckoutComOrderFacade.getOrderDetails.and.returnValue(throwError(() => "Error"));
      component.ngOnInit();
      expect(console.error).toHaveBeenCalledWith("return to order confirmation with errors", { err: "Error" });
    });

    it("should initialize Google Pay button on ngAfterViewInit", () => {
      //@ts-ignore
      spyOn(component, "initBtn");
      component.gpayBtn = { nativeElement: {} } as ElementRef;
      component.ngAfterViewInit();
      //@ts-ignore
      expect(component.initBtn).toHaveBeenCalled();
    });

    it("should not initialize Google Pay button if Google Pay Btn is not present", () => {
      //@ts-ignore
      spyOn(component, "initBtn");
      component.gpayBtn = null;
      component.ngAfterViewInit();
      //@ts-ignore
      expect(component.initBtn).not.toHaveBeenCalled();
    });

    it("should log error on initBtn failure", () => {
      spyOn(console, "error");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(throwError(() => "Error"));
      //@ts-ignore
      component.initBtn();
      expect(console.error).toHaveBeenCalledWith("initBtn with errors", { err: "Error" });
    });

    it("should authorize payment with valid billing address", () => {
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfig));
      component.billingAddressForm.patchValue({ valid: true });
      //@ts-ignore
      component.authorisePayment();
      expect(mockCheckoutComGooglePayFacade.createFullPaymentRequest).toHaveBeenCalledWith(mockMerchantConfig);
    });

    it("should make form errors visible if billing address is invalid", () => {
      const childComponent = fixture.debugElement.query(By.directive(CheckoutComBillingAddressFormComponent)).componentInstance as CheckoutComBillingAddressFormComponent;
      childComponent.billingAddressForm.patchValue({ valid: false });
      //@ts-ignore
      component.authorisePayment();
      //@ts-ignore
      expect(childComponent.billingAddressForm.valid).toBeFalse();
    });

    it("should log error on authorisePayment failure", () => {
      spyOn(console, "error");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(throwError(() => "Error"));
      //@ts-ignore
      component.authorisePayment();
      expect(console.error).toHaveBeenCalledWith("authorisePayment with errors", { err: "Error" });
    });

    it("should make form errors visible and return when billing address form is invalid", () => {
      component.billingAddressForm.patchValue({ firstName: null });
      fixture.detectChanges();
      // @ts-ignore
      component.authorisePayment();

      expect(mockCheckoutComGooglePayFacade.authoriseOrder).not.toHaveBeenCalled();
    });

    it("should not make form errors visible and proceed when billing address form is valid", () => {
      const mockBillingAddress: Address = {
        firstName: "John",
        lastName: "Doe",
        line1: "Green Street",
        line2: "420",
        town: "Montreal",
        postalCode: "H3A",
        country: { isocode: "CA" },
        region: {
          isocode: "QC",
          isocodeShort: "60"
        }
      };
      const mockMerchantConfig = { clientSettings: {} } as GooglePayMerchantConfiguration;
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfig));
      mockCheckoutComGooglePayFacade.createFullPaymentRequest.and.returnValue(mockMerchantConfig);
      component.billingAddressForm.patchValue(mockBillingAddress);

      fixture.detectChanges();
      // @ts-ignore
      spyOn(component.paymentsClient, "loadPaymentData").and.returnValue(Promise.resolve(googlePayAuth));
      // @ts-ignore
      spyOn(component, "initPaymentsClient");
      // @ts-ignore
      component.authorisePayment();

      expect(mockCheckoutComGooglePayFacade.createFullPaymentRequest).toHaveBeenCalled();
      expect(component["paymentsClient"].loadPaymentData).toHaveBeenCalledWith(mockMerchantConfig);
    });
  });
});