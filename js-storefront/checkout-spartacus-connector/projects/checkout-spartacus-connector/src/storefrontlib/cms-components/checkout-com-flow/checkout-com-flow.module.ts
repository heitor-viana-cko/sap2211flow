import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComFlowComponent } from '@checkout-components/checkout-com-flow/checkout-com-flow.component';
import { SpinnerModule } from '@spartacus/storefront';

@NgModule({
  declarations: [CheckoutComFlowComponent],
  exports: [CheckoutComFlowComponent],
  imports: [
    CommonModule,
    SpinnerModule
  ]
})
export class CheckoutComFlowModule {
}
