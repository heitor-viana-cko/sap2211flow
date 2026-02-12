import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { EventService } from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { LaunchDialogService } from '@spartacus/storefront';
import { Observable } from 'rxjs';

@Component({
  selector: 'y-checkout-com-flow-place-order-pop-up',
  templateUrl: './checkout-com-flow-place-order-pop-up.component.html',
  standalone: false,
})
export class CheckoutComFlowPlaceOrderPopUpComponent {
  protected destroyRef: DestroyRef = inject(DestroyRef);
  protected launchDialogService: LaunchDialogService = inject(LaunchDialogService);
  protected eventService: EventService = inject(EventService);
  protected checkoutComFlowFacade: CheckoutComFlowFacade = inject(CheckoutComFlowFacade);

  constructor() {
    this.bindOrderPlacedEvent();
  }

  /**
   * Provides an observable that emits the state of modal actions.
   *
   * This method retrieves the observable from the CheckoutComFlowFacade
   * to determine whether modal actions are currently disabled.
   *
   * @returns {Observable<boolean>} An observable that emits `true` if modal actions are disabled, otherwise `false`.
   */
  disableModalActions(): Observable<boolean> {
    return this.checkoutComFlowFacade.getDisableModalActions();
  }

  /**
   * Closes the dialog using the LaunchDialogService.
   *
   * @since 2211.32.1
   * @return void
   */
  close(): void {
    this.launchDialogService.closeDialog('CheckoutComFlowPlaceOrderPopUpComponent');
  }

  /**
   * Subscribes to the `OrderPlacedEvent` and closes the dialog when the event is triggered.
   *
   * This method listens for the `OrderPlacedEvent` using the `EventService` and ensures
   * that the subscription is automatically cleaned up when the component is destroyed
   * by using the `takeUntilDestroyed` operator.
   *
   * @return void
   */
  bindOrderPlacedEvent(): void {
    this.eventService.get(OrderPlacedEvent).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.close();
      }
    });
  }
}
