import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CheckoutComExpressButtonsModule } from '@checkout-components/checkout-com-express-buttons/checkout-com-express-buttons.module';
import { CartSharedModule } from '@spartacus/cart/base/components';
import { MultiCartService } from '@spartacus/cart/base/core';
import { FeaturesConfigModule, I18nModule, provideConfig, UrlModule } from '@spartacus/core';
import {
  IconModule,
  ItemCounterModule,
  KeyboardFocusModule,
  LaunchDialogModule, ProductListItemContext, ProductListItemContextSource,
  //ProductListItemContext,
  //ProductListItemContextSource,
  PromotionsModule,
  SpinnerModule
} from '@spartacus/storefront';
import { ExpressAddToCartComponent } from './express-add-to-cart.component';

@NgModule({
  declarations: [
    ExpressAddToCartComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CartSharedModule,
    RouterModule,
    SpinnerModule,
    PromotionsModule,
    FeaturesConfigModule,
    UrlModule,
    IconModule,
    I18nModule,
    ItemCounterModule,
    KeyboardFocusModule,
    LaunchDialogModule,
    CheckoutComExpressButtonsModule,
  ],
  providers: [
    MultiCartService,
    ProductListItemContextSource,
    {
      provide: ProductListItemContext,
      useExisting: ProductListItemContextSource,
    },
    provideConfig(
      {
        cmsComponents: {
          ProductAddToCartComponent: {
            component: ExpressAddToCartComponent
          },
        }
      }
    ),
  ],
  exports: [
    ExpressAddToCartComponent,
  ],
})
export class ExpressAddToCartComponentModule {
}
