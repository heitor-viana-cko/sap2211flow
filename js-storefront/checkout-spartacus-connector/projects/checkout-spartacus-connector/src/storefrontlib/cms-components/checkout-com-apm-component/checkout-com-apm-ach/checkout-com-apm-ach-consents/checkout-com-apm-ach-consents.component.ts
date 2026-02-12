import { Component } from '@angular/core';
import { LaunchDialogService } from '@spartacus/storefront';

@Component({
  selector: 'y-checkout-com-apm-ach-consents',
  templateUrl: './checkout-com-apm-ach-consents.component.html',
})
export class CheckoutComApmAchConsentsComponent  {

  /**
   * Constructor for the CheckoutComApmAchConsentsComponent.
   *
   * @param launchDialogService The service used to manage dialog operations.
   * @since 5.2.0
   */
  constructor(protected launchDialogService: LaunchDialogService) { }

  /**
   * Closes the dialog using the LaunchDialogService.
   *
   * @since 5.2.0
   * @return void
   */
  close(): void {
    this.launchDialogService.closeDialog('');
  }

}
