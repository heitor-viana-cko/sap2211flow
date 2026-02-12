import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComCartSharedModule } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-shared.module';
import { CheckoutComCheckoutOrderSummaryModule } from '@checkout-components/checkout-com-checkout-order-summary/checkout-com-checkout-order-summary.module';
import { CheckoutComCheckoutReviewPaymentModule } from '@checkout-components/checkout-com-checkout-review-payment/checkout-com-checkout-review-payment.module';
import { CheckoutComCheckoutReviewShippingModule } from '@checkout-components/checkout-com-checkout-review-shipping/checkout-com-checkout-review-shipping.module';
import { CheckoutComPaymentMethodsModule } from '@checkout-components/checkout-com-payment-methods/checkout-com-payment-methods.module';
import { CheckoutComOrderConfirmationModule } from '@checkout-components/order-confirmation/checkout-com-order-confirmation.module';
import { CheckoutComOrderDetailsModule } from '@checkout-components/order-details/checkout-com-order-details.module';
import { CheckoutComEventsModule } from '@checkout-core/events/checkout-com-events.module';
import { CheckoutComOccModule } from '@checkout-core/occ/checkout-com-occ.module';
import { OutletModule } from '@spartacus/storefront';
import { CheckoutComApmModule } from './checkout-com-apm-component/checkout-com-apm.module';
import { CheckoutComPaymentFormModule } from './checkout-com-payment-form/checkout-com-payment-form.module';
import { CheckoutComPaymentMethodModule } from './checkout-com-payment-method/checkout-com-payment-method.module';
import { CheckoutComPlaceOrderModule } from './checkout-com-place-order/checkout-com-place-order.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OutletModule.forChild(),
    CheckoutComOccModule,
    CheckoutComApmModule,
    CheckoutComPaymentFormModule,
    CheckoutComPaymentMethodModule,
    CheckoutComPaymentMethodsModule,
    CheckoutComCartSharedModule,
    CheckoutComOrderDetailsModule,
    CheckoutComCheckoutOrderSummaryModule,
    CheckoutComCheckoutReviewShippingModule,
    CheckoutComCheckoutReviewPaymentModule,
    CheckoutComPlaceOrderModule,
    CheckoutComOrderConfirmationModule,
    CheckoutComEventsModule,
  ],
})

export class CheckoutComComponentsModule {
}
