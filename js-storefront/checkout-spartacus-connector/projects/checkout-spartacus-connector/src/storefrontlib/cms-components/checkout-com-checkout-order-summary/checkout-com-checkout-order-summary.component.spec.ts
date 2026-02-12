import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CheckoutComCheckoutOrderSummaryComponent } from '@checkout-components/checkout-com-checkout-order-summary/checkout-com-checkout-order-summary.component';
import { MockCheckoutComOrderSummaryComponent } from '@checkout-tests/components/lib-checkout-com-order-summary-component.mock';
import { MockCxFeatureLevelDirective } from '@checkout-tests/directives/cx-feature-level.directive.mock';
import {
  AppliedCouponsComponent,
  OrderSummaryComponent,
} from '@spartacus/cart/base/components';
import { ActiveCartFacade, Cart } from '@spartacus/cart/base/root';
import { I18nTestingModule } from '@spartacus/core';
import { PromotionsComponent } from '@spartacus/storefront';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

class MockActiveCartService implements Partial<ActiveCartFacade> {
  getActive = createSpy().and.returnValue(
    of(<Partial<Cart>>{
      totalItems: 5141,
      subTotal: { formattedValue: '11119' },
    })
  );
}

describe('CheckoutOrderSummaryComponent', () => {
  let component: CheckoutComCheckoutOrderSummaryComponent;
  let fixture: ComponentFixture<CheckoutComCheckoutOrderSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [
        CheckoutComCheckoutOrderSummaryComponent,
        MockCheckoutComOrderSummaryComponent,
        PromotionsComponent,
        AppliedCouponsComponent,
        MockCxFeatureLevelDirective,
      ],
      providers: [
        { provide: ActiveCartFacade, useClass: MockActiveCartService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComCheckoutOrderSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
