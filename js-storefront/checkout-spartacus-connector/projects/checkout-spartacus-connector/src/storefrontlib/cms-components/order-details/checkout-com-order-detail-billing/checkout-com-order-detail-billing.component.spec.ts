import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CheckoutComOrderDetailBillingComponent } from '@checkout-components/order-details/checkout-com-order-detail-billing/checkout-com-order-detail-billing.component';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { I18nTestingModule, PaymentDetails, TranslationService } from '@spartacus/core';
import { OrderDetailsService } from '@spartacus/order/components';
import { Order } from '@spartacus/order/root';
import { LaunchDialogService } from '@spartacus/storefront';
import { of, throwError } from 'rxjs';

const mockPaymentDetails: PaymentDetails = {
  accountHolderName: 'Name',
  cardNumber: '123456789',
  cardType: {
    code: 'Visa',
    name: 'Visa'
  },
  expiryMonth: '01',
  expiryYear: '2022',
  cvn: '123',
  billingAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: '2343 test address',
    town: 'Montreal',
    region: {
      isocode: 'QC',
    },
    country: {
      isocode: 'CAN',
    },
    postalCode: 'H2N 1E3',
  },
};

const mockOrder: Order = {
  code: '1',
  statusDisplay: 'Shipped',
};

class MockOrderDetailsService {
  getOrderDetails() {
    return of(mockOrder);
  }
}

