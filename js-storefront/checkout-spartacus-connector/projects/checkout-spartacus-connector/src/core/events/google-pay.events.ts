import { CxEvent } from '@spartacus/core';

/**
 * Event triggered when the Google Pay payment needs to be reloaded.
 *
 * @extends {CxEvent}
 */
export class CheckoutComReloadGooglePaymentEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComReloadGooglePaymentEvent';
}

/**
 * Event triggered when the Google Pay payment needs to be reloaded.
 *
 * @extends {CxEvent}
 */
export class CheckoutComResetGooglePaymentEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComResetGooglePaymentEvent';
}
