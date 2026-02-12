import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { Address } from '@spartacus/core';

@Component({
  selector: 'lib-checkout-com-apm',
  template: '',
})
export class MockLibCheckoutComApmComponent {
  @Output() setPaymentDetails: EventEmitter<any> = new EventEmitter<{
    paymentDetails: ApmPaymentDetails,
    billingAddress: Address
  }>();
  @Input() goBack: () => void;
  @Input() processing = false;
}