import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComTooltipDirective } from '@checkout-core/directives/checkout-com-tooltip.directive';

@NgModule({
  declarations: [CheckoutComTooltipDirective],
  exports: [CheckoutComTooltipDirective],
  imports: [
    CommonModule
  ]
})
export class CheckoutComTooltipDirectiveModule {
}
