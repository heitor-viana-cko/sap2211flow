import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-checkout-com-billing-address-form',
  template: '',
})
export class MockLibCheckoutComBillingAddressFormComponent {
  @Input() billingAddressForm: UntypedFormGroup;
}
