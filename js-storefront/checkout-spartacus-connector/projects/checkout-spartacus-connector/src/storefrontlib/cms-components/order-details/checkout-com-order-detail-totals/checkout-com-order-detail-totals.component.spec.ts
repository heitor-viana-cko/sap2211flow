import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CheckoutComOrderDetailTotalsComponent } from '@checkout-components/order-details/checkout-com-order-detail-totals/checkout-com-order-detail-totals.component';
import { MockCheckoutComOrderSummaryComponent } from '@checkout-tests/components/lib-checkout-com-order-summary-component.mock';
import { OrderDetailsService } from '@spartacus/order/components';
import { Order } from '@spartacus/order/root';
import { OutletModule } from '@spartacus/storefront';
import { of } from 'rxjs';

const mockOrder: Order = {
  code: '1',
  statusDisplay: 'Shipped',
  deliveryAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: 'Buckingham Street 5',
    line2: '1A',
    phone: '(+11) 111 111 111',
    postalCode: 'MA8902',
    town: 'London',
    country: {
      isocode: 'UK',
    },
  },
  deliveryMode: {
    name: 'Standard order-detail-shipping',
    description: '3-5 days',
  },
  paymentInfo: {
    accountHolderName: 'John Smith',
    cardNumber: '************6206',
    expiryMonth: '12',
    expiryYear: '2026',
    cardType: {
      name: 'Visa',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      line1: 'Buckingham Street 5',
      line2: '1A',
      phone: '(+11) 111 111 111',
      postalCode: 'MA8902',
      town: 'London',
      country: {
        isocode: 'UK',
      },
    },
  },
  created: new Date('2019-02-11T13:02:58+0000'),
};

describe('CheckoutComOrderDetailTotalsComponent', () => {
  let component: CheckoutComOrderDetailTotalsComponent;
  let fixture: ComponentFixture<CheckoutComOrderDetailTotalsComponent>;
  let mockOrderDetailsService: OrderDetailsService;

  beforeEach(waitForAsync(() => {
    mockOrderDetailsService = <OrderDetailsService>{
      getOrderDetails() {
        return of(mockOrder);
      },
    };

    TestBed.configureTestingModule({
      imports: [OutletModule],
      providers: [
        { provide: OrderDetailsService, useValue: mockOrderDetailsService },
      ],
      declarations: [
        CheckoutComOrderDetailTotalsComponent,
        MockCheckoutComOrderSummaryComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComOrderDetailTotalsComponent);

    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ', () => {
    fixture.detectChanges();
    let order: Order;
    component.order$
      .subscribe((value) => {
        order = value;
      })
      .unsubscribe();
    expect(order).toEqual(mockOrder);
  });
});
