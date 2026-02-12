import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComApmModule } from '@checkout-components/checkout-com-apm-component/checkout-com-apm.module';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { CheckoutComFlowPlaceOrderPopUpModule } from '@checkout-components/checkout-com-flow/checkout-com-flow-place-order-pop-up/checkout-com-flow-place-order-pop-up.module';
import { CheckoutComFlowModule } from '@checkout-components/checkout-com-flow/checkout-com-flow.module';
import { CheckoutComFramesFormModule } from '@checkout-components/checkout-com-frames-form/checkout-com-frames-form.module';
import { CheckoutComPaymentFormModule } from '@checkout-components/checkout-com-payment-form/checkout-com-payment-form.module';
import { CheckoutComOccModule } from '@checkout-core/occ/checkout-com-occ.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CmsConfig, ConfigModule, I18nModule } from '@spartacus/core';
import { CardModule, FormErrorsModule, IconModule, SpinnerModule } from '@spartacus/storefront';
import { CheckoutComPaymentMethodComponent } from './checkout-com-payment-method.component';

@NgModule({
  declarations: [CheckoutComPaymentMethodComponent],
  exports: [CheckoutComPaymentMethodComponent],
  imports: [
    CommonModule,
    ConfigModule.withConfig({
      cmsComponents: {
        CheckoutPaymentDetails: {
          component: CheckoutComPaymentMethodComponent
        }
      }
    } as CmsConfig),
    CheckoutComOccModule,
    CheckoutComFramesFormModule,
    CheckoutComPaymentFormModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormErrorsModule,
    I18nModule,
    IconModule,
    CardModule,
    SpinnerModule,
    CheckoutComApmModule,
    CheckoutComBillingAddressFormModule,
    CheckoutComFlowModule,
    CheckoutComFlowPlaceOrderPopUpModule
  ]
})
export class CheckoutComPaymentMethodModule {
}
