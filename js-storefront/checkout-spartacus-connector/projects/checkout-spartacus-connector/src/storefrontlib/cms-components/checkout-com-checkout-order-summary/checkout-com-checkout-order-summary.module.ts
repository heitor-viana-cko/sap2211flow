import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
/*import { CmsConfig, provideConfig } from '@spartacus/core';
import { OutletModule } from '@spartacus/storefront';
import { CheckoutComCheckoutOrderSummaryComponent } from './checkout-com-checkout-order-summary.component';*/

@NgModule({
  imports: [
    CommonModule,
    //OutletModule,
  ],
  /*providers: [
    provideConfig(<CmsConfig>{
      cmsComponents: {
        CheckoutOrderSummary: {
          component: CheckoutComCheckoutOrderSummaryComponent,
        },
      },
    }),
  ],
  declarations: [CheckoutComCheckoutOrderSummaryComponent],
  exports: [CheckoutComCheckoutOrderSummaryComponent],*/
})
export class CheckoutComCheckoutOrderSummaryModule {
}
