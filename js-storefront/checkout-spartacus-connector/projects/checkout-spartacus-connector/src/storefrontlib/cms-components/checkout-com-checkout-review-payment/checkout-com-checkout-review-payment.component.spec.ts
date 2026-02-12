import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { getTextContentByCss, getTextContentByDebugElement, queryAllDebugElementsByCss, queryDebugElementByCss } from '@checkout-tests/finders.mock';
import { MockUrlPipe } from '@checkout-tests/pipes';
import { MockCheckoutComCheckoutBillingAddressFacade } from '@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { checkoutComMockPaymentDetails } from '@checkout-tests/services/checkout-com-payment.facade.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutStep, CheckoutStepType } from '@spartacus/checkout/base/root';
import { I18nTestingModule, PaymentDetails, QueryState, TranslationService } from '@spartacus/core';
import { CardComponent, IconTestingModule } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { CheckoutComCheckoutReviewPaymentComponent } from './checkout-com-checkout-review-payment.component';
import createSpy = jasmine.createSpy;

const mockCheckoutStep: CheckoutStep = {
  id: 'step',
  name: 'name',
  routeName: '/route',
  type: [CheckoutStepType.PAYMENT_DETAILS]
};

class MockCheckoutPaymentFacade implements Partial<CheckoutComPaymentFacade> {
  getPaymentDetailsState(): Observable<QueryState<PaymentDetails | undefined>> {
    return of({
      loading: false,
      error: false,
      data: checkoutComMockPaymentDetails
    });
  };
}

class MockCheckoutStepService {
  steps$ = of([
    {
      id: 'step1',
      name: 'step1',
      routeName: 'route1',
      type: [CheckoutStepType.PAYMENT_DETAILS]
    }
  ]);
  getCheckoutStepRoute = createSpy().and.returnValue(
    mockCheckoutStep.routeName
  );
}

