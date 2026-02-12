import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComTooltipContainerModule } from '@checkout-components/checkout-com-tooltip-container/checkout-com-tooltip-container.module';
import { CheckoutComTooltipDirectiveModule } from '@checkout-core/directives/checkout-com-tooltip-directive.module';
import { I18nModule } from '@spartacus/core';
import { IconModule } from '@spartacus/storefront';
import { CheckoutComFramesInputComponent } from './checkout-com-frames-input.component';

@NgModule({
  declarations: [CheckoutComFramesInputComponent],
  exports: [
    CheckoutComFramesInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    IconModule,
    CheckoutComTooltipContainerModule,
    CheckoutComTooltipDirectiveModule
  ]
})
export class CheckoutComFramesInputModule {
}
