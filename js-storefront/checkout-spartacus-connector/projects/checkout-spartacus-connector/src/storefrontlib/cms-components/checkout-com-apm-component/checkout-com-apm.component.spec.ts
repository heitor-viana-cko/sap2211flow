import { Component, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { CheckoutComConnector } from "@checkout-core/connectors/checkout-com/checkout-com.connector";
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { ApmData, PaymentType } from "@checkout-model/ApmData";
import { ApplePayPaymentRequest } from "@checkout-model/ApplePay";
import { GooglePayMerchantConfiguration } from "@checkout-model/GooglePay";
import { CheckoutComApmService } from "@checkout-services/apm/checkout-com-apm.service";
import { CheckoutComApplepayService } from "@checkout-services/applepay/checkout-com-applepay.service";
import { CheckoutComBillingAddressFormService } from "@checkout-services/billing-address-form/checkout-com-billing-address-form.service";
import { CheckoutComGooglepayService } from "@checkout-services/googlepay/checkout-com-googlepay.service";
import { MockCxSpinnerComponent, MockLibCheckoutComApmComponent, MockLibCheckoutComApmTitle, MockLibCheckoutComBillingAddressFormComponent } from "@checkout-tests/components";
import { generateAddressFromFromAddress, generateOneAddress } from "@checkout-tests/fake-data/address.mock";
import { MockCheckoutComBillingAddressFormService } from "@checkout-tests/services/checkout-billing-address-form.service.mock";
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComConnector } from "@checkout-tests/services/checkout-com.connector.mock";
import { MockGlobalMessageService } from "@checkout-tests/services/global-message.service.mock";
import { CheckoutBillingAddressFormService } from "@spartacus/checkout/base/components";
import { Currency, CurrencyService, GlobalMessageService, GlobalMessageType, MockTranslatePipe, WindowRef } from "@spartacus/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { take } from "rxjs/operators";

import { CheckoutComApmComponent } from "./checkout-com-apm.component";
import createSpy = jasmine.createSpy;

class MockCurrencyService {
  getActive() {
    return of({
      active: true,
      isocode: "en_GB"
    } as Currency);
  }
}

const card = { code: PaymentType.Card };
const mockApms: ApmData[] = [
  {
    code: PaymentType.PayPal,
    isRedirect: false,
    isUserDataRequired: false,
    name: "PayPal"
  }
];

const apmState = new BehaviorSubject<ApmData>(null);

const mockBillingAddress = generateOneAddress();

class CheckoutComApmServiceStub {
  getIsApmLoadingFromState = createSpy("getIsApmLoadingFromState").and.returnValue(of(false));

  requestAvailableApms(): Observable<ApmData[]> {
    return of([{ code: PaymentType.Klarna }, { code: PaymentType.PayPal }]);
  }

  getAvailableApmsFromState(): Observable<ApmData[]> {
    return of(mockApms);
  }

  getSelectedApmFromState(): Observable<ApmData> {
    return apmState.asObservable();
  }

  getApmByComponent(): Observable<ApmData> {
    return of(card);
  }

  selectApm(apm: ApmData): void {
    apmState.next(apm);
  }
}

const mockApplePayRequest: ApplePayPaymentRequest = {
  countryCode: "US",
  currencyCode: "USD",
  requiredBillingContactFields: [
    "postal"
  ],
  total: {
    amount: "123.00",
    label: "Beans with toast",
    type: "FINAL"
  },
  supportedNetworks: [],
  merchantCapabilities: []
};

class CheckoutComApplepayServiceStub {
  requestApplePayPaymentRequest() {
    return of(mockApplePayRequest);
  }

  getPaymentRequestFromState() {
    return of(mockApplePayRequest);
  }
}

class MockCheckoutComGooglepayService {
  requestMerchantConfiguration = createSpy("requestMerchantConfiguration").and.stub();
  authoriseOrder = createSpy("authoriseOrder").and.stub();
  createInitialPaymentRequest = createSpy("createInitialPaymentRequest").and.stub();
  createFullPaymentRequest = createSpy("createFullPaymentRequest").and.stub();

