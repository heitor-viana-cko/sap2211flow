import { CxEvent } from '@spartacus/core';

/**
 * Event triggered when the Apple Pay Express Checkout component is destroyed.
 *
 * @extends {CxEvent}
 */
export class CheckoutComReloadApplepayPaymentEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComReloadApplepayPaymentEvent';

  cartId: string  | undefined;
}

/**
 * Event triggered when the Apple Pay Express Checkout component is destroyed.
 *
 * @extends {CxEvent}
 */
export class CheckoutComResetApplepayPaymentEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComResetApplepayPaymentEvent';
}

/**
 * Event triggered when the Apple Pay Express Checkout component is destroyed.
 *
 * @extends {CxEvent}
 */
export class CheckoutComApplePayPaymentRequestEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComApplePayPaymentRequestEvent';
}
