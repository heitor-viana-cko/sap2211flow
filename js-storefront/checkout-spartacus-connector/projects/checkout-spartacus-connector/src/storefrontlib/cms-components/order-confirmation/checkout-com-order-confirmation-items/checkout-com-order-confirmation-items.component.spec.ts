import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  CheckoutComOrderConfirmationItemsComponent
} from '@checkout-components/order-confirmation/checkout-com-order-confirmation-items/checkout-com-order-confirmation-items.component';
import { FeaturesConfig, I18nTestingModule } from '@spartacus/core';
import { OrderFacade } from '@spartacus/order/root';
import { PromotionsModule } from '@spartacus/storefront';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

class MockOrderFacade implements Partial<OrderFacade> {
  getOrderDetails = createSpy().and.returnValue(
    of({
      entries: [
        {
          entryNumber: 1,
          quantity: 1,
        },
      ],
    })
  );

  clearPlacedOrder() {
  }
}

describe('CheckoutComOrderConfirmationItemsComponent', () => {
  let component: CheckoutComOrderConfirmationItemsComponent;
  let fixture: ComponentFixture<CheckoutComOrderConfirmationItemsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, PromotionsModule],
      declarations: [CheckoutComOrderConfirmationItemsComponent],
      providers: [
        {
          provide: OrderFacade,
          useClass: MockOrderFacade
        },
        {
          provide: FeaturesConfig,
          useValue: {
            features: { level: '1.3' },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComOrderConfirmationItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