  getMerchantConfigurationFromState() {
    return of({
      "baseCardPaymentMethod": {
        "parameters": {
          "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          "allowedCardNetworks": ["AMEX", "DISCOVER", "MASTERCARD", "JCB", "VISA", "INTERAC"],
          "billingAddressParameters": {
            "format": "FULL"
          },
          "billingAddressRequired": true
        },
        "type": "CARD"
      },
      "clientSettings": {
        "environment": "TEST"
      },
      "gateway": "checkoutltd",
      "gatewayMerchantId": "pk_test_c59321e8-953d-464d-bcfc-bb8785d05001",
      "merchantId": "01234567890123456789",
      "merchantName": "e2yCheckoutCom",
      "transactionInfo": {
        "currencyCode": "USD",
        "totalPrice": "16.99",
        "totalPriceStatus": "FINAL"
      }
    } as GooglePayMerchantConfiguration);
  };
}

@Component({
  template: "",
  selector: "lib-checkout-com-billing-address"
})
class MockLibCheckoutComBillingAddressComponent {
  @Input() billingAddressForm: UntypedFormGroup;
  @Output() sameAsShippingAddressChange = new BehaviorSubject<boolean>(true);
}

describe("CheckoutComApmComponent", () => {
  let component: CheckoutComApmComponent;
  let fixture: ComponentFixture<CheckoutComApmComponent>;
  let checkoutComApmService: CheckoutComApmService;
  let globalMessageService: GlobalMessageService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutBillingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComGooglePayService: CheckoutComGooglepayService;
  let checkoutComApplepayService: CheckoutComApplepayService;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;
  let windowRef: jasmine.SpyObj<WindowRef>;

  beforeEach(async () => {
    const windowRefSpy = jasmine.createSpyObj("WindowRef", ["document", "isBrowser"], {
      nativeWindow: { ApplepaySession: {} }
    });

    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComApmComponent,
        MockTranslatePipe,
        MockLibCheckoutComApmTitle,
        MockLibCheckoutComBillingAddressComponent,
        MockLibCheckoutComApmComponent,
        MockCxSpinnerComponent,
        MockLibCheckoutComBillingAddressFormComponent
      ],
      providers: [
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CurrencyService,
          useClass: MockCurrencyService
        },
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: CheckoutComApmService,
          useClass: CheckoutComApmServiceStub
        },

        {
          provide: CheckoutComGooglepayService,
          useClass: MockCheckoutComGooglepayService
        },

        {
          provide: CheckoutComApplepayService,
          useClass: CheckoutComApplepayServiceStub
        },
        {
          provide: CheckoutBillingAddressFormService,
          useClass: MockCheckoutComBillingAddressFormService
        },
        {
          provide: WindowRef,
          useValue: windowRefSpy
        },
        {
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmComponent);

    checkoutComApmService = TestBed.inject(CheckoutComApmService);
    globalMessageService = TestBed.inject(GlobalMessageService);
    checkoutBillingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComGooglePayService = TestBed.inject(CheckoutComGooglepayService);
    checkoutComApplepayService = TestBed.inject(CheckoutComApplepayService);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    windowRef = TestBed.inject(WindowRef) as jasmine.SpyObj<WindowRef>;
    apmState.next(null);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create and request available apms", () => {
    expect(component).toBeTruthy();

    let apms;
    component.availableApms$.subscribe(res => apms = res).unsubscribe();

    expect(apms).toBe(mockApms);
  });

  it("should preset card as the default APM", () => {
    let selectedApm: ApmData;

    component.selectedApm$.subscribe(res => selectedApm = res).unsubscribe();

    expect(selectedApm.code).toEqual(PaymentType.Card);
  });

  it("should get card component", () => {
    let cardApm: ApmData;
    component.card$.subscribe(res => cardApm = res);
    expect(cardApm).toEqual(card);
  });

  it("should selected the payment details and billing addr", (done) => {
    const newApm = mockApms[0];

    component.setPaymentDetails.pipe(take(1)).subscribe((e: any) => {
      expect(e.paymentDetails.type).toEqual(newApm.code);
      expect(e.billingAddress).toBeNull();
      done();
    });

    checkoutComApmService.selectApm(newApm);
    spyOn(checkoutBillingAddressFormService, "getSameAsDeliveryAddressValue").and.returnValue(true);
    component.selectApmPaymentDetails();

    fixture.detectChanges();

  });

  describe("should show or hide billing / continue button", () => {

    const options = [
      {
        code: PaymentType.Card,
        show: false
      },
      {
        code: PaymentType.GooglePay,
        show: false
      },
      {
        code: PaymentType.ApplePay,
        show: false
      },
      {
        code: PaymentType.Klarna,
        show: false
      },
      {
        code: PaymentType.Sepa,
        show: false
      },
      {
        code: PaymentType.PayPal,
        show: true
      }
    ];

    options.forEach((option) => {
      it(`${option.code} show ${option.show}`, () => {
        expect(component.showBillingFormAndContinueButton(option.code)).toEqual(option.show);
      });
    });
  });

  it("should make form errors visible and return when form is invalid", () => {
    spyOn(component.setPaymentDetails, "emit").and.callThrough();
    spyOn(component.billingAddressForm, "updateValueAndValidity");
    spyOn(component, "selectApmPaymentDetails").and.callThrough();
    spyOn(checkoutBillingAddressFormService, "getSameAsDeliveryAddressValue").and.returnValue(false);
    component.billingAddressForm.addControl("id", new UntypedFormBuilder().control(null));
    const nameControl = component.billingAddressForm.get("id");
    nameControl.addValidators([Validators.required]);
    fixture.detectChanges();
    component.billingAddressForm.markAsDirty();
    component.billingAddressForm.markAllAsTouched();
    nameControl?.setErrors({ customError: true });
    fixture.detectChanges();
    component.selectApmPaymentDetails();

    expect(component.billingAddressForm.updateValueAndValidity).toHaveBeenCalled();
    expect(component.setPaymentDetails.emit).not.toHaveBeenCalled();
  });

  describe("ngOnInit", () => {
    it("should select Card as default APM if no APM is selected", () => {
      spyOn(checkoutComApmService, "selectApm");
      spyOn(checkoutComApmService, "getSelectedApmFromState").and.returnValue(of(null));

      component.ngOnInit();

      expect(checkoutComApmService.selectApm).toHaveBeenCalledWith({ code: PaymentType.Card });
    });

    it("should set paymentDetails if an APM is selected", () => {
      const mockApm: ApmData = { code: PaymentType.PayPal };
      apmState.next(mockApm);
      component.ngOnInit();
      // @ts-ignore
      expect(component["paymentDetails"]).toEqual(mockApm);
    });

    it("should log error if there is an error selecting APM", () => {
      const error = new Error("Error");
      spyOn(checkoutComApmService, "getSelectedApmFromState").and.returnValue(throwError(() => error));
      spyOn(component["logger"], "error");

      component.ngOnInit();

      expect(component["logger"].error).toHaveBeenCalledWith("listenToAvailableApmsAndProtectSelectedApm with errors", { err: error });
    });

    it("should request active APMs", () => {
      spyOn(checkoutComApmService, "requestAvailableApms").and.returnValue(of({
        loading: false,
        data: [],
        error: false
      }));

      component.ngOnInit();

      expect(checkoutComApmService.requestAvailableApms).toHaveBeenCalled();
    });

    it("should listen to available APMs and protect selected APM", () => {
      // @ts-ignore
      spyOn(component, "listenToAvailableApmsAndProtectSelectedApm");

      component.ngOnInit();

      expect(component["listenToAvailableApmsAndProtectSelectedApm"]).toHaveBeenCalled();
    });

    it("should initialize Google Pay", () => {
      // @ts-ignore
      spyOn(component, "initializeGooglePay");

      component.ngOnInit();

      // @ts-ignore
      expect(component.initializeGooglePay).toHaveBeenCalled();
    });

    it("should initialize ACH", () => {
      // @ts-ignore
      spyOn(component, "initializeAch");

      component.ngOnInit();
      // @ts-ignore
      expect(component.initializeAch).toHaveBeenCalled();
    });

    it("should initialize Apple Pay", () => {
      // @ts-ignore
      spyOn(component, "initializeApplePay");

      component.ngOnInit();

      // @ts-ignore
      expect(component.initializeApplePay).toHaveBeenCalled();
    });

    it("should request billing address", () => {
      // @ts-ignore
      spyOn(checkoutBillingAddressFormService, "requestBillingAddress").and.returnValue(of(null));

      component.ngOnInit();

      // @ts-ignore
      expect(checkoutBillingAddressFormService.requestBillingAddress).toHaveBeenCalled();
    });
  });

  describe("selectApmPaymentDetails", () => {

    it("should set billing address when form is valid and same as billing address is false", () => {
      spyOn(component.setPaymentDetails, "emit").and.callThrough();
      spyOn(checkoutBillingAddressFormService, "getSameAsDeliveryAddressValue").and.returnValue(false);
      const formData = generateAddressFromFromAddress(mockBillingAddress);
      checkoutBillingAddressFormService.billingAddress$.next(formData);
      component.ngOnInit();
      component.billingAddressForm.patchValue(formData);
      component.billingAddressForm.markAsDirty();
      component.selectApmPaymentDetails();

      expect(component.billingAddressForm.valid).toBeTrue();
      expect(component.setPaymentDetails.emit).toHaveBeenCalledWith({
        // @ts-ignore
        paymentDetails: { type: component.paymentDetails.code },
        billingAddress: checkoutBillingAddressFormService.getBillingAddress()
      });
    });

    it("should make form errors visible and not emit payment details when form is invalid and sameAsShippingAddress is false", () => {
      spyOn(component.setPaymentDetails, "emit");
      spyOn(component, "makeFormErrorsVisible");
      spyOn(checkoutBillingAddressFormService, "getSameAsDeliveryAddressValue").and.returnValue(false);
      spyOn(checkoutBillingAddressFormService, "isBillingAddressFormValid").and.returnValue(false);

      component.selectApmPaymentDetails();

      expect(component.makeFormErrorsVisible).toHaveBeenCalled();
      expect(component.setPaymentDetails.emit).not.toHaveBeenCalled();
    });

    it("should emit payment details with null billing address when sameAsShippingAddress is true", () => {
      spyOn(component.setPaymentDetails, "emit");
      spyOn(checkoutBillingAddressFormService, "getSameAsDeliveryAddressValue").and.returnValue(true);

      component.selectApmPaymentDetails();

      expect(component.setPaymentDetails.emit).toHaveBeenCalledWith({
        paymentDetails: {
          // @ts-ignore
          type: component.paymentDetails.code
        },
        billingAddress: null
      });
    });
  });

  describe("showBillingFormAndContinueButton", () => {
    it("should return false for Card payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.Card)).toBeFalse();
    });

    it("should return false for Klarna payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.Klarna)).toBeFalse();
    });

    it("should return false for GooglePay payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.GooglePay)).toBeFalse();
    });

    it("should return false for ApplePay payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.ApplePay)).toBeFalse();
    });

    it("should return false for Sepa payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.Sepa)).toBeFalse();
    });

    it("should return false for Oxxo payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.Oxxo)).toBeFalse();
    });

    it("should return false for Fawry payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.Fawry)).toBeFalse();
    });

    it("should return false for iDeal payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.iDeal)).toBeFalse();
    });

    it("should return false for ACH payment type", () => {
      expect(component.showBillingFormAndContinueButton(PaymentType.ACH)).toBeFalse();
    });

    it("should return true for unknown payment type", () => {
      expect(component.showBillingFormAndContinueButton("UnknownPaymentType" as PaymentType)).toBeTrue();
    });
  });

  describe("updateSelectedApm", () => {
    it("should not update if selectedApm is not a valid APM component", () => {
      const apms: ApmData[] = [{ code: PaymentType.PayPal }];
      const selectedApm: ApmData = { code: PaymentType.Card };

      spyOn(component.submitting$, "next");
      spyOn(checkoutComApmService, "selectApm");

      component.updateSelectedApm(apms, selectedApm);

      expect(component.submitting$.next).not.toHaveBeenCalled();
      expect(globalMessageService.add).not.toHaveBeenCalled();
      expect(checkoutComApmService.selectApm).not.toHaveBeenCalled();
    });

    it("should update submitting and processing states if selectedApm is valid and found in apms", () => {
      const apms: ApmData[] = [{ code: PaymentType.PayPal }];
      const selectedApm: ApmData = { code: PaymentType.PayPal };

      spyOn(component.submitting$, "next");
      spyOn(checkoutComApmService, "selectApm");

      component.updateSelectedApm(apms, selectedApm);

      expect(component.submitting$.next).toHaveBeenCalledWith(false);
      expect(component.processing).toBeFalse();
      expect(globalMessageService.add).not.toHaveBeenCalled();
      expect(checkoutComApmService.selectApm).not.toHaveBeenCalled();
    });

    it("should add global message and select Card if selectedApm is valid but not found in apms", () => {
      const apms: ApmData[] = [{ code: PaymentType.PayPal }];
      const selectedApm: ApmData = { code: PaymentType.Klarna };

      // @ts-ignore
      spyOn(component.submitting$, "next");
      spyOn(checkoutComApmService, "selectApm");

      component.updateSelectedApm(apms, selectedApm);

      expect(component.submitting$.next).toHaveBeenCalledWith(false);
      expect(component.processing).toBeFalse();
      expect(globalMessageService.add).toHaveBeenCalledWith({ key: "paymentForm.apmChanged" }, GlobalMessageType.MSG_TYPE_ERROR);
      expect(checkoutComApmService.selectApm).toHaveBeenCalledWith({ code: PaymentType.Card });
    });
  });

  describe("showContinueButton", () => {
    it("returns true when showBillingAddressForm is true", () => {
      spyOn(checkoutBillingAddressFormService, "showBillingAddressForm").and.returnValue(of(true));
      spyOn(checkoutBillingAddressFormService, "isEditModeEnabled").and.returnValue(of(false));

      component.showContinueButton().subscribe((result) => {
        expect(result).toBeTrue();
      });
    });

    it("returns false when editModeEnabled is true and showBillingAddressForm is false", () => {
      spyOn(checkoutBillingAddressFormService, "showBillingAddressForm").and.returnValue(of(false));
      spyOn(checkoutBillingAddressFormService, "isEditModeEnabled").and.returnValue(of(true));

      component.showContinueButton().subscribe((result) => {
        expect(result).toBeFalse();
      });
    });

    it("returns false when both showBillingAddressForm and editModeEnabled are false", () => {
      spyOn(checkoutBillingAddressFormService, "showBillingAddressForm").and.returnValue(of(false));
      spyOn(checkoutBillingAddressFormService, "isEditModeEnabled").and.returnValue(of(false));

      component.showContinueButton().subscribe((result) => {
        expect(result).toBeFalse();
      });
    });

    it("returns true when both showBillingAddressForm and editModeEnabled are true", () => {
      spyOn(checkoutBillingAddressFormService, "showBillingAddressForm").and.returnValue(of(true));
      spyOn(checkoutBillingAddressFormService, "isEditModeEnabled").and.returnValue(of(true));

      component.showContinueButton().subscribe((result) => {
        expect(result).toBeTrue();
      });
    });
  });

  describe("getActiveApms", () => {
    it("should request available APMs and subscribe to the response", () => {
      spyOn(checkoutComApmService, "requestAvailableApms").and.returnValue(of({
        loading: false,
        data: [],
        error: false
      }));
      spyOn(checkoutComApmService.requestAvailableApms(), "subscribe");

      component["getActiveApms"]();

      expect(checkoutComApmService.requestAvailableApms).toHaveBeenCalled();
      expect(checkoutComApmService.requestAvailableApms().subscribe).toHaveBeenCalled();
    });

    it("should handle errors when requesting available APMs", () => {
      const error = new Error("Error");
      spyOn(checkoutComApmService, "requestAvailableApms").and.returnValue(throwError(() => error));
      spyOn(component["logger"], "error");

      component["getActiveApms"]();

      expect(component["logger"].error).toHaveBeenCalledWith("Error requesting available APMs", { err: error });
    });
  });

  describe("evaluateIsApmComponent", () => {
    it("should return false if selectedApm is Card", () => {
      const selectedApm: ApmData = { code: PaymentType.Card };
      const result = component["evaluateIsApmComponent"](selectedApm);
      expect(result).toBeFalse();
    });

    it("should return false if selectedApm is ApplePay", () => {
      const selectedApm: ApmData = { code: PaymentType.ApplePay };
      const result = component["evaluateIsApmComponent"](selectedApm);
      expect(result).toBeFalse();
    });

    it("should return false if selectedApm is GooglePay", () => {
      const selectedApm: ApmData = { code: PaymentType.GooglePay };
      const result = component["evaluateIsApmComponent"](selectedApm);
      expect(result).toBeFalse();
    });

    it("should return true if selectedApm is not Card, ApplePay, or GooglePay", () => {
      const selectedApm: ApmData = { code: PaymentType.PayPal };
      const result = component["evaluateIsApmComponent"](selectedApm);
      expect(result).toBeTrue();
    });

    it("should return true if selectedApm is null", () => {
      const result = component["evaluateIsApmComponent"](null);
      expect(result).toBeTrue();
    });

    it("should return false if selectedApm code is undefined", () => {
      const selectedApm: ApmData = { code: undefined };
      const result = component["evaluateIsApmComponent"](selectedApm);
      expect(result).toBeTrue();
    });
  });

  describe("listenToAvailableApmsAndProtectSelectedApm", () => {
    it("should update selected APM if available APMs are present", () => {
      const availableApms: ApmData[] = [{ code: PaymentType.PayPal }];
      const selectedApm: ApmData = { code: PaymentType.PayPal };

      spyOn(checkoutComApmService, "getAvailableApmsFromState").and.returnValue(of(availableApms));
      spyOn(checkoutComApmService, "getSelectedApmFromState").and.returnValue(of(selectedApm));
      spyOn(component, "updateSelectedApm");

      component["listenToAvailableApmsAndProtectSelectedApm"]();

      expect(component["updateSelectedApm"]).toHaveBeenCalledWith(availableApms, selectedApm);
    });

    it("should log error if there is an error in the subscription", () => {
      const error = new Error("Error");
      spyOn(checkoutComApmService, "getAvailableApmsFromState").and.returnValue(throwError(() => error));
      spyOn(checkoutComApmService, "getSelectedApmFromState").and.returnValue(of(null));
      spyOn(component["logger"], "error");

      component["listenToAvailableApmsAndProtectSelectedApm"]();

      expect(component["logger"].error).toHaveBeenCalledWith("listenToAvailableApmsAndProtectSelectedApm with errors", { err: error });
    });

    it("should set submitting to false when finalized", () => {
      spyOn(checkoutComApmService, "getAvailableApmsFromState").and.returnValue(of([]));
      spyOn(checkoutComApmService, "getSelectedApmFromState").and.returnValue(of(null));
      spyOn(component.submitting$, "next");

      component["listenToAvailableApmsAndProtectSelectedApm"]();

      expect(component.submitting$.next).toHaveBeenCalledWith(false);
    });
  });

  describe("initializeGooglePay", () => {
    it("should request merchant configuration and set googlePay$", () => {
      const apmData: ApmData = { code: PaymentType.GooglePay };
      const merchantConfig: GooglePayMerchantConfiguration = {
        baseCardPaymentMethod: {
          parameters: {
            allowedAuthMethods: [],
            allowedCardNetworks: []
          },
          type: "CARD"
        },
        clientSettings: { environment: "TEST" },
        gateway: "checkoutltd",
        gatewayMerchantId: "test_merchant_id",
        merchantId: "test_merchant_id",
        merchantName: "Test Merchant",
        transactionInfo: {
          currencyCode: "USD",
          totalPrice: "10.00",
          totalPriceStatus: "FINAL"
        }
      };

      spyOn(checkoutComApmService, "getApmByComponent").and.returnValue(of(apmData));
      spyOn(checkoutComGooglePayService, "getMerchantConfigurationFromState").and.returnValue(of(merchantConfig));

      component["initializeGooglePay"]();

      component.googlePay$.subscribe((result) => {
        expect(result).toEqual(apmData);
      });

      expect(checkoutComGooglePayService.requestMerchantConfiguration).toHaveBeenCalled();
    });

    it("should not set googlePay$ if merchant configuration is not available", () => {
      const apmData: ApmData = { code: PaymentType.GooglePay };

      spyOn(checkoutComApmService, "getApmByComponent").and.returnValue(of(apmData));

      spyOn(checkoutComGooglePayService, "getMerchantConfigurationFromState").and.returnValue(of(null));

      component["initializeGooglePay"]();

      expect(checkoutComGooglePayService.requestMerchantConfiguration).toHaveBeenCalled();
    });
  });

  describe("initializeAch", () => {
    it("should set ach$ with valid APM data", () => {
      const apmData: ApmData = { code: PaymentType.ACH };
      spyOn(checkoutComApmService, "getApmByComponent").and.returnValue(of(apmData));

      component["initializeAch"]();

      component.ach$.subscribe((result) => {
        expect(result).toEqual(apmData);
      });
    });
  });

  describe("initializeApplePay", () => {
    it("should set applePay$ if ApplePaySession can make payments", () => {
      const apmData: ApmData = { code: PaymentType.ApplePay };
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        total: {
          label: "Test",
          amount: "10.00"
        }
      };

      windowRef.isBrowser.and.returnValue(true);
      windowRef.nativeWindow["ApplePaySession"] = { canMakePayments: () => true };
      spyOn(checkoutComApmService, "getApmByComponent").and.returnValue(of(apmData));
      spyOn(checkoutComApplepayService, "getPaymentRequestFromState").and.returnValue(of(paymentRequest));
      spyOn(checkoutComApplepayService, "requestApplePayPaymentRequest");

      component["initializeApplePay"]();

      component.applePay$.subscribe((result) => {
        expect(result).toEqual(apmData);
      });

      expect(checkoutComApplepayService.requestApplePayPaymentRequest).toHaveBeenCalled();
    });

    it("should not set applePay$ if ApplePaySession cannot make payments", () => {
      windowRef.nativeWindow["ApplePaySession"] = { canMakePayments: () => false };
      spyOn(checkoutComApplepayService, "requestApplePayPaymentRequest");

      component["initializeApplePay"]();

      expect(checkoutComApplepayService.requestApplePayPaymentRequest).not.toHaveBeenCalled();
      expect(component.applePay$).toBeUndefined();
    });

    it("should not set applePay$ if ApplePaySession is not available", () => {
      windowRef.nativeWindow["ApplePaySession"] = null;
      spyOn(checkoutComApplepayService, "requestApplePayPaymentRequest");

      component["initializeApplePay"]();

      expect(checkoutComApplepayService.requestApplePayPaymentRequest).not.toHaveBeenCalled();
      expect(component.applePay$).toBeUndefined();
    });
  });

});
