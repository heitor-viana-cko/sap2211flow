import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComBillingAddressFormModule } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.module';
import { I18nModule } from '@spartacus/core';
import { SpinnerModule } from '@spartacus/storefront';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';
import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal/checkout-com-apm-ach-account-list-modal.component';
import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents/checkout-com-apm-ach-consents.component';
import { CheckoutComApmAchComponent } from './checkout-com-apm-ach.component';

@NgModule({
  declarations: [
    CheckoutComApmAchComponent,
    CheckoutComApmAchConsentsComponent,
    CheckoutComApmAchAccountListModalComponent
  ],
  exports: [
    CheckoutComApmAchComponent
  ],
  imports: [
    CommonModule,
    CheckoutComBillingAddressFormModule,
    NgxPlaidLinkModule,
    I18nModule,
    SpinnerModule,
    ReactiveFormsModule
  ]
})
export class CheckoutComApmAchModule {
}
