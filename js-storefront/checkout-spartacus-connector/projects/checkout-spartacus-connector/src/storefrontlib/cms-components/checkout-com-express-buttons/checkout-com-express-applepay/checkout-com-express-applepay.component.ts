import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplePayPaymentRequest } from '@checkout-model/ApplePay';
import { CheckoutComApmApplepayComponent } from '../../checkout-com-apm-component/checkout-com-apm-applepay/checkout-com-apm-applepay.component';

@Component({
  selector: 'lib-checkout-com-express-applepay',
  templateUrl: './checkout-com-express-applepay.component.html',
})
export class CheckoutComExpressApplepayComponent extends CheckoutComApmApplepayComponent implements OnInit {
  @Input() expressCheckout?: boolean;
  @Input() productCode?: string;
  @Output() buttonApplePayClicked: EventEmitter<boolean> = new EventEmitter<boolean>();


  /**
   * Handles the click event for the express checkout button.
   * If express checkout is enabled, places the Apple Pay order using the current user and cart IDs.
   * Otherwise, retrieves the user and cart IDs and places the Apple Pay order.
   *
   * @return {void}
   * @since 4.2.7
   */
  onExpressClick(): void {
    if (this.expressCheckout) {
      this.buttonApplePayClicked.emit(true);
      this.placeApplePayOrder();
    } else {
      this.placeApplePayOrder();
    }
  }

  /**
   * Modifies the Apple Pay payment request to require shipping information.
   * Adds the required shipping contact fields (postal address, name, and email) to the payment request.
   *
   * @param {ApplePayPaymentRequest} paymentRequest - The default payment request from OCC.
   * @protected
   * @override
   * @return {ApplePayPaymentRequest} - The modified payment request with required shipping contact fields.
   * @since 4.2.7
   */
  protected override modifyPaymentRequest(paymentRequest: ApplePayPaymentRequest): ApplePayPaymentRequest {
    return {
      ...paymentRequest,
      requiredShippingContactFields: [
        'postalAddress',
        'name',
        'email'
      ]
    };
  }
}
