import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nModule } from '@spartacus/core';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { FormErrorsModule } from '@spartacus/storefront';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComApmOxxoComponent } from './checkout-com-apm-oxxo.component';

@NgModule({
  declarations: [CheckoutComApmOxxoComponent],
  imports: [
    CommonModule,
    I18nModule,
    CheckoutComBillingAddressFormModule,
    FormErrorsModule,
    ReactiveFormsModule
  ],
  exports: [CheckoutComApmOxxoComponent]
})
export class CheckoutComApmOxxoModule {}
