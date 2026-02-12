import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { Address, QueryState } from "@spartacus/core";
import { Observable, of } from "rxjs";

const mockBillingAddress: Address = {
  firstName: "John",
  lastName: "Doe",
  line1: "Green Street",
  line2: "420",
  town: "Montreal",
  postalCode: "H3A",
  country: { isocode: "CA" },
  region: { isocodeShort: "QC" }
};

export class MockCheckoutComCheckoutBillingAddressFacade implements Partial<CheckoutComCheckoutBillingAddressFacade> {
  requestBillingAddress(): Observable<QueryState<Address>> {
    return of({
      loading: false,
      data: mockBillingAddress,
      error: false
    });
  }

  setDeliveryAddressAsBillingAddress(address: Address): void {
  }
}
