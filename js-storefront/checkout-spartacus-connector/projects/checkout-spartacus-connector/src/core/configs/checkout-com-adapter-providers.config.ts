import { Provider } from '@angular/core';
import { CheckoutComAchAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-ach.adapter';
import { CheckoutComApmAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-apm.adapter';
import { CheckoutComApplepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-applepay.adapter';
import { CheckoutComGooglepayAdapter } from '@checkout-adapters/checkout-com-apm/checkout-com-googlepay.adapter';
import { CheckoutComCheckoutBillingAddressAdapter } from '@checkout-adapters/checkout-com-billing-address/checkout-com-checkout-billing-address.adapter';
import { CheckoutComFlowAdapter } from '@checkout-adapters/checkout-com-flow/checkout-com-flow.adapter';
import { CheckoutComOrderAdapter } from '@checkout-adapters/checkout-com-order/checkout-com-order.adapter';
import { CheckoutComPaymentAdapter } from '@checkout-adapters/checkout-com-payment/checkout-com-payment.adapter';
import { CheckoutComAdapter } from '@checkout-adapters/checkout-com/checkout-com.adapter';
import { CheckoutComAchConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-ach.connector';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { CheckoutComApplepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-applepay.connector';
import { CheckoutComGooglepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-googlepay.connector';
import { CheckoutComCheckoutBillingAddressConnector } from '@checkout-core/connectors/checkout-com-checkout-billing-address/checkout-com-checkout-billing-address.connector';
import { CheckoutComFlowConnector } from '@checkout-core/connectors/checkout-com-flow/checkout-com-flow.connector';
import { CheckoutComOrderConnector } from '@checkout-core/connectors/checkout-com-order/checkout-com-order.connector';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { OccCheckoutComAchAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-ach.adapter';
import { OccCheckoutComApmAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-apm.adapter';
import { OccCheckoutComApplepayAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-applepay.adapter';
import { OccCheckoutComCheckoutBillingAddressAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-checkout-billing-address.adapter';
import { OccCheckoutComFlowAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-flow.adapter';
import { OccCheckoutComGooglePayAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-googlepay.adapter';
import { OccCheckoutComOrderAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-order.adapter';
import { OccCheckoutComPaymentAdapter } from '@checkout-core/occ/adapters/occ-checkout-com-payment.adapter';
import { OccCheckoutComAdapter } from '@checkout-core/occ/adapters/occ-checkout-com.adapter';
import { CheckoutAdapter, CheckoutConnector } from '@spartacus/checkout/base/core';
import { OccCheckoutAdapter } from '@spartacus/checkout/base/occ';
import { OrderAdapter, OrderConnector } from '@spartacus/order/core';
import { OccOrderAdapter } from '@spartacus/order/occ';

export const checkoutComAdapterProviders: Provider[] = [
  CheckoutConnector,
  {
    provide: CheckoutAdapter,
    useClass: OccCheckoutAdapter
  },
  CheckoutComConnector,
  {
    provide: CheckoutComAdapter,
    useClass: OccCheckoutComAdapter
  },
  CheckoutComAchConnector,
  {
    provide: CheckoutComAchAdapter,
    useClass: OccCheckoutComAchAdapter
  },
  CheckoutComApmConnector,
  {
    provide: CheckoutComApmAdapter,
    useClass: OccCheckoutComApmAdapter
  },
  CheckoutComApplepayConnector,
  {
    provide: CheckoutComApplepayAdapter,
    useClass: OccCheckoutComApplepayAdapter
  },
  CheckoutComGooglepayConnector,
  {
    provide: CheckoutComGooglepayAdapter,
    useClass: OccCheckoutComGooglePayAdapter
  },
  CheckoutComOrderConnector,
  {
    provide: CheckoutComOrderAdapter,
    useClass: OccCheckoutComOrderAdapter
  },
  CheckoutComPaymentConnector,
  {
    provide: CheckoutComPaymentAdapter,
    useClass: OccCheckoutComPaymentAdapter
  },
  OrderConnector,
  {
    provide: OrderAdapter,
    useClass: OccOrderAdapter
  },
  CheckoutComFlowConnector,
  {
    provide: CheckoutComFlowAdapter,
    useClass: OccCheckoutComFlowAdapter
  },
  CheckoutComCheckoutBillingAddressConnector,
  {
    provide: CheckoutComCheckoutBillingAddressAdapter,
    useClass: OccCheckoutComCheckoutBillingAddressAdapter
  }
];
