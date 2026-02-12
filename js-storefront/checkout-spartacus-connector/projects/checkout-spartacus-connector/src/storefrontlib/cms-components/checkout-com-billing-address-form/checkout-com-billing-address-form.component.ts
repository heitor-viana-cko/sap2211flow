import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CheckoutBillingAddressFormComponent } from '@spartacus/checkout/base/components';
import { Address, Country, EventService, FeatureConfigService, GlobalMessageType, HttpErrorModel, LoggerService, QueryState, Region, Translatable } from '@spartacus/core';
import { Card, getAddressNumbers } from '@spartacus/storefront';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-billing-address-form',
  templateUrl: './checkout-com-billing-address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComBillingAddressFormComponent extends CheckoutBillingAddressFormComponent implements OnInit {
  public processing$: Observable<boolean>;
  public selected: Address;
  public showBillingAddressForm$: Observable<boolean>;
  protected logger: LoggerService = inject(LoggerService);
  protected eventService: EventService = inject(EventService);
  protected destroyRef: DestroyRef = inject(DestroyRef);
  protected checkoutComFlowFacade: CheckoutComFlowFacade = inject(CheckoutComFlowFacade);
  protected override billingAddressFormService: CheckoutComBillingAddressFormService = inject(CheckoutComBillingAddressFormService);
  public override sameAsDeliveryAddress: boolean = this.billingAddressFormService.isBillingAddressSameAsDeliveryAddress();
  @Input() override billingAddressForm: UntypedFormGroup = this.billingAddressFormService.getBillingAddressForm();
  protected showSameAsDeliveryAddressCheckbox: boolean;
  protected billingAddress$: Observable<Address> = this.billingAddressFormService.billingAddress$;
  protected isFlowEnabled$: Observable<boolean>;
  protected areTheSameAddresses$: Observable<boolean> = this.billingAddressFormService.getAreTheSameAddresses();
  protected featureConfigService: FeatureConfigService = inject(FeatureConfigService);

  /**
   * Initializes the component by building the billing address form, fetching all billing countries,
   * fetching the delivery address state, binding changes to the regions based on the selected country,
   * and binding the visibility of the "same as shipping address" checkbox to the presence of a shipping address.
   *
   * @return {void}
   * @since 5.2.0
   */
  override ngOnInit(): void {
    // OOTB Functionality splited for better customization
    this.getAllBillingCountries();
    this.getDeliveryAddressState();
    this.bindDeliveryAddressCheckbox();
    this.bindSameAsDeliveryAddressCheckbox();
    this.bindRegionsChanges();
    this.bindLoadingState();
    this.isFlowEnabled();
    this.showBillingAddressForm$ = this.billingAddressFormService.showBillingAddressForm();
  }

  /**
   * Fetches all billing countries and assigns them to the `countries$` observable.
   * If the store is empty, it triggers the loading of billing countries.
   * This method is also used when changing the language.
   *
   * @return {void}
   * @since 5.2.0
   */
  getAllBillingCountries(): void {
    this.countries$ = this.userPaymentService.getAllBillingCountries().pipe(
      tap((countries: Country[]): void => {
        // If the store is empty fetch countries. This is also used when changing language.
        if (Object.keys(countries).length === 0) {
          this.userPaymentService.loadBillingCountries();
        }
      })
    );
  }

  /**
   * Fetches the delivery address state and assigns it to the `shippingAddress$` observable.
   * Maps the `QueryState<Address>` to the `Address` data.
   *
   * @return {void}
   * @since 5.2.0
   */
  getDeliveryAddressState(): void {
    this.deliveryAddress$ = this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      filter((state: QueryState<Address>): boolean => !state.loading && !!state.data),
      map((state: QueryState<Address>): Address => state.data),
      tap((deliveryAddress: Address): void => {
        this.billingAddressFormService.setDeliveryAddress(deliveryAddress);
        this.requestBillingAddress();
      }),
      catchError((error: unknown): Observable<unknown> => {
        this.logger.error('Error fetching delivery address', { error });
        return of(error);
      })
    );
  }

  /**
   * Binds the visibility of the "same as delivery address" checkbox to the presence of a delivery address
   * and whether the delivery address country matches one of the billing countries.
   *
   * @return {void}
   * @since 2211.32.1
   */
  bindDeliveryAddressCheckbox(): void {
    this.showSameAsDeliveryAddressCheckbox$ = combineLatest([
      this.countries$,
      this.deliveryAddress$
    ]).pipe(
      map(([countries, address]: [Country[], Address]): boolean =>
        (address?.country && !!countries.filter((country: Country): boolean => country.isocode === address.country?.isocode).length) ?? false),
      tap((showCheckbox: boolean): void => {
        this.showSameAsDeliveryAddressCheckbox = showCheckbox;
      })
    );
  }

  /**
   * Binds the "same as delivery address" checkbox state to the comparison of the delivery address and billing address.
   * If the billing address is not set, the checkbox will be checked by default.
   * If the billing address is set, the checkbox will be checked if the billing address ID matches the delivery address ID.
   *
   * @return {void}
   * @since 2211.32.1
   */
  bindSameAsDeliveryAddressCheckbox(): void {
    this.billingAddressFormService.getAreTheSameAddresses().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (sameAsDeliveryAddress: boolean): void => {
        this.sameAsDeliveryAddress = sameAsDeliveryAddress;
        if (sameAsDeliveryAddress) {
          this.billingAddressFormService.getBillingAddressForm().reset();
        }
      },
      error: (error: unknown): void => {
        this.logger.error('Error comparing billing and delivery addresses', { error });
      }
    });
  }

  /**
   * Binds changes to the regions based on the selected country in the billing address form.
   * Sets up an observable that listens for changes to the 'country.isocode' form control.
   * When the country changes, it fetches the corresponding regions and enables or disables the 'region.isocode' form control based on the presence of regions.
   *
   * @return {void}
   * @since 5.2.0
   */
  bindRegionsChanges(): void {
    this.regions$ = this.selectedCountry$.pipe(
      switchMap((country: string): Observable<Region[]> => this.userAddressService.getRegions(country)),
      tap((regions: Region[]): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const regionControl: AbstractControl<any, any> = this.billingAddressForm.get(
          'region.isocodeShort'
        );
        if (regions.length > 0) {
          regionControl?.enable();
        } else {
          regionControl?.disable();
        }
      })
    );
  }

  /**
   * Toggles the "same as delivery address" state and updates the billing address form service
   * with the current state of the "same as delivery address" checkbox and the delivery address.
   *
   * @override
   * @return {void}
   * @since 2211.32.1
   */
  override toggleSameAsDeliveryAddress(): void {
    super.toggleSameAsDeliveryAddress();
    this.billingAddressFormService.setSameAsDeliveryAddress(this.sameAsDeliveryAddress);
  }

  /**
   * Returns the appropriate binding label for regions based on the available properties.
   * If the regions array is not empty, it checks the first region object for the presence of 'name' or 'isocodeShort' properties.
   * If 'name' is present, it returns 'name'. If 'isocodeShort' is present, it returns 'isocodeShort'.
   * If neither is present, or if the regions array is empty, it defaults to returning 'isocode'.
   *
   * @param {Region[]} regions - The array of region objects to check.
   * @return {string} - The binding label for the regions.
   * @since 4.2.7
   */
  getRegionBindingLabel(regions: Region[]): string {
    if (regions?.length) {
      if (regions[0].name) {
        return 'name';
      }
      if (regions[0].isocodeShort) {
        return 'isocodeShort';
      }
    }
    return 'isocode';
  }

  /**
   * Returns the appropriate binding value for regions based on the available properties.
   * If the regions array is not empty, it checks the first region object for the presence of 'isocode' or 'isocodeShort' properties.
   * If 'isocode' is present, it returns 'isocode'. If 'isocodeShort' is present, it returns 'isocodeShort'.
   * If neither is present, or if the regions array is empty, it defaults to returning 'isocode'.
   *
   * @param {Region[]} regions - The array of region objects to check.
   * @return {string} - The binding value for the regions.
   * @since 4.2.7
   */
  getRegionBindingValue(regions: Region[]): string {
    if (regions?.length) {
      if (regions[0].isocode) {
        return 'isocode';
      }
      if (regions[0].isocodeShort) {
        return 'isocodeShort';
      }
    }
    return 'isocode';
  }

  /**
   * Submits the billing address form if it is valid. If the form is valid, it updates the payment address
   * using the `checkoutComFlowFacade` and disables the edit mode upon success. If an error occurs,
   * it displays the error message using the `showErrors` method. If the form is invalid, it marks all
   * form controls as touched to trigger validation messages.
   *
   * @return {void}
   * @since 2211.32.1
   */
  submitForm(): void {
    if (this.billingAddressForm.valid) {
      const billingAddress: Address = this.billingAddressForm.value;
      this.checkoutComFlowFacade.updatePaymentAddress(billingAddress).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (): void => {
          this.disableEditMode();
        },
        error: (error: unknown): void => {
          const httpError: HttpErrorModel = error as HttpErrorModel;
          this.showErrors(httpError?.details?.[0]?.message, 'CheckoutComBillingAddressFormComponent::submitForm', error);
        }
      });
    } else {
      this.billingAddressForm.markAllAsTouched();
    }
  }

  /**
   * Enables the edit mode by setting the edit toggle state to true.
   *
   * @return {void}
   * @since 2211.32.1
   */
  enableEditMode(): void {
    this.billingAddressFormService.setEditToggleState(true);
  }

  /**
   * Disables the edit mode by setting the edit toggle state to false.
   *
   * @return {void}
   * @since 2211.32.1
   */
  disableEditMode(): void {
    this.billingAddressFormService.setEditToggleState(false);
  }

  /**
   * Returns the card content for a given address, including the formatted address details and actions.
   * Translates the phone number, mobile number, and edit text, and checks the state of the "same as delivery address" checkbox.
   *
   * @param {Address} address - The address object to generate the card content for.
   * @return {Observable<Card>} - An observable that emits the card content.
   * @since 2211.32.1
   */
  override getAddressCardContent(address: Address): Observable<Card> {
    if (address) {
      const isSelected: boolean = this.selected && !this.sameAsDeliveryAddress && this.selected?.id === address.id;
      return this.translationService
        ? combineLatest([
          this.translationService.translate('addressCard.phoneNumber'),
          this.translationService.translate('addressCard.mobileNumber'),
          this.translationService.translate('common.edit'),
          this.featureConfigService?.isEnabled(
            'a11ySelectLabelWithContextForSelectedAddrOrPayment'
          ) ? this.translationService.translate('addressCard.selectedAddress')
            : this.translationService.translate('addressCard.selected')
        ]).pipe(
          map(([textPhone, textMobile, editText, textSelected]: [string, string, string, string]): Card => {
            let region: string = '';
            if (address?.region && address?.region?.isocode !== '') {
              region = address?.region?.isocode + ', ';
            }
            const numbers: string = getAddressNumbers(address, textPhone, textMobile) || '';
            const actions: { event: string; name: string }[] = [];

            if (!this.sameAsDeliveryAddress) {
              actions.push({
                event: 'select',
                name: 'selectText'
              });

              actions.push({
                event: 'edit',
                name: editText
              });
            }

            return {
              textBold: address?.firstName + ' ' + address?.lastName,
              text: [
                address?.line1,
                address?.line2,
                address?.town + ', ' + region + address.country?.isocode,
                address?.postalCode,
                numbers
              ],
              header: isSelected ? textSelected : '',
              actions
            } as Card;
          })
        )
        : EMPTY;
    }

    return EMPTY;
  }

  /**
   * Binds the loading state of the payment details to the `processing$` observable.
   * This method listens for changes in the payment details state and updates the `processing$` observable
   * with the loading status.
   *
   * @return {void}
   * @since 2211.32.1
   */
  bindLoadingState(): void {
    this.processing$ = this.checkoutComFlowFacade.getPaymentDetailsState().pipe(
      map((state: QueryState<CheckoutComPaymentDetails>): boolean => state?.loading ?? false),
      distinctUntilChanged()
    );
  }

  /**
   * Combines the payment address and billing address observables and returns the appropriate address.
   * If the payment address is available, it returns the payment address; otherwise, it returns the billing address.
   *
   * @return {Observable<Address>} - An observable that emits the appropriate address.
   * @since 2211.32.1
   */
  showSelectedBillingAddress(): Observable<Address> {
    return this.billingAddress$.pipe(
      tap((billingAddress: Address): void => {
        this.selected = billingAddress;
      })
    );
  }

  /**
   * Updates the application's error state and displays an error message to the user.
   *
   * @param {string | Translatable} text - The error message to display to the user.
   * @param {string} logMessage - The custom message to log in the console.
   * @param {unknown} errorMessage - The error object to log.
   * @return {void}
   * @since 2211.32.1
   */
  showErrors(text: string | Translatable, logMessage: string, errorMessage: unknown): void {
    this.globalMessageService.add(
      text,
      GlobalMessageType.MSG_TYPE_ERROR
    );
    this.logger.error(logMessage, { error: errorMessage });
  }

  /**
   * Enables the edit mode for the billing address form.
   * This method calls the `enableEditMode` function to activate the edit mode.
   *
   * @return {void}
   * @since 2211.32.1
   */
  editBillingAddress(): void {
    this.enableEditMode();
  }

  /**
   * Checks if the flow is enabled and assigns the result to the `isFlowEnabled$` observable.
   * This method retrieves the flow state from the `checkoutComFlowFacade`.
   *
   * @return {void}
   * @since 2211.32.1
   */
  isFlowEnabled(): void {
    this.isFlowEnabled$ = this.checkoutComFlowFacade.getIsFlowEnabled();
  }

  /**
   * Requests the billing address from the `billingAddressFormService`.
   * Subscribes to the observable and handles any errors that occur during the request.
   * If an error is encountered, it logs the error and displays an error message to the user.
   *
   * @return {void}
   * @since 2211.32.1
   */
  requestBillingAddress(): void {
    this.billingAddressFormService.requestBillingAddress().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error: unknown): void => {
        const httpError: HttpErrorModel = error as HttpErrorModel;
        this.showErrors(httpError?.details?.[0]?.message, 'CheckoutComBillingAddressFormComponent::requestBillingAddress', error);
      }
    });
  }
}
