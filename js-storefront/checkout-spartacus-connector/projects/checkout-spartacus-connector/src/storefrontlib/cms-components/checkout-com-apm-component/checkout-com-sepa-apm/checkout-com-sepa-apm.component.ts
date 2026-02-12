import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApmPaymentDetails, SepaPaymentTypeOption, SepaPaymentTypes } from '@checkout-core/interfaces';
import { PaymentType } from '@checkout-model/ApmData';
import { Address, Country, TranslationService, UserPaymentService } from '@spartacus/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { exhaustMap, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-sepa-apm',
  templateUrl: './checkout-com-sepa-apm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComSepaApmComponent implements OnInit, OnDestroy {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> = new EventEmitter<{
    paymentDetails: ApmPaymentDetails,
    billingAddress: Address
  }>();

  submitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  sepaForm: UntypedFormGroup = this.fb.group({
    paymentType: this.fb.group({ code: ['', Validators.required] }),
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    accountIban: ['', Validators.required],
    addressLine1: [null, Validators.required],
    addressLine2: [],
    city: [null, Validators.required],
    postalCode: ['', [
      Validators.required,
      Validators.maxLength(10)
    ]],
    country: this.fb.group({ isocode: ['', Validators.required] }),
  });

  paymentTypes$: Observable<SepaPaymentTypeOption[]>;
  countries$: Observable<Country[]>;

  /**
   * Constructor for the CheckoutComSepaApmComponent.
   * Initializes the form builder, user payment service, and translation service.
   *
   * @param {UntypedFormBuilder} fb - The form builder service used to create forms.
   * @param {UserPaymentService} userPaymentService - The service used to manage user payment information.
   * @param {TranslationService} translationService - The service used to handle translations.
   * @since 4.2.7
   */
  constructor(
    protected fb: UntypedFormBuilder,
    protected userPaymentService: UserPaymentService,
    protected translationService: TranslationService
  ) {
  }

  /**
   * Angular lifecycle hook that is called after the component's view has been initialized.
   * Fetches all billing countries and populates the payment types.
   * If the store is empty, it fetches the countries. This is also used when changing language.
   *
   * @return {void}
   * @since 4.2.7
   */
  ngOnInit(): void {
    this.countries$ = this.userPaymentService.getAllBillingCountries().pipe(
      tap((countries: Country[]): void => {
        // If the store is empty fetch countries. This is also used when changing language.
        if (Object.keys(countries).length === 0) {
          this.userPaymentService.loadBillingCountries();
        }
      })
    );

    this.populatePaymentTypes();
  }

  /**
   * Populates the available SEPA payment types.
   * Translates the payment type labels and combines them into an observable array of payment type options.
   *
   * @protected
   * @return {void}
   * @since 4.2.7
   */
  protected populatePaymentTypes(): void {
    this.paymentTypes$ = combineLatest([
      this.translationService.translate('sepaForm.paymentTypes.single'),
      this.translationService.translate('sepaForm.paymentTypes.recurring'),
    ]).pipe(
      exhaustMap(([singleTranslation, recurringTranslation]: [string, string]): Observable< SepaPaymentTypeOption[]> => {
        const paymentTypes: SepaPaymentTypeOption[] = [
          {
            code: SepaPaymentTypes.SINGLE,
            label: singleTranslation
          },
          {
            code: SepaPaymentTypes.RECURRING,
            label: recurringTranslation
          },
        ];

        return of(paymentTypes);
      })
    );
  }

  /**
   * Populates the available SEPA payment types.
   * Translates the payment type labels and combines them into an observable array of payment type options.
   *
   * @protected
   * @return {void}
   */
  next(): void {
    const {
      valid,
      value
    }: UntypedFormGroup = this.sepaForm;
    if (valid) {
      const paymentDetails: ApmPaymentDetails = {
        type: PaymentType.Sepa,
        ...value,
        country: value.country.isocode,
        paymentType: value.paymentType.code
      };

      this.submitting$.next(true);

      this.setPaymentDetails.emit({
        paymentDetails,
        billingAddress: {
          firstName: value.firstName,
          lastName: value.lastName,
          line1: value.addressLine1,
          line2: value.addressLine2 || '',
          postalCode: value.postalCode,
          town: value.city,
          country: value.country,
        } as Address
      });
    } else {
      this.sepaForm.markAllAsTouched();
    }
  }

  /**
   * Angular lifecycle hook that is called when the component is destroyed.
   * Sets the submitting state to false.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    this.submitting$.next(false);
  }

}
