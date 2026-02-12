import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComApmFawryComponent } from './checkout-com-apm-fawry.component';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';



@NgModule({
  declarations: [CheckoutComApmFawryComponent],
  exports: [CheckoutComApmFawryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    FormErrorsModule,
    CheckoutComBillingAddressFormModule
  ]
})
export class CheckoutComApmFawryModule { }
