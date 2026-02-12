/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NgModule } from '@angular/core';
import { CmsConfig, provideConfig } from '@spartacus/core';
import { SMART_EDIT_FEATURE, SmartEditConfig, SmartEditRootModule } from '@spartacus/smartedit/root';

@NgModule({
  declarations: [],
  imports: [
    SmartEditRootModule
  ],
  providers: [provideConfig(<CmsConfig>{
    featureModules: {
      [SMART_EDIT_FEATURE]: {
        module: () =>
          // eslint-disable-next-line @typescript-eslint/typedef
          import('@spartacus/smartedit').then((m) => m.SmartEditModule),
      },
    }
  }),
  provideConfig(<SmartEditConfig>{
    smartEdit: {
      storefrontPreviewRoute: 'STOREFRONT_PREVIEW_ROUTE_PLACEHOLDER',
      allowOrigin: 'ALLOWED_ORIGIN_PLACEHOLDER',
    },
  })
  ]
})
export class SmartEditFeatureModule { }
