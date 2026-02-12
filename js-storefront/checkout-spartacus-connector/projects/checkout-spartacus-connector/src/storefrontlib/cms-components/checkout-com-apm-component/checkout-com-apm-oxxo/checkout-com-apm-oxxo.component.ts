import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { PaymentType } from '@checkout-model/ApmData';
import { makeFormErrorsVisible } from '@checkout-shared/make-form-errors-visible';
import { Address } from '@spartacus/core';

// TODO: Pending to remove is is not part of NAS
@Component({
  selector: 'lib-checkout-com-apm-oxxo',
  templateUrl: './checkout-com-apm-oxxo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmOxxoComponent extends CheckoutComBillingAddressFormComponent {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> =
    new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();
  public documentCtrl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{18}$')]);
  public form: UntypedFormGroup = new UntypedFormGroup({ document: this.documentCtrl });
  public sameAsShippingAddress: boolean = true;

  /**
   * Proceeds to the next step in the payment process.
   * Validates the document control and billing address form.
   * If the document control is invalid, it makes form errors visible and returns.
   * If the billing address form is invalid and `sameAsShippingAddress` is false, it makes form errors visible and returns.
   * If `sameAsShippingAddress` is false, it sets the billing address to the value of the billing address form.
   * Emits the payment details and billing address using the `setPaymentDetails` event emitter.
   *
   * @private
   * @return {void}
   * @since 4.2.7
   */
  next(): void {
    if (!this.documentCtrl.value || !this.documentCtrl.valid) {
      makeFormErrorsVisible(this.form);
      return;
    }
    if (!this.sameAsShippingAddress && !this.billingAddressForm.valid) {
      makeFormErrorsVisible(this.billingAddressForm);
      return;
    }
    let billingAddress: Address = null;
    if (!this.sameAsShippingAddress) {
      billingAddress = this.billingAddressForm.value;
    }
    this.setPaymentDetails.emit({
      paymentDetails: {
        type: PaymentType.Oxxo,
        document: this.documentCtrl.value
      } as ApmPaymentDetails,
      billingAddress
    });
  }
}
