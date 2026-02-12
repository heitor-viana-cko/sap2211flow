import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComApmIdealComponent } from './checkout-com-apm-ideal.component';
import { FormErrorsModule, SpinnerModule } from '@spartacus/storefront';
import { I18nModule } from '@spartacus/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';



@NgModule({
  declarations: [CheckoutComApmIdealComponent],
  exports: [
    CheckoutComApmIdealComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    I18nModule,
    ReactiveFormsModule,
    FormErrorsModule,
    CheckoutComBillingAddressFormModule
  ]
})
export class CheckoutComApmIdealModule { }
