/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NgModule } from '@angular/core';
import { CmsConfig, provideConfig } from '@spartacus/core';
import { PERSONALIZATION_FEATURE, PersonalizationRootModule } from '@spartacus/tracking/personalization/root';

@NgModule({
  declarations: [],
  imports: [
    PersonalizationRootModule
  ],
  providers: [provideConfig(<CmsConfig>{
    featureModules: {
      [PERSONALIZATION_FEATURE]: {
        module: () =>
          // eslint-disable-next-line @typescript-eslint/typedef
          import('@spartacus/tracking/personalization').then((m) => m.PersonalizationModule),
      },
    }
  })]
})
export class PersonalizationFeatureModule { }
