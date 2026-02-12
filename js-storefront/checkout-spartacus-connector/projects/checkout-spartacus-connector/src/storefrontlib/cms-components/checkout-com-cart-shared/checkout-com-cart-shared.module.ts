/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  CheckoutComCartItemValidationWarningModule
} from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-item-warning/checkout-com-cart-item-validation-warning.module';
import { CheckoutComCheckoutOrderSummaryComponent } from '@checkout-components/checkout-com-checkout-order-summary/checkout-com-checkout-order-summary.component';
import { AbstractOrderContextModule, CartCouponModule } from '@spartacus/cart/base/components';
import { AddToCartModule } from '@spartacus/cart/base/components/add-to-cart';
import { CartOutlets } from '@spartacus/cart/base/root';
import { CmsConfig, FeaturesConfigModule, I18nModule, provideConfig, UrlModule } from '@spartacus/core';
import { AtMessageModule, IconModule, ItemCounterModule, MediaModule, OutletModule, OutletPosition, PromotionsModule, provideOutlet, } from '@spartacus/storefront';
import { CheckoutComCartItemListRowComponent } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-item-list-row/checkout-com-cart-item-list-row.component';
import { CheckoutComCartItemListComponent } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-item-list/checkout-com-cart-item-list.component';
import { CheckoutComCartItemComponent } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-item/checkout-com-cart-item.component';
import { CheckoutComOrderSummaryComponent } from '@checkout-components/checkout-com-cart-shared/checkout-com-order-summary/checkout-com-order-summary.component';

@NgModule({
  imports: [
    AtMessageModule,
    CartCouponModule,
    CommonModule,
    I18nModule,
    IconModule,
    ItemCounterModule,
    MediaModule,
    PromotionsModule,
    ReactiveFormsModule,
    RouterModule,
    UrlModule,
    AddToCartModule,
    FeaturesConfigModule,
    CheckoutComCartItemValidationWarningModule,
    AbstractOrderContextModule,
    OutletModule.forRoot(),
  ],
  declarations: [
    CheckoutComCartItemComponent,
    CheckoutComOrderSummaryComponent,
    CheckoutComCartItemListComponent,
    CheckoutComCartItemListRowComponent,
    CheckoutComCheckoutOrderSummaryComponent,
  ],
  exports: [
    CheckoutComCartItemComponent,
    CheckoutComCartItemListRowComponent,
    CheckoutComCartItemListComponent,
    CheckoutComOrderSummaryComponent,
    CheckoutComCheckoutOrderSummaryComponent,
  ],
  providers: [
    provideConfig(<CmsConfig>{
      cmsComponents: {
        CheckoutOrderSummary: {
          component: CheckoutComCheckoutOrderSummaryComponent,
        },
      },
    }),
    /*provideOutlet({
      id: CartOutlets.CHECKOUT_COM_ORDER_SUMMARY,
      component: CheckoutComOrderSummaryComponent,
      position: OutletPosition.REPLACE,
    }),*/
    provideOutlet({
      id: CartOutlets.CHECKOUT_COM_CART_ITEM_LIST,
      component: CheckoutComCartItemListComponent,
      position: OutletPosition.REPLACE,
    }),
  ]
})
export class CheckoutComCartSharedModule {
}
