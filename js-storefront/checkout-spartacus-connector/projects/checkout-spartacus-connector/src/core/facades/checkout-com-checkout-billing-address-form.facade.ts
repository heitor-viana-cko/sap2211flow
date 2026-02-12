import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Address, facadeFactory, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_COM_CHECKOUT_BILLING_ADDRESS_FORM } from './feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: (): CheckoutComBillingAddressFormFacade =>
    facadeFactory({
      facade: CheckoutComBillingAddressFormFacade,
      feature: CHECKOUT_COM_CHECKOUT_BILLING_ADDRESS_FORM,
      methods: [
        'setDeliveryAddressAsBillingAddress',
        'isBillingAddressSameAsDeliveryAddress',
        'isBillingAddressFormValid',
        'markAllAsTouched',
        'getBillingAddress',
        'getSameAsDeliveryAddress',
        'setSameAsDeliveryAddress',
        'isEditModeEnabled',
        'toggleEditMode',
        'setEditToggleState',
        'requestBillingAddress',
        'setBillingAddress',
        'isBillingAddressSameAsDeliveryAddress',
        'setDeliveryAddress',
        'showBillingAddressForm'
      ]
    })
})
export abstract class CheckoutComBillingAddressFormFacade {

  /**
   * Gets the billing address form.
   *
   * @returns {UntypedFormGroup} The billing address form.
   * @since 2211.32.1
   */
  abstract getBillingAddressForm(): UntypedFormGroup;

  /**
   * Sets the delivery address as the billing address.
   * @since 2211.32.1
   *
   * @param {Address | undefined} address - The address to set as the billing address.
   **/
  abstract setDeliveryAddressAsBillingAddress(address: Address | undefined): void;

  /**
   * Checks if the billing address form is valid.
   *
   * @returns {boolean} True if the billing address form is valid, false otherwise.
   * @since 2211.32.1
   */
  abstract isBillingAddressFormValid(): boolean;

  /**
   * Marks all fields in the billing address form as touched.
   * @since 2211.32.1
   */
  abstract markAllAsTouched(): void;

  /**
   * Gets the billing address.
   *
   * @returns {Address} The billing address.
   * @since 2211.32.1
   */
  abstract getBillingAddress(): Address;

  /**
   * Gets the current state of the "same as delivery address" flag.
   *
   * @returns {Observable<boolean>} An observable containing the current state.
   * @since 2211.32.1
   */
  abstract getSameAsDeliveryAddress(): Observable<boolean>

  /**
   * Sets the "same as delivery address" flag to the specified value and updates the delivery address.
   *
   * @param {boolean} sameAsDeliveryAddress - The new value for the "same as delivery address" flag.
   * @since 2211.32.1
   */
  abstract setSameAsDeliveryAddress(sameAsDeliveryAddress: boolean): void

  /**
   * Checks if the edit mode is enabled.
   *
   * @returns {Observable<boolean>} An observable indicating whether the edit mode is enabled.
   * @since 2211.32.1
   */
  abstract isEditModeEnabled(): Observable<boolean>

  /**
   * Checks if the edit mode is currently enabled.
   *
   * @returns {boolean} True if the edit mode is enabled, false otherwise.
   * @since 2211.32.1
   */
  abstract isEditModeEnabledValue(): boolean;

  /**
   * Toggles the edit mode state between enabled and disabled.
   * @since 2211.32.1
   */
  abstract toggleEditMode(): void;

  /**
   * Sets the edit toggle state to the specified value.
   *
   * @param {boolean} state - The new state to set for the edit toggle.
   * @since 2211.32.1
   */
  abstract setEditToggleState(state: boolean): void;

  /**
   * Requests the billing address for the current user and cart.
   *
   * @returns {Observable<QueryState<Address>>} An observable emitting the query state of the billing address.
   * @since 2211.32.1
   */
  abstract requestBillingAddress(): Observable<QueryState<Address>>;

  /**
   * Sets the billing address and updates the delivery address.
   *
   * @param {Address} billingAddress - The billing address to set.
   * @param {Address} deliveryAddress - The delivery address to update.
   * @since 2211.32.1
   */
  abstract setBillingAddress(billingAddress: Address, deliveryAddress: Address): void;

  /**
   * Checks if the billing address is the same as the delivery address.
   *
   * @returns {boolean} True if the billing address is the same as the delivery address, false otherwise.
   * @since 2211.32.1
   */
  abstract isBillingAddressSameAsDeliveryAddress(): boolean;

  /**
   * Sets the delivery address.
   *
   * @param {Address} address - The delivery address to set.
   * @since 2211.32.1
   */
  abstract setDeliveryAddress(address: Address): void;

  abstract showBillingAddressForm(): Observable<boolean>;
}
