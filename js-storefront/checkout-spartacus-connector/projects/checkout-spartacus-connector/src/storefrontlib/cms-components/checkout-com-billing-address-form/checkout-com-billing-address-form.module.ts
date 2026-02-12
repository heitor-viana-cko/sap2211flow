import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeaturesConfigModule, I18nModule } from '@spartacus/core';
import { CardModule, FormErrorsModule, NgSelectA11yModule, SpinnerModule } from '@spartacus/storefront';
import { CheckoutComBillingAddressFormComponent } from './checkout-com-billing-address-form.component';

@NgModule({
  declarations: [CheckoutComBillingAddressFormComponent],
  exports: [
    CheckoutComBillingAddressFormComponent
  ],
  imports: [
    CommonModule,
    I18nModule,
    NgSelectModule,
    FormErrorsModule,
    CardModule,
    ReactiveFormsModule,
    FeaturesConfigModule,
    NgSelectA11yModule,
    SpinnerModule
  ]
})
export class CheckoutComBillingAddressFormModule {
}
