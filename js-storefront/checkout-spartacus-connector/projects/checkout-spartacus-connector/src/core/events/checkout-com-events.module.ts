import { NgModule } from '@angular/core';
import { CheckoutComBillingAddressFormEventsListener } from '@checkout-core/events/billing-address-form.events.listener';

@NgModule({})
export class CheckoutComEventsModule {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _checkoutComEventsListener: CheckoutComBillingAddressFormEventsListener,
  ) {
    // Intentional empty constructor
  }
}
