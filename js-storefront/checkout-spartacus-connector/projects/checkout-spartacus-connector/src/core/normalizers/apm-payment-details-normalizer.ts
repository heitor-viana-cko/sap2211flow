import { Injectable } from '@angular/core';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { CardType, Converter, PaymentDetails } from '@spartacus/core';

@Injectable({
  providedIn: 'root'
})
export class ApmPaymentDetailsNormalizer implements Converter<ApmPaymentDetails, PaymentDetails> {

  /**
   * Constructor for the ApmPaymentDetailsNormalizer.
   */
  constructor() {
  }

  /**
   * Converts the source ApmPaymentDetails object to a PaymentDetails object.
   *
   * @param {ApmPaymentDetails} source - The source object containing the original payment details.
   * @param {PaymentDetails} [target] - The target object to which the payment details will be converted (optional).
   * @returns {PaymentDetails} - The converted PaymentDetails object.
   */
  convert(source: ApmPaymentDetails, target?: PaymentDetails): PaymentDetails {
    if (!target) {
      target = {};
    }

    target.cardType = {
      code: source.type,
      name: source.type
    } as CardType;

    return target;
  }

}
