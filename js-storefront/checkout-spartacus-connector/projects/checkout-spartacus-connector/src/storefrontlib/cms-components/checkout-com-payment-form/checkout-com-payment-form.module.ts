/* Angular */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComApmModule } from '@checkout-components/checkout-com-apm-component/checkout-com-apm.module';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { CheckoutComOccModule } from '@checkout-core/occ/checkout-com-occ.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutPaymentFormModule, CheckoutPaymentMethodModule } from '@spartacus/checkout/base/components';
/* Spartacus */
import { FeaturesConfigModule, I18nModule } from '@spartacus/core';
import { CardModule, FormErrorsModule, IconModule, NgSelectA11yModule, SpinnerModule } from '@spartacus/storefront';
/* CheckoutCom */
import { CheckoutComFramesFormModule } from '../checkout-com-frames-form/checkout-com-frames-form.module';
import { CheckoutComPaymentFormComponent } from './checkout-com-payment-form.component';

@NgModule({
  declarations: [CheckoutComPaymentFormComponent],
  exports: [
    CheckoutComPaymentFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    CardModule,
    I18nModule,
    IconModule,
    SpinnerModule,
    FormErrorsModule,
    CheckoutPaymentMethodModule,
    CheckoutPaymentFormModule,
    /* CheckoutCom modules */
    CheckoutComOccModule,
    CheckoutComFramesFormModule,
    CheckoutComApmModule,
    CheckoutComBillingAddressFormModule,
    NgSelectA11yModule,
    FeaturesConfigModule
  ]
})
export class CheckoutComPaymentFormModule {
}
