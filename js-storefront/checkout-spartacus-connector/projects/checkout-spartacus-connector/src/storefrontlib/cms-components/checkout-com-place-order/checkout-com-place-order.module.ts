import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CmsConfig, I18nModule, provideConfig, UrlModule } from '@spartacus/core';
import { CheckoutComPlaceOrderComponent } from './checkout-com-place-order.component';

@NgModule({
  declarations: [CheckoutComPlaceOrderComponent],
  imports: [
    CommonModule,
    RouterModule,
    UrlModule,
    I18nModule,
    ReactiveFormsModule
  ],
  providers: [
    provideConfig({
      cmsComponents: {
        CheckoutPlaceOrder: {
          component: CheckoutComPlaceOrderComponent
        }
      }
    } as CmsConfig),
  ],
})
export class CheckoutComPlaceOrderModule {
}