describe('OrderDetailBillingComponent', () => {
  let component: CheckoutComOrderDetailBillingComponent;
  let fixture: ComponentFixture<CheckoutComOrderDetailBillingComponent>;
  let orderDetailsService: OrderDetailsService;
  let translationService: TranslationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [CheckoutComOrderDetailBillingComponent],
      providers: [
        {
          provide: OrderDetailsService,
          useClass: MockOrderDetailsService,
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComOrderDetailBillingComponent);
    component = fixture.componentInstance;
    orderDetailsService = TestBed.inject(OrderDetailsService);
    translationService = TestBed.inject(TranslationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getPaymentMethodCard(paymentDetails) to get payment card data', () => {
    component.getPaymentMethodCard(mockPaymentDetails).subscribe((card) => {
      expect(card.title).toEqual('paymentForm.payment');
      expect(card.text).toEqual([
        mockPaymentDetails.cardType?.name,
        mockPaymentDetails.accountHolderName,
        mockPaymentDetails.cardNumber,
        `paymentCard.expires month:${mockPaymentDetails.expiryMonth} year:${mockPaymentDetails.expiryYear}`,
      ]);
    });
  });

  it('should call getBillingAddressCard to get billing address card data', () => {
    component.getBillingAddressCard(mockPaymentDetails).subscribe((card) => {
      expect(card.title).toEqual('paymentForm.billingAddress');
      expect(card.text).toEqual([
        'addressCard.billTo',
        mockPaymentDetails.billingAddress?.firstName +
        ' ' +
        mockPaymentDetails.billingAddress?.lastName,
        mockPaymentDetails.billingAddress?.line1,
        mockPaymentDetails.billingAddress?.town +
        ', ' +
        mockPaymentDetails.billingAddress?.region?.isocode +
        ', ' +
        mockPaymentDetails.billingAddress?.country?.isocode,
        mockPaymentDetails.billingAddress?.postalCode,
      ]);
    });
  });

  it('should be false when isPaymentInfoCardFull is called with partial card info', () => {
    expect(
      component.isPaymentInfoCardFull({
        ...mockPaymentDetails,
        expiryMonth: '',
      })
    ).toBeFalsy();

    expect(component.isPaymentInfoCardFull(mockPaymentDetails)).toBeTruthy();
  });

  it('should return a card with translated payment and apm text', (done) => {
  const apm = 'PayPal';
  component.getApmInfoCard(apm).subscribe((card) => {
    expect(card.title).toEqual('paymentForm.payment');
    expect(card.text).toEqual([undefined, null, null, 'paymentCard.apm apm:PayPal']);
    done();
  });
});

it('should return true if payment info is available', () => {
  const order: Order = { paymentInfo: {} } as Order;
  expect(component.isApmInfoCard(order)).toBeTrue();
});

it('should return false if payment info is not available', () => {
  const order: Order = { paymentInfo: null } as Order;
  expect(component.isApmInfoCard(order)).toBeFalse();
});

  describe('order$', () => {
    it('should return order with checkoutComPaymentInfo if available', (done) => {
      const mockOrderWithCheckoutComPaymentInfo: Order = {
        ...mockOrder,
        checkoutComPaymentInfo: mockPaymentDetails,
      };
      spyOn(orderDetailsService, 'getOrderDetails').and.returnValue(of(mockOrderWithCheckoutComPaymentInfo));
      fixture = TestBed.createComponent(CheckoutComOrderDetailBillingComponent);
      component = fixture.componentInstance;

      component.order$.subscribe((order) => {
        expect(order?.paymentInfo).toEqual(mockPaymentDetails);
        done();
      });
    });

    it('should return order with paymentInfo if checkoutComPaymentInfo is not available', (done) => {
      const mockOrderWithPaymentInfo: Order = {
        ...mockOrder,
        paymentInfo: mockPaymentDetails,
      };
      spyOn(orderDetailsService, 'getOrderDetails').and.returnValue(of(mockOrderWithPaymentInfo));
      fixture = TestBed.createComponent(CheckoutComOrderDetailBillingComponent);
      component = fixture.componentInstance;

      component.order$.subscribe((order) => {
        expect(order?.paymentInfo).toEqual(mockPaymentDetails);
        done();
      });
    });

    it('should return undefined if order is undefined', (done) => {
      spyOn(orderDetailsService, 'getOrderDetails').and.returnValue(of(undefined));
      fixture = TestBed.createComponent(CheckoutComOrderDetailBillingComponent);
      component = fixture.componentInstance;

      component.order$.subscribe((order) => {
        expect(order).toBeUndefined();
        done();
      });
    });

    it('should return order with paymentInfo as null if both checkoutComPaymentInfo and paymentInfo are not available', (done) => {
      const mockOrderWithoutPaymentInfo: Order = {
        ...mockOrder,
        checkoutComPaymentInfo: null,
        paymentInfo: null,
      };
      spyOn(orderDetailsService, 'getOrderDetails').and.returnValue(of(mockOrderWithoutPaymentInfo));
      fixture = TestBed.createComponent(CheckoutComOrderDetailBillingComponent);
      component = fixture.componentInstance;

      component.order$.subscribe((order) => {
        expect(order?.paymentInfo).toBeNull();
        done();
      });
    });
  });

  describe('getApmInfoCard', () => {
    it('should return a card with translated payment and apm text', (done) => {
      const apm = 'PayPal';
      component.getApmInfoCard(apm).subscribe((card) => {
        expect(card.title).toEqual('paymentForm.payment');
        expect(card.text).toEqual([undefined, null, null, 'paymentCard.apm apm:PayPal']);
        done();
      });
    });

    it('should handle translation errors gracefully', (done) => {
      const apm = 'PayPal';
      spyOn(translationService, 'translate').and.returnValue(throwError(() => new Error('Translation error')));

      component.getApmInfoCard(apm).subscribe({
        next: () => fail('Expected an error, but got a card'),
        error: (error) => {
          expect(error.message).toEqual('Translation error');
          done();
        }
      });
    });

    it('should return a card with null values if translation service returns null', (done) => {
      const apm = 'PayPal';
      spyOn(translationService, 'translate').and.returnValue(of(null));

      component.getApmInfoCard(apm).subscribe((card) => {
        expect(card.title).toBeNull();
        expect(card.text).toEqual([ undefined, null, null, null ]);
        done();
      });
    });
  });
});
