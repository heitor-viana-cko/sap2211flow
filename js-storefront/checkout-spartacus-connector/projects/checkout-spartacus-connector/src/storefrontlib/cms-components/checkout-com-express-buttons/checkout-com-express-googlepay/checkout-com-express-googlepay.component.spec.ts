import { ElementRef, NgZone, Renderer2 } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { CheckoutComConnector } from "@checkout-core/connectors/checkout-com/checkout-com.connector";
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComGooglepayFacade } from "@checkout-facades/checkout-com-googlepay.facade";
import { CheckoutComOrderFacade } from "@checkout-facades/checkout-com-order.facade";
import { CheckoutComPaymentFacade } from "@checkout-facades/checkout-com-payment.facade";
import { GooglePayPaymentRequest } from "@checkout-model/GooglePay";
import { CheckoutComBillingAddressFormService } from "@checkout-services/billing-address-form/checkout-com-billing-address-form.service";
import { generateOneAddress } from "@checkout-tests/fake-data/address.mock";
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComConnector } from "@checkout-tests/services/checkout-com.connector.mock";
import { globalMessageServiceSpy } from "@checkout-tests/services/global-message.service.mock";
import { MockLaunchDialogService } from "@checkout-tests/services/launch-dialog.service.mock";
import { MockTranslationService } from "@checkout-tests/services/translations.services.mock";
import { ActiveCartService } from "@spartacus/cart/base/core";
import { CheckoutBillingAddressFormService } from "@spartacus/checkout/base/components";
import { CheckoutDeliveryAddressFacade } from "@spartacus/checkout/base/root";
import {
  EventService,
  GlobalMessageService,
  LoggerService,
  RoutingService,
  TranslationService,
  UserAddressService,
  UserIdService,
  UserPaymentService,
  WindowRef
} from "@spartacus/core";
import { LaunchDialogService } from "@spartacus/storefront";
import { Observable, of, throwError } from "rxjs";
import { CheckoutComExpressGooglepayComponent } from "./checkout-com-express-googlepay.component";
import createSpy = jasmine.createSpy;

const mockCountries = [{
  isocode: "US",
  name: "United States"
}];

class MockUserPaymentService implements Partial<UserPaymentService> {
  getAllBillingCountries = createSpy("UserPaymentService.getAllBillingCountries").and.returnValue(of(mockCountries));
  loadBillingCountries = createSpy("UserPaymentService.loadBillingCountries").and.callThrough();
}

const googlePayAuth: GooglePayPaymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const loadScript = (windowRef, url, callback) => {
  callback();
};

