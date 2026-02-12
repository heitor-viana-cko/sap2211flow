import { CxEvent } from '@spartacus/core';
import { Order } from '@spartacus/order/root';

/**
 * Event triggered when the Plaid link token is set for ACH payment method.
 *
 * @extends {CxEvent}
 */
export class CheckoutComApmAchRequestPlaidLinkTokeSetEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComApmAchRequestPlaidLinkTokeSetEvent';

  /** The Plaid link token */
  token: string;
}

/**
 * Event triggered when the Plaid link token is successfully set for an order in the ACH payment method.
 *
 * @extends {CxEvent}
 */
export class CheckoutComApmAchRequestPlaidSuccessOrderSetEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComApmAchRequestPlaidSuccessOrderSetEvent';

  /** The order associated with the successful Plaid link token set event */
  order: Order;
}