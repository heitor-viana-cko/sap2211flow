import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComTooltipContainerComponent } from '@checkout-components/checkout-com-tooltip-container/checkout-com-tooltip-container.component';

@NgModule({
  declarations: [CheckoutComTooltipContainerComponent],
  exports:[CheckoutComTooltipContainerComponent],
  imports: [
    CommonModule
  ]
})
export class CheckoutComTooltipContainerModule { }
