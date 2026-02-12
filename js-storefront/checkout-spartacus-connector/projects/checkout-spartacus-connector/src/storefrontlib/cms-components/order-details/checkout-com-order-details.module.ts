/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CheckoutComCartSharedModule } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-shared.module';
import { CheckoutComOrderOverviewComponent } from '@checkout-components/checkout-com-order-overview/checkout-com-order-overview.component';
import { CheckoutComOrderDetailBillingModule } from '@checkout-components/order-details/checkout-com-order-detail-billing/checkout-com-order-detail-billing.module';
import { CheckoutComOrderDetailItemsComponent } from '@checkout-components/order-details/checkout-com-order-detail-items/checkout-com-order-detail-items.component';
import { CheckoutComOrderDetailTotalsComponent } from '@checkout-components/order-details/checkout-com-order-detail-totals/checkout-com-order-detail-totals.component';
import { AbstractOrderContextModule } from '@spartacus/cart/base/components';
import { AddToCartModule } from '@spartacus/cart/base/components/add-to-cart';
import { AuthGuard, CmsConfig, FeaturesConfigModule, I18nModule, provideConfig, UrlModule, } from '@spartacus/core';
import { OrderDetailsModule } from '@spartacus/order/components';
import { CardModule, IconModule, KeyboardFocusModule, OutletModule, PromotionsModule, SpinnerModule, } from '@spartacus/storefront';

// eslint-disable-next-line @typescript-eslint/typedef
const moduleComponents = [
  CheckoutComOrderDetailTotalsComponent,
  CheckoutComOrderDetailItemsComponent,
  CheckoutComOrderOverviewComponent,
];

@NgModule({
  imports: [
    CardModule,
    CommonModule,
    I18nModule,
    FeaturesConfigModule,
    PromotionsModule,
    UrlModule,
    SpinnerModule,
    RouterModule,
    AddToCartModule,
    KeyboardFocusModule,
    IconModule,
    AbstractOrderContextModule,
    OrderDetailsModule,
    CheckoutComCartSharedModule,
    OutletModule,
    CheckoutComOrderDetailBillingModule,
  ],
  providers: [
    provideConfig(<CmsConfig>{
      cmsComponents: {
        AccountOrderDetailsItemsComponent: {
          component: CheckoutComOrderDetailItemsComponent,
          guards: [AuthGuard],
          data: {
            enableAddToCart: true,
          },
        },
        AccountOrderDetailsGroupedItemsComponent: {
          component: CheckoutComOrderDetailItemsComponent,
          guards: [AuthGuard],
          data: {
            enableAddToCart: true,
            groupCartItems: true,
          },
        },
        AccountOrderDetailsTotalsComponent: {
          component: CheckoutComOrderDetailTotalsComponent,
          guards: [AuthGuard],
        },
        AccountOrderDetailsOverviewComponent: {
          component: CheckoutComOrderOverviewComponent,
          guards: [AuthGuard],
        },
        AccountOrderDetailsSimpleOverviewComponent: {
          component: CheckoutComOrderOverviewComponent,
          guards: [AuthGuard],
          data: {
            simple: true,
          },
        },
        OrderDetailItemsComponent: {
          component: CheckoutComOrderDetailItemsComponent,
        },
      },
    }),
  ],
  declarations: [...moduleComponents],
  exports: [...moduleComponents],
})
export class CheckoutComOrderDetailsModule {
}
