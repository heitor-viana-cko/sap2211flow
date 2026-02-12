import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComExpressButtonsModule } from '@checkout-components/checkout-com-express-buttons/checkout-com-express-buttons.module';
import { ExpressCartTotalsComponent } from './express-cart-totals.component';
import { FeaturesConfigModule, I18nModule, provideConfig, UrlModule } from '@spartacus/core';
import { ProgressButtonModule } from '@spartacus/storefront';
import { RouterModule } from '@angular/router';
import { CartCouponModule, CartSharedModule } from '@spartacus/cart/base/components';

@NgModule({
  declarations: [
    ExpressCartTotalsComponent
  ],
  exports: [
    ExpressCartTotalsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    UrlModule,
    CartSharedModule,
    I18nModule,
    CartCouponModule,
    FeaturesConfigModule,
    ProgressButtonModule,
    CheckoutComExpressButtonsModule,
  ],
  providers: [
    provideConfig({
      cmsComponents: {
        CartProceedToCheckoutComponent: {
          component: ExpressCartTotalsComponent,
        },
      },
    }),
  ],
})
export class ExpressCartTotalsModule { }
