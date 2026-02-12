/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartNotEmptyGuard, CheckoutAuthGuard } from '@spartacus/checkout/base/components';
import { CmsConfig, I18nModule, provideConfig, UrlModule, } from '@spartacus/core';
import { CardModule, IconModule, OutletModule } from '@spartacus/storefront';
import { CheckoutComCheckoutReviewShippingComponent } from './checkout-com-checkout-review-shipping.component';

@NgModule({
  declarations: [CheckoutComCheckoutReviewShippingComponent],
  exports: [CheckoutComCheckoutReviewShippingComponent],
  imports: [
    CommonModule,
    I18nModule,
    CardModule,
    UrlModule,
    RouterModule,
    IconModule,
    OutletModule,
  ],
  providers: [
    provideConfig(<CmsConfig>{
      cmsComponents: {
        CheckoutReviewShipping: {
          component: CheckoutComCheckoutReviewShippingComponent,
          guards: [CheckoutAuthGuard, CartNotEmptyGuard],
        },
      },
    }),
  ],
})
export class CheckoutComCheckoutReviewShippingModule {
}
