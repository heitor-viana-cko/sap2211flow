import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { CheckoutComOccModule } from '@checkout-core/occ/checkout-com-occ.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { I18nModule } from '@spartacus/core';
import { FormErrorsModule, SpinnerModule } from '@spartacus/storefront';
import { CheckoutComApmAchModule } from './checkout-com-apm-ach/checkout-com-apm-ach.module';
import { CheckoutComApmApplepayModule } from './checkout-com-apm-applepay/checkout-com-apm-applepay.module';
import { CheckoutComApmFawryModule } from './checkout-com-apm-fawry/checkout-com-apm-fawry.module';
import { CheckoutComApmGooglepayModule } from './checkout-com-apm-googlepay/checkout-com-apm-googlepay.module';
import { CheckoutComApmIdealModule } from './checkout-com-apm-ideal/checkout-com-apm-ideal.module';
import { CheckoutComApmKlarnaModule } from './checkout-com-apm-klarna/checkout-com-klarna.module';
import { CheckoutComApmOxxoModule } from './checkout-com-apm-oxxo/checkout-com-apm-oxxo.module';
import { CheckoutComApmTileModule } from './checkout-com-apm-tile/checkout-com-apm-tile.module';
import { CheckoutComApmComponent } from './checkout-com-apm.component';
import { CheckoutComSepaApmModule } from './checkout-com-sepa-apm/checkout-com-sepa-apm.module';

@NgModule({
  declarations: [CheckoutComApmComponent],
  exports: [CheckoutComApmComponent],
  imports: [
    CommonModule,
    I18nModule,
    SpinnerModule,
    ReactiveFormsModule,
    FormErrorsModule,
    NgSelectModule,
    CheckoutComOccModule,
    CheckoutComBillingAddressFormModule,
    CheckoutComApmKlarnaModule,
    CheckoutComApmOxxoModule,
    CheckoutComApmTileModule,
    CheckoutComApmApplepayModule,
    CheckoutComApmGooglepayModule,
    CheckoutComSepaApmModule,
    CheckoutComApmFawryModule,
    CheckoutComApmIdealModule,
    CheckoutComApmAchModule,
  ]
})
export class CheckoutComApmModule {
}
