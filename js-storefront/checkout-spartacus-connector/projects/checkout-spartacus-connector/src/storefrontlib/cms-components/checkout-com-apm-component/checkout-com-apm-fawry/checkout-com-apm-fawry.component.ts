import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { PaymentType } from '@checkout-model/ApmData';
import { makeFormErrorsVisible } from '@checkout-shared/make-form-errors-visible';
import { Address } from '@spartacus/core';

@Component({
  selector: 'lib-checkout-com-apm-fawry',
  templateUrl: './checkout-com-apm-fawry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComApmFawryComponent extends CheckoutComBillingAddressFormComponent {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> =
    new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();
  public mobileNumberCtrl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{11}$')]);
  public form: UntypedFormGroup = new UntypedFormGroup({ mobileNumberCtrl: this.mobileNumberCtrl });

  /**
   * Proceeds to the next step in the payment process.
   * It validates the mobile number and billing address forms.
   * If the mobile number is invalid, it makes the form errors visible and returns.
   * If the billing address is required and invalid, it makes the form errors visible and returns.
   * If the forms are valid, it emits the payment details and billing address.
   * @since 6.4.0
   */
  next(): void {
    this.sameAsDeliveryAddress = this.billingAddressFormService.isBillingAddressSameAsDeliveryAddress();
    if (!this.mobileNumberCtrl.value || !this.mobileNumberCtrl.valid) {
      makeFormErrorsVisible(this.form);
      return;
    }
    if (!this.sameAsDeliveryAddress && !this.billingAddressForm.valid) {
      this.billingAddressFormService.setEditToggleState(false);
      makeFormErrorsVisible(this.billingAddressForm);
      return;
    }
    let billingAddress: Address = null;
    if (!this.sameAsDeliveryAddress) {
      billingAddress = this.billingAddressForm.value;
    }
    this.setPaymentDetails.emit({
      paymentDetails: {
        type: PaymentType.Fawry,
        mobileNumber: this.mobileNumberCtrl.value
      } as ApmPaymentDetails,
      billingAddress
    });
  }
}
