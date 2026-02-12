import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { defaultOccCheckoutComConfig } from '@checkout-adapters/config/default-occ-checkout-com-config';
import { APM_NORMALIZER, APM_PAYMENT_DETAILS_NORMALIZER, CHECKOUT_COM_ADDRESS_NORMALIZER, COMPONENT_APM_NORMALIZER } from '@checkout-adapters/converters';
import { checkoutComAdapterProviders } from '@checkout-core/configs/checkout-com-adapter-providers.config';
import { ApmDataNormalizer } from '@checkout-normalizers/apm-data-normalizer';
import { ApmPaymentDetailsNormalizer } from '@checkout-normalizers/apm-payment-details-normalizer';
import { CheckoutComBillingAddressNormalizer } from '@checkout-normalizers/billing-address-normalizer';
import { ComponentApmNormalizer } from '@checkout-normalizers/component-apm-normalizer';
import { provideConfig } from '@spartacus/core';
import { MediaModule } from '@spartacus/storefront';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MediaModule
  ],
  providers: [
    ...checkoutComAdapterProviders,
    {
      provide: APM_NORMALIZER,
      useClass: ApmDataNormalizer,
      multi: true
    },
    {
      provide: COMPONENT_APM_NORMALIZER,
      useClass: ComponentApmNormalizer,
      multi: true
    },
    {
      provide: APM_PAYMENT_DETAILS_NORMALIZER,
      useClass: ApmPaymentDetailsNormalizer,
      multi: true
    },
    {
      provide: CHECKOUT_COM_ADDRESS_NORMALIZER,
      useExisting: CheckoutComBillingAddressNormalizer,
      multi: true,
    },

    provideConfig(defaultOccCheckoutComConfig),
  ]
})
export class CheckoutComOccModule {
}
