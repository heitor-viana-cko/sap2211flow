import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutPaymentFormComponent } from '@spartacus/checkout/base/components';

@Component({
  selector: 'y-checkout-com-payment-form',
  templateUrl: './checkout-com-payment-methods-form.component.html'
})
export class CheckoutComPaymentMethodsFormComponent extends CheckoutPaymentFormComponent implements OnInit {

  @Input() paymentDetailsData: CheckoutComPaymentDetails;

  override paymentForm: UntypedFormGroup = this.fb.group({
    accountHolderName: ['', [Validators.required]],
    billingAddress: [''],
    cardType: [''],
    cardNumber: [''],
    defaultPayment: [null],
    expiryMonth: [null, Validators.required],
    expiryYear: [null, Validators.required],
    id: [''],
    paymentToken: [''],
    subscriptionId: ['']
  });

  /**
   * Initializes the component by setting up the expiration month and year,
   * and patching the payment form with the provided payment details data.
   *
   * @override
   */
  override ngOnInit(): void {
    this.expMonthAndYear();
    this.paymentForm.patchValue(this.paymentDetailsData);
  }

  /**
   * Proceeds to the next step if the payment form is valid.
   * Emits the payment form value if valid, otherwise marks all form fields as touched.
   *
   * @override
   */
  override next(): void {
    if (this.paymentForm.valid) {
      this.setPaymentDetails.emit(this.paymentForm.value);
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