describe('CheckoutReviewPaymentComponent', () => {
  let component: CheckoutComCheckoutReviewPaymentComponent;
  let fixture: ComponentFixture<CheckoutComCheckoutReviewPaymentComponent>;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutStepService: CheckoutStepService;
  let checkoutComBillingAddressFormService: CheckoutComBillingAddressFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        I18nTestingModule,
        RouterTestingModule,
        IconTestingModule
      ],
      declarations: [
        CheckoutComCheckoutReviewPaymentComponent,
        MockUrlPipe,
        CardComponent
      ],
      providers: [
        {
          provide: CheckoutStepService,
          useClass: MockCheckoutStepService
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: CheckoutComBillingAddressFormService,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComCheckoutReviewPaymentComponent);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutStepService = TestBed.inject(CheckoutStepService);
    checkoutComBillingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to get paymentDetails', (done) => {
    spyOn(checkoutComFlowFacade, 'getPaymentDetailsState').and.returnValue(
      of({
        loading: false,
        error: false,
        data: checkoutComMockPaymentDetails
      })
    );
    component.paymentDetails$.subscribe((data) => {
      expect(data).toEqual(checkoutComMockPaymentDetails);
      done();
    });
  });

  it('should call getPaymentMethodCard(paymentDetails) to get payment card data', () => {
    component.getPaymentMethodCard(checkoutComMockPaymentDetails).subscribe((card) => {
      expect(card.title).toEqual('paymentForm.payment');
      expect(card.text).toEqual([
        checkoutComMockPaymentDetails.cardType?.name,
        checkoutComMockPaymentDetails.accountHolderName,
        checkoutComMockPaymentDetails.cardNumber,
        `paymentCard.expires month:${checkoutComMockPaymentDetails.expiryMonth} year:${checkoutComMockPaymentDetails.expiryYear}`
      ]);
    });
  });

  it('should call getBillingAddressCard to get billing address card data', () => {
    component.getBillingAddressCard(checkoutComMockPaymentDetails).subscribe((card) => {
      expect(card.title).toEqual('paymentForm.billingAddress');
      expect(card.text).toEqual([
        'addressCard.billTo',
        checkoutComMockPaymentDetails.billingAddress?.firstName +
        ' ' +
        checkoutComMockPaymentDetails.billingAddress?.lastName,
        checkoutComMockPaymentDetails.billingAddress?.line1,
        checkoutComMockPaymentDetails.billingAddress?.town +
        ', ' +
        checkoutComMockPaymentDetails.billingAddress?.region?.isocode +
        ', ' +
        checkoutComMockPaymentDetails.billingAddress?.country?.isocode,
        checkoutComMockPaymentDetails.billingAddress?.postalCode
      ]);
    });
  });

  it('should get checkout step route', () => {
    expect(component.paymentDetailsStepRoute).toEqual(
      mockCheckoutStep.routeName
    );
  });

  describe('Credit card payment details', () => {
    it('should get payment method card details with expiry date', (done) => {
      const paymentDetailsWithExpiry = {
        ...checkoutComMockPaymentDetails,
        expiryYear: '2023'
      };
      component.getPaymentMethodCard(paymentDetailsWithExpiry).subscribe((card) => {
        expect(card.title).toEqual('paymentForm.payment');
        expect(card.text).toEqual([
          'Visa',
          'John Doe',
          '123456789',
          'paymentCard.expires month:01 year:2023'
        ]);
        done();
      });
    });

    it('Credit card UI Elements should be displayed correctly', () => {
      spyOn(checkoutComFlowFacade, 'getPaymentDetailsState').and.returnValue(
        of({
          loading: false,
          error: false,
          data: checkoutComMockPaymentDetails
        })
      );
      const billingCard = queryDebugElementByCss(fixture, '[data-testid="billing-address"]');
      const billingCardComponent = billingCard.query(By.directive(CardComponent));
      const billingCardTitle = billingCardComponent.query(By.css('.cx-card-title'));
      expect(billingCardTitle).toBeTruthy();
      expect(getTextContentByCss(fixture, '[data-testid=billing-address] .cx-card-title')).toBe('paymentForm.billingAddress');
      const billingCardContent = queryAllDebugElementsByCss(fixture, '[data-testid="billing-address"] .cx-card-label-container .cx-card-label');
      const billingAddress = checkoutComMockPaymentDetails.billingAddress;
      expect(getTextContentByDebugElement(billingCardContent[0])).toBe('addressCard.billTo');
      expect(getTextContentByDebugElement(billingCardContent[1])).toBe(billingAddress.firstName + ' ' + billingAddress.lastName);
      expect(getTextContentByDebugElement(billingCardContent[2])).toBe(billingAddress.line1);
      expect(getTextContentByDebugElement(billingCardContent[3])).toBe(`${billingAddress.town}, ${billingAddress.region.isocode}, ${billingAddress.country.isocode}`);
      expect(getTextContentByDebugElement(billingCardContent[4])).toBe(billingAddress.postalCode);

      const paymentDetailsCard = queryDebugElementByCss(fixture, '[data-testid="payment-details"]');
      const paymentDetailsCardComponent = paymentDetailsCard.query(By.directive(CardComponent));
      const paymentDetailsCardTitle = paymentDetailsCardComponent.query(By.css('.cx-card-title'));
      expect(paymentDetailsCardTitle).toBeTruthy();
      expect(getTextContentByCss(fixture, '[data-testid="payment-details"] .cx-card-title')).toBe('paymentForm.payment');
      const paymentDetailsCardContent = queryAllDebugElementsByCss(fixture, '[data-testid="payment-details"] .cx-card-label-container .cx-card-label');
      expect(getTextContentByDebugElement(paymentDetailsCardContent[0])).toBe(checkoutComMockPaymentDetails.cardType.name);
      expect(getTextContentByDebugElement(paymentDetailsCardContent[1])).toBe(checkoutComMockPaymentDetails.accountHolderName);
      expect(getTextContentByDebugElement(paymentDetailsCardContent[2])).toBe(checkoutComMockPaymentDetails.cardNumber);
      expect(getTextContentByDebugElement(paymentDetailsCardContent[3])).toBe(
        `paymentCard.expires month:${checkoutComMockPaymentDetails.expiryMonth} year:${checkoutComMockPaymentDetails.expiryYear}`
      );
    });
  });

  describe('APM payment details', () => {
    const paymentDetailsWithApm = {
      id: '100',
      type: 'PayPal',
      expiryYear: undefined,
      billingAddress: checkoutComMockPaymentDetails.billingAddress
    };

    beforeEach(() => {
      spyOn(checkoutComFlowFacade, 'getPaymentDetailsState').and.returnValue(
        of({
          loading: false,
          error: false,
          data: paymentDetailsWithApm
        })
      );
      fixture = TestBed.createComponent(CheckoutComCheckoutReviewPaymentComponent);
      checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
      checkoutStepService = TestBed.inject(CheckoutStepService);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should get payment method card details with APM type', (done) => {
      component.getPaymentMethodCard(paymentDetailsWithApm).subscribe((card) => {
        expect(card.title).toEqual('paymentForm.payment');
        expect(card.text).toEqual([
          undefined,
          undefined,
          undefined,
          'paymentCard.apm apm:PayPal'
        ]);
        fixture.detectChanges();
        done();
      });
    });

    it('APM UI Elements should be displayed correctly', () => {
      const billingCard = queryDebugElementByCss(fixture, '[data-testid="billing-address"]');
      const billingCardComponent = billingCard.query(By.directive(CardComponent));
      const billingCardTitle = billingCardComponent.query(By.css('.cx-card-title'));
      expect(billingCardTitle).toBeTruthy();
      expect(getTextContentByCss(fixture, '[data-testid=billing-address] .cx-card-title')).toBe('paymentForm.billingAddress');
      const billingCardContent = queryAllDebugElementsByCss(fixture, '[data-testid="billing-address"] .cx-card-label-container .cx-card-label');
      const billingAddress = paymentDetailsWithApm.billingAddress;
      expect(getTextContentByDebugElement(billingCardContent[0])).toBe('addressCard.billTo');
      expect(getTextContentByDebugElement(billingCardContent[1])).toBe(billingAddress.firstName + ' ' + billingAddress.lastName);
      expect(getTextContentByDebugElement(billingCardContent[2])).toBe(billingAddress.line1);
      expect(getTextContentByDebugElement(billingCardContent[3])).toBe(`${billingAddress.town}, ${billingAddress.region.isocode}, ${billingAddress.country.isocode}`);
      expect(getTextContentByDebugElement(billingCardContent[4])).toBe(billingAddress.postalCode);

      const paymentDetailsCard = queryDebugElementByCss(fixture, '[data-testid="payment-details"]');
      const paymentDetailsCardComponent = paymentDetailsCard.query(By.directive(CardComponent));
      const paymentDetailsCardTitle = paymentDetailsCardComponent.query(By.css('.cx-card-title'));
      expect(paymentDetailsCardTitle).toBeTruthy();
      expect(getTextContentByCss(fixture, '[data-testid="payment-details"] .cx-card-title')).toBe('paymentForm.payment');
      const paymentDetailsCardContent = queryAllDebugElementsByCss(fixture, '[data-testid="payment-details"] .cx-card-label-container .cx-card-label');
      expect(getTextContentByDebugElement(paymentDetailsCardContent[0])).toBe('');
      expect(getTextContentByDebugElement(paymentDetailsCardContent[1])).toBe('');
      expect(getTextContentByDebugElement(paymentDetailsCardContent[2])).toBe('');
      expect(getTextContentByDebugElement(paymentDetailsCardContent[3])).toBe(`paymentCard.apm apm:${paymentDetailsWithApm.type}`);
    });
  });
});
