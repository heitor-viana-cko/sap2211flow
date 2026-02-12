import { Address, CxEvent } from '@spartacus/core';

/**
 * Event triggered when the billing address is created
 *
 * @extends {CxEvent}
 */
export class CheckoutComBillingAddressCreatedEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComBillingAddressCreatedEvent';
  billingAddress: Address;
}

/**
 * Event triggered when the billing address is updated
 *
 * @extends {CxEvent}
 */
export class CheckoutComBillingAddressUpdatedEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComBillingAddressUpdatedEvent';
  billingAddress: Address;
}

/**
 * Event triggered when the billing address is fetched
 *
 * @extends {CxEvent}
 */
export class CheckoutComBillingAddressRequestedEvent extends CxEvent {
  static override readonly type: string = 'CheckoutComBillingAddressRequestedEvent';
  billingAddress: Address;
}
