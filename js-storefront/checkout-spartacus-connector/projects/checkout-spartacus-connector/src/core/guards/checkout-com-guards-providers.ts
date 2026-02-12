import { Provider } from '@angular/core';
import { CheckoutComStepsSetGuard } from '@checkout-core/guards/checkout-com-checkout-steps-set-guard.guard';
import { CheckoutComOrderConfirmationGuard } from '@checkout-core/guards/checkout-com-order-confirmation.guard';
import { CheckoutStepsSetGuard } from '@spartacus/checkout/base/components';
import { OrderConfirmationGuard } from '@spartacus/order/components';

export const checkoutComGuardsProviders: Provider[] = [
  {
    provide: OrderConfirmationGuard,
    useExisting: CheckoutComOrderConfirmationGuard
  },
  {
    provide: CheckoutStepsSetGuard,
    useExisting: CheckoutComStepsSetGuard
  }
];
