import { CheckoutComRedirect } from '@checkout-core/interfaces';
import { CxEvent, HttpErrorModel } from '@spartacus/core';
import { Order } from '@spartacus/order/root';

/**
 * Event triggered when an order is placed.
 *
 * @extends {CxEvent}
 */
export class CheckoutComOrderPlacedEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComOrderPlacedEvent';

  /** The HTTP error model associated with the order placement */
  httpError: HttpErrorModel;

  /** The order that was placed */
  order: Order;

  /** The redirect information for the order */
  redirect: CheckoutComRedirect;

  /** Indicates whether the order placement was successful */
  successful: boolean;
}

/**
 * Event triggered when an order is authorized via a redirect.
 *
 * @extends {CxEvent}
 */
export class CheckoutComRedirectOrderAuthorize extends CxEvent {
  static override readonly type: string = 'CheckoutComRedirectOrderAuthorize';

  /** The redirect information for the order authorization */
  redirect: CheckoutComRedirect;
}