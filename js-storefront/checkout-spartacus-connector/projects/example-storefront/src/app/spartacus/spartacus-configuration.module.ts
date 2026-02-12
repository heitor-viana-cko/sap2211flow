import { NgModule } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { translationChunksConfig, translations } from '@spartacus/assets';
import { CheckoutConfig, DeliveryModePreferences } from '@spartacus/checkout/base/root';
import { defaultOccConfig, FeaturesConfig, I18nConfig, OccConfig, provideConfig, RoutingConfig, SiteContextConfig } from '@spartacus/core';
import { defaultCmsContentProviders, layoutConfig, mediaConfig } from '@spartacus/storefront';
import { CheckoutComComponentsModule } from '../../../../checkout-spartacus-connector/checkout-com-components.module';
import { checkoutComTranslationChunkConfig, checkoutComTranslations } from '../../../../checkout-spartacus-translations/src/translations';
import { environment } from '../../environments/environment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devImports: any[] = [];
if (!environment.production) {
  devImports.push(
    StoreDevtoolsModule.instrument({
      logOnly: !environment.production && environment.enableStoreDevTools,
      maxAge: 120,
      connectInZone: true
    }),
  );
}

@NgModule({
  declarations: [],
  imports: [
    ...devImports,
    CheckoutComComponentsModule
  ],
  providers: [
    provideConfig(layoutConfig),
    provideConfig(mediaConfig),
    ...defaultCmsContentProviders,
    provideConfig({
      backend: {
        occ: {
          baseUrl: environment.occBaseUrl,
        }
      },
    } as OccConfig),
    provideConfig({
      context: {
        ...environment?.context
      },
    } as SiteContextConfig),
    provideConfig({
      // custom routing configuration for e2e testing
      routing: {
        routes: {
          product: {
            paths: ['product/:productCode/:name', 'product/:productCode'],
            paramsMapping: { name: 'slug' },
          },
        },
      },
    } as RoutingConfig),
    provideConfig({
      i18n: {
        resources: translations,
        chunks: translationChunksConfig,
        fallbackLang: 'en'
      },
    } as I18nConfig),
    provideConfig({
      features: {
        level: '2211.31'
      }
    } as FeaturesConfig),
    provideConfig({
      checkout: {
        defaultDeliveryMode: [DeliveryModePreferences.FREE],
        guest: true,
      },
    } as CheckoutConfig),
    provideConfig(defaultOccConfig),
    provideConfig({
      i18n: {
        resources: checkoutComTranslations,
        chunks: checkoutComTranslationChunkConfig,
        fallbackLang: 'en'
      },
    } as I18nConfig),
  ]
})
export class SpartacusConfigurationModule {
}
