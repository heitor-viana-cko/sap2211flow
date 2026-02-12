import { inject, Injectable } from '@angular/core';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComBillingAddressFormFacade } from '@checkout-facades/checkout-com-checkout-billing-address-form.facade';
import { CheckoutComCheckoutBillingAddressFacade } from '@checkout-facades/checkout-com-checkout-billing-address.facade';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { Address, EventService, QueryState, Region, UserIdService } from '@spartacus/core';
import { BehaviorSubject, combineLatest, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComBillingAddressFormService extends CheckoutBillingAddressFormService implements CheckoutComBillingAddressFormFacade {
  billingAddress$: BehaviorSubject<Address> = new BehaviorSubject<Address>(undefined);
  areTheSameAddresses$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected editModeStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected deliveryAddress: Address;
  protected checkoutComConnector: CheckoutComConnector = inject(CheckoutComConnector);
  protected userIdService: UserIdService = inject(UserIdService);
  protected activeCartFacade: ActiveCartFacade = inject(ActiveCartFacade);
  protected eventService: EventService = inject(EventService);
  protected checkoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade = inject(CheckoutComCheckoutBillingAddressFacade);
  private _sameAsDeliveryAddress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * Sets the delivery address.
   *
   * This method assigns the provided delivery address to the `deliveryAddress` property.
   *
   * @param deliveryAddress - The delivery address to be set.
   */
  public setDeliveryAddress(deliveryAddress: Address): void {
    this.deliveryAddress = deliveryAddress;
  }

  /**
   * Requests the billing address.
   *
   * This method returns an observable that emits the current state of the billing address query.
   *
   * @returns An observable that emits the current state of the billing address query.
   * @since 2211.32.1
   */
  public requestBillingAddress(): Observable<QueryState<Address>> {
    return this.checkoutBillingAddressFacade.requestBillingAddress().pipe(
      filter((billingAddressState: QueryState<Address>): boolean => !billingAddressState?.loading),
      tap((billingAddressState: QueryState<Address>): void => {
        let billingAddress: Address = billingAddressState.data;
        if (!billingAddress) {
          billingAddress = this.deliveryAddress;
          this.checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress(billingAddress);
        }
        this.setBillingAddress(billingAddress);
        this.areTheSameAddresses$.next(this.compareAddresses(this.billingAddress$.value, this.deliveryAddress));
        this.setSameAsDeliveryAddress(this.areTheSameAddresses$.value, true);
      })
    );
  }

  /**
   * Retrieves the billing address.
   *
   * If the billing address is the same as the delivery address, it returns the billing address.
   * Otherwise, it returns the value from the billing address BehaviorSubject or undefined if not set.
   *
   * @returns The billing address or undefined if not set.
   * @since 2211.32.1
   */
  public override getBillingAddress(): Address {
    return this.billingAddress$.value || undefined;
  }

  /**
   * Sets the billing address and optionally the delivery address.
   *
   * Updates the billing address BehaviorSubject with the provided billing address.
   * If a delivery address is provided, it sets the delivery address as the billing address.
   *
   * @param billingAddress - The billing address to be set.
   * @since 2211.32.1
   */
  public setBillingAddress(billingAddress: Address): void {
    this.billingAddress$.next(billingAddress);
  }

  /**
   * Retrieves the current state of whether the billing address is the same as the delivery address.
   *
   * @returns A BehaviorSubject that emits a boolean indicating if the billing address is the same as the delivery address.
   * @since 2211.32.1
   */
  public getSameAsDeliveryAddress(): Observable<boolean> {
    return this._sameAsDeliveryAddress.pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Retrieves the current value of whether the billing address is the same as the delivery address.
   *
   * This method directly accesses the `_sameAsDeliveryAddress` BehaviorSubject
   * and returns its current value.
   *
   * @returns A boolean indicating if the billing address is the same as the delivery address.
   */
  public getSameAsDeliveryAddressValue(): boolean {
    return this._sameAsDeliveryAddress.value;
  }

  /**
   * Checks if the billing address is the same as the delivery address.
   *
   * @returns A boolean indicating if the billing address is the same as the delivery address.
   * @since 2211.32.1
   */
  public override isBillingAddressSameAsDeliveryAddress(): boolean {
    return this._sameAsDeliveryAddress.value;
  }

  /**
   * Sets the state of whether the billing address is the same as the delivery address.
   *
   * Updates the `_sameAsDeliveryAddress` BehaviorSubject with the provided value.
   * If the value is true, it dispatches an event with the provided delivery address.
   *
   * @param value - A boolean indicating if the billing address is the same as the delivery address.
   * @param firstLoad - An optional boolean indicating if this is the first load. Defaults to `false`.
   * @since 2211.32.1
   */
  public setSameAsDeliveryAddress(value: boolean, firstLoad?: boolean): void {
    this._sameAsDeliveryAddress.next(value);
    if (value === true && !firstLoad) {
      this.setDeliveryAddressAsBillingAddress(this.deliveryAddress);
    }
  }

  /**
   * Compares two addresses to determine if they are equivalent.
   *
   * This method checks if the provided billing address and delivery address are the same.
   * It first verifies if both addresses are defined and if their IDs match. If the IDs do not match,
   * it compares the remaining fields, excluding specific fields that are not relevant for comparison.
   * Special handling is applied for comparing `region` and `country` objects.
   *
   * @param billingAddress - The billing address to compare.
   * @param deliveryAddress - The delivery address to compare.
   * @returns A boolean indicating whether the two addresses are equivalent.
   */
  public compareAddresses(billingAddress: Address, deliveryAddress: Address): boolean {
    if (!billingAddress || !deliveryAddress) {
      return false;
    }

    if (billingAddress.id === deliveryAddress.id) {
      return true;
    }

    const fieldsToExclude: Set<string> = new Set([
      'billingAddress',
      'defaultAddress',
      'email',
      'formattedAddress',
      'id',
      'shippingAddress',
      'title',
      'titleCode',
      'visibleInAddressBook'
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanBillingAddress: Record<string, any> = Object.keys(billingAddress)
      .filter((key: string): boolean => !fieldsToExclude.has(key))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((acc: Record<string, any>, key: string): Record<string, any> => {
        acc[key] = billingAddress[key];
        return acc;
      }, {});

    return Object.keys(cleanBillingAddress).every((key: string): boolean => {
      if (!(key in deliveryAddress)) return false;

      // Compare region objects
      if (key === 'region') {
        const billingRegion: Region = cleanBillingAddress[key];
        const deliveryRegion: Region = deliveryAddress[key];
        if (!billingRegion || !deliveryRegion ||
            typeof billingRegion !== 'object' ||
            typeof deliveryRegion !== 'object') {
          return false;
        }

        const {
          isocode = '',
          isocodeShort = ''
        }: Region = cleanBillingAddress[key];
        const {
          isocode: iso2,
          isocodeShort: isoShort2
        }: Region = deliveryAddress[key];

        return (
          isocode === iso2 ||
          isocode === isoShort2 ||
          isocodeShort === iso2 ||
          isocodeShort === isoShort2
        );
      }

      // Compare country objects
      if (key === 'country' && typeof cleanBillingAddress[key] === 'object') {
        const {
          isocode,
          name
        }: Region = cleanBillingAddress[key];
        const {
          isocode: iso2,
          name: name2
        }: Region = deliveryAddress[key];

        return isocode === iso2 && name === name2;
      }

      // Compare primitive values
      return cleanBillingAddress[key] === deliveryAddress[key];
    });
  }

  /**
   * Get the current toggle state as an observable
   */
  public isEditModeEnabled(): Observable<boolean> {
    return this.editModeStatus$.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Get the current toggle state as an observable
   */
  public isEditModeEnabledValue(): boolean {
    return this.editModeStatus$.value;
  }

  /**
   * Toggle the state (switch between true and false)
   */
  public toggleEditMode(): void {
    this.setEditToggleState(!this.editModeStatus$.value);
  }

  /**
   * Set a specific value (true or false)
   */
  public setEditToggleState(state: boolean): void {
    this.editModeStatus$.next(state);
  }

  /**
   * Sets the delivery address as the billing address.
   *
   * This method overrides the parent implementation to set the provided address
   * as both the delivery and billing address. If an address is provided, it also
   * updates the billing address in the `checkoutBillingAddressFacade`.
   *
   * @param address - The address to be set as both the delivery and billing address, or undefined.
   */
  public override setDeliveryAddressAsBillingAddress(address: Address | undefined): void {
    super.setDeliveryAddressAsBillingAddress(address);
    this.setBillingAddress(address);
    if (address) {
      this.checkoutBillingAddressFacade.setDeliveryAddressAsBillingAddress(address);
    }
  }

  /**
   * Retrieves an observable that emits whether the billing address is the same as the delivery address.
   *
   * This method provides a stream of boolean values indicating if the billing address
   * and delivery address are considered the same.
   *
   * @returns An observable that emits a boolean value.
   */
  public getAreTheSameAddresses(): Observable<boolean> {
    return this.areTheSameAddresses$.asObservable().pipe(
      distinctUntilChanged(),
    );
  }

  public showBillingAddressForm(): Observable<boolean> {
    return combineLatest([
      this.isEditModeEnabled(),
      this.getAreTheSameAddresses(),
      this.getSameAsDeliveryAddress(),
    ]).pipe(
      map(([editModeEnabled, areTheSameAddresses, sameAsDeliveryAddress,]: [boolean, boolean, boolean]): boolean => {
        switch (true) {
        case(sameAsDeliveryAddress):
          return false;

        case (areTheSameAddresses):
          return true;

        default:
          return editModeEnabled;
        }
      }),
      distinctUntilChanged(),
      shareReplay({
        bufferSize: 1,
        refCount: true
      }),
    );
  }
}

