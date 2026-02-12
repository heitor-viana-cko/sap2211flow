import { inject, Injectable } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { Address, QueryState } from '@spartacus/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

const mockBillingAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  line1: 'Green Street',
  line2: '420',
  town: 'Montreal',
  postalCode: 'H3A',
  country: { isocode: 'CA' },
  region: { isocodeShort: 'QC' },
};

const userId = 'current';
const cartId = 'cart';

export class MockCheckoutComBillingAddressFormService implements Partial<CheckoutComBillingAddressFormService> {
  private form: UntypedFormGroup;
  private _sameAsDeliveryAddress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  fb: FormBuilder = inject(FormBuilder);
  billingAddress$: BehaviorSubject<Address> = new BehaviorSubject<Address>(mockBillingAddress);
  editModeStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  getBillingAddress(): Address {
    return mockBillingAddress;
  }

  isBillingAddressSameAsDeliveryAddress(): boolean {
    return true;
  }

  isBillingAddressFormValid(): boolean {
    return true;
  }

  getBillingAddressForm(): UntypedFormGroup {
    if (!this.form) {
      this.form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        line1: ['', Validators.required],
        line2: [''],
        town: ['', Validators.required],
        region: this.fb.group({
          isocodeShort: [null, Validators.required],
        }),
        country: this.fb.group({
          isocode: [null, Validators.required],
        }),
        postalCode: ['', Validators.required],
      });
    }
    return this.form;
  }

  getSameAsDeliveryAddress(): BehaviorSubject<boolean> {
    return this._sameAsDeliveryAddress;
  }

  isEditModeEnabled(): Observable<boolean> {
    return of(false);
  }

  isEditModeEnabledValue(): boolean {
    return false;
  }

  markAllAsTouched(): void {
  }

  requestBillingAddress(): Observable<QueryState<Address>> {
    return of({
      loading: false,
      data: mockBillingAddress,
      error: false
    });
  }

  setBillingAddress(billingAddress: Address, deliveryAddress?: Address): void {
  }

  setDeliveryAddressAsBillingAddress(address: Address | undefined): void {
  }

  setEditToggleState(state: boolean): void {
  }

  setSameAsDeliveryAddress(sameAsDeliveryAddress: boolean): void {
  }

  toggleEditMode(): void {
  }

  updateDeliveryAddress(address: Address, deliveryAddress: Address): void {
  }

  protected checkoutPreconditions(): Observable<[string, string]> {
    return of([userId, cartId]);
  }

}
