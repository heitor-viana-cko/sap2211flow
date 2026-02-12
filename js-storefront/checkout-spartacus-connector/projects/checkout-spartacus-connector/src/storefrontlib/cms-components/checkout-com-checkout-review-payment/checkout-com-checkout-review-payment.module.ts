/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CheckoutComCheckoutReviewPaymentComponent } from '@checkout-components/checkout-com-checkout-review-payment/checkout-com-checkout-review-payment.component';
import { CartNotEmptyGuard, CheckoutAuthGuard } from '@spartacus/checkout/base/components';
import {
  CmsConfig,
  I18nModule,
  provideDefaultConfig,
  UrlModule,
} from '@spartacus/core';
import { CardModule, IconModule } from '@spartacus/storefront';
@NgModule({
  declarations: [CheckoutComCheckoutReviewPaymentComponent],
  exports: [CheckoutComCheckoutReviewPaymentComponent],
  imports: [
    CommonModule,
    CardModule,
    I18nModule,
    UrlModule,
    RouterModule,
    IconModule,
  ],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        CheckoutReviewPayment: {
          component: CheckoutComCheckoutReviewPaymentComponent,
          guards: [CheckoutAuthGuard, CartNotEmptyGuard],
        },
      },
    }),
  ],
})
export class CheckoutComCheckoutReviewPaymentModule {}
