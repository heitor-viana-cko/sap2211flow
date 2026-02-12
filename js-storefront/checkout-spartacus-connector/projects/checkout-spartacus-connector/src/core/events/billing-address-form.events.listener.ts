import { Injectable, OnDestroy } from '@angular/core';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CurrencySetEvent, EventService } from '@spartacus/core';
import { merge, Subscription } from 'rxjs';

/**
 * Checkout payment event listener.
 */
@Injectable({
  providedIn: 'root'
})
export class CheckoutComBillingAddressFormEventsListener implements OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  /**
   * Constructor for CheckoutComBillingAddressFormEventsListener.
   * @param {EventService} eventService - The event service used to handle events.
   * @param checkoutComBillingAddressFormService
   * @since 6.4.0
   */
  constructor(
    protected eventService: EventService,
    protected checkoutComBillingAddressFormService: CheckoutComBillingAddressFormService
  ) {
    this.onCurrencyChangeEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected onCurrencyChangeEvent(): void {
    this.subscriptions.add(
      merge(this.eventService.get(CurrencySetEvent)).subscribe({
        next: (): void => {
          this.checkoutComBillingAddressFormService.setEditToggleState(false);
        }
      })
    );
  }
}
