import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComApmGooglepayComponent } from './checkout-com-apm-googlepay.component';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';

@NgModule({
  declarations: [CheckoutComApmGooglepayComponent],
  exports: [
    CheckoutComApmGooglepayComponent
  ],
  imports: [
    CommonModule,
    CheckoutComBillingAddressFormModule,
  ]
})
export class CheckoutComApmGooglepayModule { }
