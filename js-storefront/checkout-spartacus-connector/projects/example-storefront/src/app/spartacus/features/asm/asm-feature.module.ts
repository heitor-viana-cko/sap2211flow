/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NgModule } from '@angular/core';
import { asmTranslationChunksConfig, asmTranslations } from '@spartacus/asm/assets';
import { ASM_FEATURE, AsmRootModule } from '@spartacus/asm/root';
import { CmsConfig, I18nConfig, provideConfig } from '@spartacus/core';

@NgModule({
  declarations: [],
  imports: [
    AsmRootModule
  ],
  providers: [provideConfig(<CmsConfig>{
    featureModules: {
      [ASM_FEATURE]: {
        module: () =>
          // eslint-disable-next-line @typescript-eslint/typedef
          import('@spartacus/asm').then((m) => m.AsmModule),
      },
    }
  }),
  provideConfig(<I18nConfig>{
    i18n: {
      resources: asmTranslations,
      chunks: asmTranslationChunksConfig,
    },
  })
  ]
})
export class AsmFeatureModule { }
