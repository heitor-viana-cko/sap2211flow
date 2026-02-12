import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CheckoutComOrderSummaryComponent } from '@checkout-components/checkout-com-cart-shared/checkout-com-order-summary/checkout-com-order-summary.component';
import {
  CheckoutComOrderConfirmationTotalsComponent
} from '@checkout-components/order-confirmation/checkout-com-order-confirmation-totals/checkout-com-order-confirmation-totals.component';
import { MockCheckoutComOrderSummaryComponent } from '@checkout-tests/components/lib-checkout-com-order-summary-component.mock';
import { I18nTestingModule } from '@spartacus/core';
import { OrderFacade } from '@spartacus/order/root';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

class MockOrderFacade implements Partial<OrderFacade> {
  getOrderDetails = createSpy().and.returnValue(
    of({
      code: 'test-code-412',
    })
  );

  clearPlacedOrder() {
  }
}

describe('OrderConfirmationTotalsComponent', () => {
  let component: CheckoutComOrderConfirmationTotalsComponent;
  let fixture: ComponentFixture<CheckoutComOrderConfirmationTotalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [
        CheckoutComOrderConfirmationTotalsComponent,
        MockCheckoutComOrderSummaryComponent,
      ],
      providers: [{
        provide: OrderFacade,
        useClass: MockOrderFacade
      }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComOrderConfirmationTotalsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
