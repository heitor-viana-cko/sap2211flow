import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nModule } from '@spartacus/core';
import { SpinnerModule } from '@spartacus/storefront';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { CheckoutComKlarnaComponent } from './checkout-com-klarna.component';

@NgModule({
  declarations: [CheckoutComKlarnaComponent],
  imports: [
    CommonModule,
    I18nModule,
    CheckoutComBillingAddressFormModule,
    SpinnerModule
  ],
  exports: [CheckoutComKlarnaComponent]
})
export class CheckoutComApmKlarnaModule {}
