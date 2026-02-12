import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CheckoutComFlowPlaceOrderPopUpComponent
} from '@checkout-components/checkout-com-flow/checkout-com-flow-place-order-pop-up/checkout-com-flow-place-order-pop-up.component';
import { CheckoutComFlowModule } from '@checkout-components/checkout-com-flow/checkout-com-flow.module';
import { I18nModule } from '@spartacus/core';

@NgModule({
  declarations: [CheckoutComFlowPlaceOrderPopUpComponent],
  exports: [CheckoutComFlowPlaceOrderPopUpComponent],
  imports: [
    CommonModule,
    I18nModule,
    CheckoutComFlowModule
  ]
})
export class CheckoutComFlowPlaceOrderPopUpModule {
}
