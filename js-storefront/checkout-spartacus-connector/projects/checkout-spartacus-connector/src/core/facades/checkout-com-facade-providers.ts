import { APP_INITIALIZER, Provider } from '@angular/core';
import { CheckoutComPaymentFacade } from '@checkout-core/facades/checkout-com-payment.facade';
import { CheckoutComAchFacade } from '@checkout-facades/checkout-com-ach.facade';
import { CheckoutComApmFacade } from '@checkout-facades/checkout-com-apm.facade';
import { CheckoutComApplepayFacade } from '@checkout-facades/checkout-com-applepay.facade';
import { CheckoutComBillingAddressFormFacade } from '@checkout-facades/checkout-com-checkout-billing-address-form.facade';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComGooglepayFacade } from '@checkout-facades/checkout-com-googlepay.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { CheckoutComAchService } from '@checkout-services/ach/checkout-com-ach.service';
import { CheckoutComApmService } from '@checkout-services/apm/checkout-com-apm.service';
import { CheckoutComApplepayService } from '@checkout-services/applepay/checkout-com-applepay.service';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CheckoutComCheckoutBillingAddressService } from '@checkout-services/checkout-billing-address/checkout-com-checkout-billing-address.service';
import { CheckoutComCheckoutConfigService } from '@checkout-services/checkout-steps/checkout-com-checkout-config.service';
import { CheckoutComFlowService } from '@checkout-services/flow/checkout-com-flow.service';
import { CheckoutComGooglepayService } from '@checkout-services/googlepay/checkout-com-googlepay.service';
import { CheckoutComOrderService } from '@checkout-services/order/checkout-com-order.service';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { CheckoutPaymentService, CheckoutQueryService } from '@spartacus/checkout/base/core';
import { CheckoutPaymentFacade, CheckoutQueryFacade } from '@spartacus/checkout/base/root';
import { OrderFacade } from '@spartacus/order/root';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { CheckoutComCheckoutBillingAddressFacade } from './checkout-com-checkout-billing-address.facade';

export function initCheckoutComFLow(
  facade: CheckoutComFlowFacade,
  checkoutComCheckoutConfigService: CheckoutComCheckoutConfigService
): () => void {
  return (): void => {
    facade.initializeFlow();
    facade.getIsFlowEnabled().pipe(
      filter((isEnabled: boolean): boolean => isEnabled),
      distinctUntilChanged()
    ).subscribe({
      next: (): void => {
        checkoutComCheckoutConfigService.replacePaymentMethodStep();
      }
    });
  };
}

export const INIT_CHECKOUT_COM_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initCheckoutComFLow,
  deps: [CheckoutComFlowFacade, CheckoutComCheckoutConfigService],
  multi: true
};

export const checkoutComFacadeProviders: Provider[] = [
  ActiveCartService,
  {
    provide: ActiveCartFacade,
    useExisting: ActiveCartService
  },
  CheckoutQueryService,
  {
    provide: CheckoutQueryFacade,
    useClass: CheckoutQueryService
  },
  CheckoutComAchService,
  {
    provide: CheckoutComAchFacade,
    useExisting: CheckoutComAchService
  },
  CheckoutComApmService,
  {
    provide: CheckoutComApmFacade,
    useExisting: CheckoutComApmService
  },
  CheckoutComApplepayService,
  {
    provide: CheckoutComApplepayFacade,
    useExisting: CheckoutComApplepayService
  },
  CheckoutComOrderService,
  {
    provide: CheckoutComOrderFacade,
    useExisting: CheckoutComOrderService
  },
  {
    provide: OrderFacade,
    useExisting: CheckoutComOrderService
  },
  CheckoutComGooglepayService,
  {
    provide: CheckoutComGooglepayFacade,
    useClass: CheckoutComGooglepayService
  },
  CheckoutComPaymentService,
  {
    provide: CheckoutComPaymentFacade,
    useExisting: CheckoutComPaymentService
  },
  {
    provide: CheckoutPaymentService,
    useExisting: CheckoutComPaymentService
  },
  {
    provide: CheckoutPaymentFacade,
    useExisting: CheckoutComFlowFacade
  },
  CheckoutComBillingAddressFormService,
  {
    provide: CheckoutComBillingAddressFormFacade,
    useClass: CheckoutComBillingAddressFormService
  },
  {
    provide: CheckoutBillingAddressFormService,
    useClass: CheckoutComBillingAddressFormService
  },
  CheckoutComFlowService,
  {
    provide: CheckoutComFlowFacade,
    useClass: CheckoutComFlowService
  },
  INIT_CHECKOUT_COM_PROVIDER,
  CheckoutComCheckoutBillingAddressService,
  {
    provide: CheckoutComCheckoutBillingAddressFacade,
    useClass: CheckoutComCheckoutBillingAddressService
  }
];
