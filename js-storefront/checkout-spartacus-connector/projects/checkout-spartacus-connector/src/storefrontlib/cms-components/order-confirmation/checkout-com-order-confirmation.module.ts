import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComCartSharedModule } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-shared.module';
import { CheckoutComOrderOverviewComponent } from '@checkout-components/checkout-com-order-overview/checkout-com-order-overview.component';
import {
  CheckoutComOrderConfirmationItemsComponent
} from '@checkout-components/order-confirmation/checkout-com-order-confirmation-items/checkout-com-order-confirmation-items.component';
import {
  CheckoutComOrderConfirmationShippingComponent
} from '@checkout-components/order-confirmation/checkout-com-order-confirmation-shipping/checkout-com-order-confirmation-shipping.component';
import { CheckoutComOrderDetailBillingComponent } from '@checkout-components/order-details/checkout-com-order-detail-billing/checkout-com-order-detail-billing.component';
import { CheckoutComOrderDetailBillingModule } from '@checkout-components/order-details/checkout-com-order-detail-billing/checkout-com-order-detail-billing.module';
import { CheckoutComOrderConfirmationGuard } from '@checkout-core/guards/checkout-com-order-confirmation.guard';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { AbstractOrderContextModule } from '@spartacus/cart/base/components';
import { CmsConfig, FeaturesConfigModule, I18nModule, provideConfig, } from '@spartacus/core';
import { OrderConfirmationThankYouMessageComponent, OrderDetailsService, OrderOverviewComponent } from '@spartacus/order/components';
import { OrderFacade, } from '@spartacus/order/root';
import { CardModule, FormErrorsModule, OutletModule, PasswordVisibilityToggleModule, PromotionsModule, PwaModule, } from '@spartacus/storefront';
import { CheckoutComOrderConfirmationTotalsComponent } from './checkout-com-order-confirmation-totals/checkout-com-order-confirmation-totals.component';

// eslint-disable-next-line @typescript-eslint/typedef
const orderConfirmationComponents = [
  CheckoutComOrderConfirmationItemsComponent,
  CheckoutComOrderConfirmationTotalsComponent,
  CheckoutComOrderConfirmationShippingComponent,
];

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    PwaModule,
    PromotionsModule,
    I18nModule,
    ReactiveFormsModule,
    FormErrorsModule,
    OutletModule,
    AbstractOrderContextModule,
    PasswordVisibilityToggleModule,
    FeaturesConfigModule,
    PasswordVisibilityToggleModule,
    FeaturesConfigModule,
    CheckoutComOrderDetailBillingModule,
    CheckoutComCartSharedModule,
  ],
  providers: [
    provideConfig(<CmsConfig>{
      cmsComponents: {
        OrderConfirmationThankMessageComponent: {
          component: OrderConfirmationThankYouMessageComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },
        ReplenishmentConfirmationMessageComponent: {
          component: OrderConfirmationThankYouMessageComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },

        OrderConfirmationItemsComponent: {
          component: CheckoutComOrderConfirmationItemsComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },
        ReplenishmentConfirmationItemsComponent: {
          component: CheckoutComOrderConfirmationItemsComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },

        OrderConfirmationTotalsComponent: {
          component: CheckoutComOrderConfirmationTotalsComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },
        ReplenishmentConfirmationTotalsComponent: {
          component: CheckoutComOrderConfirmationTotalsComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },

        OrderConfirmationOverviewComponent: {
          component: CheckoutComOrderOverviewComponent,
          providers: [
            {
              provide: OrderDetailsService,
              useExisting: OrderFacade,
            },
          ],
          guards: [CheckoutComOrderConfirmationGuard],
        },
        ReplenishmentConfirmationOverviewComponent: {
          component: OrderOverviewComponent,
          providers: [
            {
              provide: OrderDetailsService,
              useExisting: CheckoutComOrderFacade,
            },
          ],
          guards: [CheckoutComOrderConfirmationGuard],
        },

        OrderConfirmationShippingComponent: {
          component: CheckoutComOrderConfirmationShippingComponent,
          guards: [CheckoutComOrderConfirmationGuard],
        },

        OrderConfirmationBillingComponent: {
          component: CheckoutComOrderDetailBillingComponent,
          providers: [
            {
              provide: OrderDetailsService,
              useExisting: CheckoutComOrderFacade,
            },
          ],
          guards: [CheckoutComOrderConfirmationGuard],
        },
      },
    }),
  ],
  declarations: [...orderConfirmationComponents],
  exports: [...orderConfirmationComponents],
})
export class CheckoutComOrderConfirmationModule {
}
