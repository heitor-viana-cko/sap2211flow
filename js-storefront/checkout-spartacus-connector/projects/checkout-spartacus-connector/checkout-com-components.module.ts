/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComModalConfig } from '@checkout-core/configs';
import { checkoutComAdapterProviders } from '@checkout-core/configs/checkout-com-adapter-providers.config';
import { checkoutComGuardsProviders } from '@checkout-core/guards/checkout-com-guards-providers';
import { checkoutComFacadeProviders } from '@checkout-facades/checkout-com-facade-providers';
import { CmsConfig, provideConfig } from '@spartacus/core';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    ...checkoutComFacadeProviders,
    ...checkoutComAdapterProviders,
    ...checkoutComGuardsProviders,
    provideConfig(CheckoutComModalConfig),
    provideConfig({
      featureModules: {
        CheckoutComComponentsModule: {
          // eslint-disable-next-line @typescript-eslint/typedef
          module: () => import('checkout-spartacus-connector').then(m => m.CheckoutComComponentsModule),
          cmsComponents: [
            'CheckoutPaymentDetails',
            'CheckoutOrderSummary',
            'CheckoutPlaceOrder',
            'CheckoutReviewPayment',
            'CheckoutReviewShipping',
            'OrderConfirmationThankMessageComponent',
            'OrderDetailItemsComponent',
            'OrderConfirmationItemsComponent',
            'OrderConfirmationTotalsComponent',
            'OrderConfirmationOverviewComponent',
            'OrderConfirmationShippingComponent',
            'OrderConfirmationBillingComponent',
            'OrderConfirmationContinueButtonComponent',
            'AccountPaymentDetailsComponent',
            'AccountOrderDetailsItemsComponent',
            'AccountOrderDetailsOverviewComponent',
            'AccountOrderDetailsSimpleOverviewComponent',
            'AccountOrderDetailsGroupedItemsComponent',
            'AccountOrderDetailsTotalsComponent',
          ],
        }
      }
    } as CmsConfig)
  ]
})
export class CheckoutComComponentsModule {
}
