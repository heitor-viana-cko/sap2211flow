import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession } from '@checkout-core/interfaces';
import { CxEvent } from '@spartacus/core';

/**
 * Event triggered when the Checkout Flow feature is enabled.
 *
 * This event extends the `CxEvent` class and includes a property to indicate
 * whether the flow is enabled.
 *
 * @since 2211.32.1
 */
export class CheckoutComFlowIsEnabledRequestEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComFlowIsEnabledRequestEvent';
}


/**
 * Event triggered when the Checkout Flow feature is enabled.
 *
 * This event extends the `CxEvent` class and includes a property to indicate
 * whether the flow is enabled.
 *
 * @since 2211.32.1
 */
export class CheckoutComFlowIsEnabledSetEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComFlowIsEnabledSetEvent';
  isEnabled: boolean;
}

/**
 * Event triggered when the Checkout Flow UI configuration is set.
 *
 * This event extends the `CxEvent` class and includes a property to hold
 * the configuration data for the Checkout Flow UI.
 *
 * @since 2211.32.1
 */
export class CheckoutComFlowUIConfigurationSetEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComFlowUIConfigurationSetEvent';
  configuration: CheckoutComFlowUIConfigurationData;
}

/**
 * Event triggered when a payment session is generated for the Checkout Flow.
 *
 * This event extends the `CxEvent` class and includes a property to hold
 * the generated payment session data.
 *
 * @since 2211.32.1
 */
export class CheckoutComFlowPaymentSessionGeneratedEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComFlowPaymentSessionGeneratedEvent';
  paymentSession: CheckoutComPaymentSession;
}

/**
 * Event triggered when the Checkout Flow environment is set.
 *
 * This event extends the `CxEvent` class and includes a property to hold
 * the environment information for the Checkout Flow.
 *
 * @since 2211.32.1
 */
export class CheckoutComFlowEnvironmentSetEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComFlowEnvironmentSetEvent';
  environment: string;
}


