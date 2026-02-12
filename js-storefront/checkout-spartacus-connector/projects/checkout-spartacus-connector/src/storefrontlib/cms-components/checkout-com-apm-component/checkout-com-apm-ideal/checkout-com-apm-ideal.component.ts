import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { PaymentType } from '@checkout-model/ApmData';
import { Address } from '@spartacus/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-checkout-com-apm-ideal',
  templateUrl: './checkout-com-apm-ideal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmIdealComponent extends CheckoutComBillingAddressFormComponent implements OnDestroy {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> =
    new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();

  public submitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sameAsShippingAddress: boolean = this.billingAddressFormService.isBillingAddressSameAsDeliveryAddress();
  idealForm: UntypedFormGroup = this.fb.group({});

  constructor(protected fb: UntypedFormBuilder) {
    super();
  }

  /**
   * Authorizes the payment using iDeal.
   * Retrieves the merchant configuration and creates a full payment request.
   * If the billing address form is not valid, it makes form errors visible and returns.
   * Loads the payment data and authorizes the order.
   * Logs an error message if the authorization fails.
   *
   * @return {void}
   * @since 4.2.7
   */
  next(): void {
    this.sameAsShippingAddress = this.billingAddressFormService.isBillingAddressSameAsDeliveryAddress();
    this.billingAddress$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (address: Address): void => {
        const paymentDetails: ApmPaymentDetails = {
          type: PaymentType.iDeal
        };
        this.submitting$.next(true);

        let billingAddress: Address = null;
        if (!this.sameAsShippingAddress) {
          billingAddress = address;
        }

        this.setPaymentDetails.emit({
          paymentDetails,
          billingAddress
        });
      }
    });
  }

  /**
   * Cleans up resources when the component is destroyed.
   * Sets the submitting state to false.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    this.submitting$.next(false);
  }
}
