import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComOrderDetailBillingComponent } from '@checkout-components/order-details/checkout-com-order-detail-billing/checkout-com-order-detail-billing.component';
import { CardModule } from '@spartacus/storefront';

@NgModule({
  declarations: [CheckoutComOrderDetailBillingComponent],
  exports: [CheckoutComOrderDetailBillingComponent],
  imports: [
    CommonModule,
    CardModule
  ]
})
export class CheckoutComOrderDetailBillingModule {
}
