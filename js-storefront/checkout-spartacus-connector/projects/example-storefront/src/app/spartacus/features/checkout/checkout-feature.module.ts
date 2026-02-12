/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NgModule } from '@angular/core';
import { checkoutTranslationChunksConfig, checkoutTranslations } from '@spartacus/checkout/base/assets';
import { CHECKOUT_FEATURE, CheckoutRootModule } from '@spartacus/checkout/base/root';
import { CmsConfig, I18nConfig, provideConfig } from '@spartacus/core';

@NgModule({
  declarations: [],
  imports: [
    CheckoutRootModule
  ],
  providers: [provideConfig(<CmsConfig>{
    featureModules: {
      [CHECKOUT_FEATURE]: {
        module: () =>
          // eslint-disable-next-line @typescript-eslint/typedef
          import('@spartacus/checkout/base').then((m) => m.CheckoutModule),
      },
    }
  }),
  provideConfig(<I18nConfig>{
    i18n: {
      resources: checkoutTranslations,
      chunks: checkoutTranslationChunksConfig,
    },
  })
  ]
})
export class CheckoutFeatureModule { }