describe("CheckoutComExpressGooglepayComponent", () => {
  let component: CheckoutComExpressGooglepayComponent;
  let fixture: ComponentFixture<CheckoutComExpressGooglepayComponent>;
  let logger: LoggerService;
  let eventService: EventService;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;

  let mockCheckoutComGooglePayFacade: jasmine.SpyObj<CheckoutComGooglepayFacade>;
  let mockCheckoutComPaymentFacade: jasmine.SpyObj<CheckoutComPaymentFacade>;
  let mockCheckoutComOrderFacade: jasmine.SpyObj<CheckoutComOrderFacade>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;
  let mockUserIdService: jasmine.SpyObj<UserIdService>;
  let mockActiveCartService: jasmine.SpyObj<ActiveCartService>;
  let mockNgZone: jasmine.SpyObj<NgZone>;
  let mockWindowRef: jasmine.SpyObj<WindowRef>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;
  let checkoutDeliveryAddressFacade: jasmine.SpyObj<CheckoutDeliveryAddressFacade>;
  let userAddressService: jasmine.SpyObj<UserAddressService>;
  let userPaymentService: UserPaymentService;
  let checkoutPaymentService: jasmine.SpyObj<CheckoutComPaymentFacade>;
  let mockDocument: Document;
  let headElement: HTMLElement;
  let mockButton = document.createElement("button");
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  let google = {
    payments: {
      api: {
        PaymentsClient: function(value) {
          return {
            isReadyToPay: async () => ({ result: true }),
            createButton: () => mockButton,
            loadPaymentData: async () => googlePayAuth
          };
        }
      }
    }
  };

  beforeEach(async () => {
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
      "requestMerchantConfiguration",
      "addPaymentExpressIntents"
    ]);
    mockRoutingService = jasmine.createSpyObj("RoutingService", ["go"]);
    mockUserIdService = jasmine.createSpyObj("UserIdService", ["getUserId"]);
    mockActiveCartService = jasmine.createSpyObj("ActiveCartService", ["getActiveCartId"]);
    mockNgZone = jasmine.createSpyObj("NgZone", ["run"]);
    mockWindowRef = jasmine.createSpyObj("WindowRef", ["document"], {
      nativeWindow: { google: { payments: { api: { PaymentsClient: jasmine.createSpy() } } } },
      document: mockDocument,
      isBrowser: () => true
    });
    mockRenderer = jasmine.createSpyObj("Renderer2", ["setAttribute", "appendChild"]);
    const checkoutDeliveryAddressFacadeSpy = jasmine.createSpyObj("CheckoutDeliveryAddressFacade", ["getDeliveryAddressState"]);
    const userAddressServiceSpy = jasmine.createSpyObj("UserAddressService", ["verifyAddress", "getRegions"]);
    mockCheckoutComPaymentFacade = jasmine.createSpyObj("CheckoutComPaymentFacade", ["updatePaymentAddress", "getPaymentAddressFromState", "getPaymentDetailsState"]);
    mockCheckoutComOrderFacade = jasmine.createSpyObj("CheckoutComOrderFacade", ["getOrderDetails"]);

    await TestBed.configureTestingModule({
      declarations: [CheckoutComExpressGooglepayComponent],
      providers: [
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        CheckoutComBillingAddressFormService,
        {
          provide: CheckoutBillingAddressFormService,
          useClass: CheckoutComBillingAddressFormService
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
          provide: UserIdService,
          useValue: mockUserIdService
        },
        {
          provide: ActiveCartService,
          useValue: mockActiveCartService
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
    fixture = TestBed.createComponent(CheckoutComExpressGooglepayComponent);
    component = fixture.componentInstance;
    mockActiveCartService = TestBed.inject(ActiveCartService) as jasmine.SpyObj<ActiveCartService>;
    mockCheckoutComGooglePayFacade = TestBed.inject(CheckoutComGooglepayFacade) as jasmine.SpyObj<CheckoutComGooglepayFacade>;
    mockCheckoutComOrderFacade = TestBed.inject(CheckoutComOrderFacade) as jasmine.SpyObj<CheckoutComOrderFacade>;
    mockRoutingService = TestBed.inject(RoutingService) as jasmine.SpyObj<RoutingService>;
    mockUserIdService = TestBed.inject(UserIdService) as jasmine.SpyObj<UserIdService>;
    mockWindowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    mockRenderer = TestBed.inject(Renderer2) as jasmine.SpyObj<Renderer2>;
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade) as jasmine.SpyObj<CheckoutDeliveryAddressFacade>;
    userAddressService = TestBed.inject(UserAddressService) as jasmine.SpyObj<UserAddressService>;
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    mockCheckoutComPaymentFacade.getPaymentDetailsState.and.returnValue(of({
      loading: false,
      data: {},
      error: false
    }));
    mockCheckoutComOrderFacade.getOrderDetails.and.returnValue(of(null));
    mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of({}));
    mockCheckoutComGooglePayFacade.onPaymentAuthorized.and.returnValue(Promise.resolve(() => {
    }));
    checkoutDeliveryAddressFacade.getDeliveryAddressState.and.returnValue(of({
      loading: false,
      data: generateOneAddress(),
      error: false
    }));

    // @ts-ignore
    component["paymentsClient"] = {
      isReadyToPay: async () => ({ result: true }),
      loadPaymentData: async () => googlePayAuth
    };
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit buttonGooglePayClicked event when googlePayButtonClicked() is called with expressCheckout enabled", () => {
    spyOn(component.buttonGooglePayClicked, "emit");
    component.expressCheckout = true;

    component.googlePayButtonClicked();

    expect(component.buttonGooglePayClicked.emit).toHaveBeenCalledWith(true);
  });

  it("should call initBtn() when googlePayButtonClicked() is called with expressCheckout disabled", () => {
    // @ts-ignore
    spyOn(component, "initBtn");
    component.expressCheckout = false;

    component.googlePayButtonClicked();
    expect(component["initBtn"]).toHaveBeenCalled();
  });

  it("should call requestMerchantConfiguration in ngAfterViewInit when in browser", () => {
    spyOn(component["windowRef"], "isBrowser").and.returnValue(true);
    spyOn(component, "isGooglePayLoaded").and.returnValue(true);
    // @ts-ignore
    spyOn(component, "createdButton");
    component.gpayBtn = { nativeElement: {} } as any;

    component.ngAfterViewInit();

    expect(mockCheckoutComGooglePayFacade.requestMerchantConfiguration).toHaveBeenCalled();
    expect(component["createdButton"]).toHaveBeenCalled();
  });

  it("should validate if Google Pay is loaded", () => {
    (window as any).google = {
      payments: {
        api: {
          PaymentsClient: function() {
          }
        }
      }
    };

    expect(component.isGooglePayLoaded()).toBeTrue();
  });

  it("should call initBtn when newCart emits true in ngOnChanges", () => {
    // @ts-ignore
    spyOn(component, "initBtn");
    component.newCart = of(true);

    component.ngOnChanges({ newCart: { currentValue: of(true) } });
    expect(component["initBtn"]).toHaveBeenCalled();
  });

  describe("ngOnInit", () => {
    it("should initialize express payments client with valid merchant configuration", () => {
      const mockMerchantConfiguration = { clientSettings: {} };
      // @ts-ignore
      spyOn(component, "initExpressPaymentsClient");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfiguration));

      component["initBtn"]();
      const updatedData = {
        ...mockMerchantConfiguration,
        clientSettings: jasmine.objectContaining({
          paymentDataCallbacks: jasmine.objectContaining({
            onPaymentDataChanged: jasmine.any(Function) // Allow any function reference
          })
        })
      };

      expect(component["initExpressPaymentsClient"]).toHaveBeenCalledOnceWith(jasmine.objectContaining(updatedData));
    });

    it("should log error when merchant configuration retrieval fails", () => {
      const mockError = new Error("Test error");
      spyOn(component["logger"], "error");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(throwError(() => mockError));

      component["initBtn"]();

      expect(component["logger"].error).toHaveBeenCalledWith("initBtn with errors", { err: mockError });
    });
  });

  describe("ngAfterViewInit", () => {
    it("should call createdButton when Google Pay button is not already created and Google Pay is loaded", () => {
      spyOn(component, "isGooglePayLoaded").and.returnValue(true);
      // @ts-ignore
      spyOn(component, "createdButton");
      component.gpayBtn = { nativeElement: {} } as ElementRef;
      spyOn(component["windowRef"], "isBrowser").and.returnValue(true);
      spyOn(component["windowRef"].document, "getElementById").and.returnValue(null);

      component.ngAfterViewInit();
      expect(component["createdButton"]).toHaveBeenCalled();
    });

    it("should load Google Pay script and call createdButton when Google Pay is not loaded", () => {
      spyOn(component, "isGooglePayLoaded").and.returnValue(false);
      // @ts-ignore
      spyOn(component, "createdButton");
      component.gpayBtn = { nativeElement: {} } as ElementRef;
      spyOn(component["windowRef"], "isBrowser").and.returnValue(true);
      spyOn(component["windowRef"].document, "getElementById").and.returnValue(null);
      spyOn(component["ngZone"], "run").and.callFake((fn: Function) => fn());

      component.ngAfterViewInit();
      loadScript(component["windowRef"], "https://pay.google.com/gp/p/js/pay.js", () => {
        component["ngZone"].run(() => {
          component["createdButton"]();
        });
      });
      expect(component["createdButton"]).toHaveBeenCalled();
    });

    it("should call createdButton with existing button element", () => {
      const mockButton = {} as HTMLElement;
      // @ts-ignore
      spyOn(component, "createdButton");
      component.gpayBtn = { nativeElement: {} } as ElementRef;
      spyOn(component["windowRef"], "isBrowser").and.returnValue(true);
      spyOn(component["windowRef"].document, "getElementById").and.returnValue(mockButton);

      component.ngAfterViewInit();
      expect(component["createdButton"]).toHaveBeenCalledWith(mockButton);
    });

    it("should emit buttonGooglePayClicked event when expressCheckout is enabled", () => {
      spyOn(component.buttonGooglePayClicked, "emit");
      component.expressCheckout = true;

      component.googlePayButtonClicked();

      expect(component.buttonGooglePayClicked.emit).toHaveBeenCalledWith(true);
    });

    it("should call initBtn when expressCheckout is not enabled", () => {
      // @ts-ignore
      spyOn(component, "initBtn");
      component.expressCheckout = false;

      component.googlePayButtonClicked();
      expect(component["initBtn"]).toHaveBeenCalled();
    });

    it("should call initBtn when newCart emits true in ngOnChanges", () => {
      // @ts-ignore
      spyOn(component, "initBtn");
      component.newCart = of(true);

      component.ngOnChanges({ newCart: { currentValue: of(true) } });
      expect(component["initBtn"]).toHaveBeenCalled();
    });
  });

  describe("isGooglePayLoaded", () => {
    it("should return true when Google Pay is fully loaded", () => {
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function() {
            }
          }
        }
      };

      const result = component.isGooglePayLoaded();

      expect(result).toBe(true);
    });

    it("should return false when Google Pay is not loaded", () => {
      // @ts-expect-error - google pay module is not defined
      window.google = undefined;

      const result = component.isGooglePayLoaded();

      expect(result).toBe(false);
    });

    it("should return false when google.payments is not defined", () => {
      // @ts-expect-error - google pay module is not defined
      window.google = {};

      const result = component.isGooglePayLoaded();

      expect(result).toBe(false);
    });

    it("should return false when google.payments.api is not defined", () => {
      (window as any).google = {
        payments: {}
      };

      const result = component.isGooglePayLoaded();

      expect(result).toBe(false);
    });

    it("should return false when google.payments.api.PaymentsClient is not a function", () => {
      (window as any).google = {
        payments: {
          api: {}
        }
      };
      const result = component.isGooglePayLoaded();
      fixture.detectChanges();

      expect(result).toBe(false);
    });
  });

  describe("ngOnChanges", () => {
    it("should call initBtn when newCart emits true", () => {
      // @ts-ignore
      spyOn(component, "initBtn");
      component.newCart = of(true);

      component.ngOnChanges({ newCart: { currentValue: of(true) } });
      expect(component["initBtn"]).toHaveBeenCalled();
    });

    it("should not call initBtn when newCart emits false", () => {
      // @ts-ignore
      spyOn(component, "initBtn");
      component.newCart = of(false);

      component.ngOnChanges({ newCart: { currentValue: of(false) } });
      expect(component["initBtn"]).not.toHaveBeenCalled();
    });

    it("should log error when newCart subscription throws error", () => {
      const error = new Error("Test error");
      spyOn(component["logger"], "error");
      component.newCart = new Observable(observer => {
        observer.error(error);
      });

      component.ngOnChanges({ newCart: { currentValue: component.newCart } });
      expect(component["logger"].error).toHaveBeenCalledWith(error);
    });
  });

  describe("googlePayButtonClicked", () => {
    it("should emit buttonGooglePayClicked event with true when expressCheckout is enabled", () => {
      spyOn(component.buttonGooglePayClicked, "emit");
      component.expressCheckout = true;

      component.googlePayButtonClicked();

      expect(component.buttonGooglePayClicked.emit).toHaveBeenCalledWith(true);
    });

    it("should call initBtn when expressCheckout is not enabled", () => {
      // @ts-ignore
      spyOn(component, "initBtn");
      component.expressCheckout = false;

      component.googlePayButtonClicked();
      // @ts-ignore
      expect(component["initBtn"]).toHaveBeenCalled();
    });
  });

  describe("createdButton", () => {
    beforeEach(() => {
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function() {
              return {
                createButton: () => {
                  return mockButton;
                }
              };
            }
          }
        }
      };
      component["paymentsClient"].createButton = () => {
      };
    });
    it("should remove existing button element if idButton is provided", () => {
      const mockButton = { remove: jasmine.createSpy("remove") };
      component["createdButton"](mockButton as any);

      expect(mockButton.remove).toHaveBeenCalled();
    });

    it("should create a new Google Pay button and append it to gpayBtn element", () => {

      spyOn(component["renderer"], "setAttribute");
      spyOn(component["renderer"], "appendChild");
      component.gpayBtn = { nativeElement: { children: [] } } as ElementRef;

      component["createdButton"]();

      expect(component["renderer"].setAttribute).toHaveBeenCalledWith(component.gpayBtn.nativeElement, "id", "google-pay-button");
      expect(component["renderer"].appendChild).toHaveBeenCalledWith(component.gpayBtn.nativeElement, mockButton);
    });

    it("should not append a new button if gpayBtn element already has children", () => {
      const mockButton = {};
      spyOn(component["paymentsClient"], "createButton").and.returnValue(mockButton);
      spyOn(component["renderer"], "appendChild");
      component.gpayBtn = { nativeElement: { children: [{}] } } as ElementRef;

      component["createdButton"]();
      expect(component["renderer"].appendChild).not.toHaveBeenCalled();
    });
  });

  describe("initExpressPaymentsClient", () => {
    beforeEach(() => {
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function(value) {
              return {
                isReadyToPay: async () => ({ result: true }),
                createButton: () => mockButton,
                loadPaymentData: async () => googlePayAuth
              };
            }
          }
        }
      };
    });
    it("should initialize paymentsClient with provided client settings", async () => {
      const mockMerchantConfiguration = { clientSettings: {} };
      const mockIsReadyToPayResponse = { result: true };
      // @ts-ignore
      spyOn(component, "authorisePayment").and.callThrough();
      spyOn(component["paymentsClient"], "isReadyToPay").and.returnValue(Promise.resolve(mockIsReadyToPayResponse));
      spyOn((window as any).google.payments.api, "PaymentsClient").and.callThrough();
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfiguration));

      component.gpayBtn = { nativeElement: { children: [] } } as ElementRef;
      component["initExpressPaymentsClient"](mockMerchantConfiguration);
      await component["paymentsClient"].loadPaymentData().then();

      expect((window as any).google.payments.api.PaymentsClient).toHaveBeenCalledWith(mockMerchantConfiguration.clientSettings);
      // @ts-ignore
      expect(component.authorisePayment).toHaveBeenCalled();
      expect(mockCheckoutComGooglePayFacade.addPaymentExpressIntents).toHaveBeenCalled();
      expect(mockCheckoutComGooglePayFacade.createFullPaymentRequest).toHaveBeenCalled();
      expect(mockCheckoutComGooglePayFacade.onPaymentAuthorized).toHaveBeenCalled();
    });

    it("should call authorisePayment if isReadyToPay returns true", async () => {
      const mockMerchantConfiguration = { clientSettings: {} };
      const mockIsReadyToPayResponse = { result: true };
      // @ts-ignore
      spyOn(component, "authorisePayment");
      spyOn(component["paymentsClient"], "isReadyToPay").and.returnValue(Promise.resolve(mockIsReadyToPayResponse));
      let response = null;
      component["initExpressPaymentsClient"](mockMerchantConfiguration);
      await component["paymentsClient"].isReadyToPay().then((value) => {
        response = value.result;
      });

      expect(component["authorisePayment"]).toHaveBeenCalled();
      expect(response).toBeTrue();
    });

    it("should not call authorisePayment if isReadyToPay returns false", async () => {
      const mockIsReadyToPayResponse = { result: false };
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function(value) {
              return {
                isReadyToPay: async () => (mockIsReadyToPayResponse),
                createButton: () => {
                  return mockButton;
                }
              };
            },
            loadPaymentData: async () => googlePayAuth
          }
        }
      };
      // @ts-ignore
      spyOn(component, "authorisePayment");
      let response = null;
      spyOn(component["paymentsClient"], "isReadyToPay").and.returnValue(Promise.resolve(mockIsReadyToPayResponse));
      await component["paymentsClient"].isReadyToPay().then((value) => {
        response = value.result;
      });

      expect(component["authorisePayment"]).not.toHaveBeenCalled();
      expect(response).toBeFalse();
    });

    it("should log an error if isReadyToPay throws an error", fakeAsync(async () => {
      const mockError = "Error Message";
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function(value) {
              return {
                isReadyToPay: async () => Promise.reject(mockError),
                createButton: () => mockButton,
                loadPaymentData: async () => googlePayAuth
              };
            }
          }
        }
      };
      const mockMerchantConfiguration = { clientSettings: {} };
      spyOn(component["logger"], "error");

      fixture.detectChanges();
      try {
        await component["paymentsClient"].isReadyToPay({}).then().catch();
      } catch {

      }

      component["initExpressPaymentsClient"](mockMerchantConfiguration);
      tick();
      expect(component["logger"].error).toHaveBeenCalledWith("failed to initialize googlepay", mockError);
    }));
  });

  describe("authorisePayment", () => {
    beforeEach(() => {
      (window as any).google = {
        payments: {
          api: {
            PaymentsClient: function(value) {
              return {
                isReadyToPay: async () => ({ result: true }),
                createButton: () => mockButton,
                loadPaymentData: async () => googlePayAuth
              };
            }
          }
        }
      };
    });

    it("should call onPaymentAuthorized when loadPaymentData resolves", fakeAsync(() => {
      const mockMerchantConfiguration = { clientSettings: {} };
      const mockPaymentRequest = {};
      const mockPaymentDataRequest = {};
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfiguration));
      mockCheckoutComGooglePayFacade.createFullPaymentRequest.and.returnValue(mockPaymentRequest);
      mockCheckoutComGooglePayFacade.addPaymentExpressIntents.and.returnValue(mockPaymentDataRequest);
      mockCheckoutComGooglePayFacade.onPaymentAuthorized.and.returnValue(Promise.resolve());
      spyOn(component["paymentsClient"], "loadPaymentData").and.returnValue(Promise.resolve(mockPaymentRequest));

      component["authorisePayment"]();
      tick();

      expect(mockCheckoutComGooglePayFacade.onPaymentAuthorized).toHaveBeenCalledWith(mockPaymentRequest);
    }));

    it("should log error when loadPaymentData rejects", fakeAsync(() => {
      const mockMerchantConfiguration = { clientSettings: {} };
      const mockPaymentRequest = {};
      const mockPaymentDataRequest = {};
      const mockError = new Error("Test error");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(of(mockMerchantConfiguration));
      mockCheckoutComGooglePayFacade.createFullPaymentRequest.and.returnValue(mockPaymentRequest);
      mockCheckoutComGooglePayFacade.addPaymentExpressIntents.and.returnValue(mockPaymentDataRequest);
      spyOn(component["paymentsClient"], "loadPaymentData").and.returnValue(Promise.reject(mockError));
      spyOn(component["logger"], "error");

      component["authorisePayment"]();
      tick();

      expect(component["logger"].error).toHaveBeenCalledWith("Error loading payment data:", mockError);
    }));

    it("should log error when getMerchantConfigurationFromState subscription throws error", () => {
      const mockError = new Error("Test error");
      mockCheckoutComGooglePayFacade.getMerchantConfigurationFromState.and.returnValue(throwError(mockError));
      spyOn(component["logger"], "error");

      component["authorisePayment"]();

      expect(component["logger"].error).toHaveBeenCalledWith("authorisePayment with errors", { err: mockError });
    });
  });
});
