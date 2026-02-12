import { Injectable } from '@angular/core';
import { Address, Converter } from '@spartacus/core';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComBillingAddressNormalizer implements Converter<Address, Address> {

  /**
   * Constructor for the CheckoutComBillingAddressNormalizer.
   */
  constructor() {
  }

  /**
   * Converts the source Address object to a target Address object.
   *
   * @param {Address} source - The source object containing the original address details.
   * @param {Address} [target] - The target object to which the address details will be converted (optional).
   * @returns {Address} - The converted Address object.
   */
  convert(source: Address, target?: Address): Address {
    if (!target) {
      target = source;
    }

    if (target?.region) {
      target.region = {
        isocode: source?.region?.isocodeShort || source?.region?.isocode
      };
    }

    return target;
  }

}
