import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { makeFormErrorsVisible } from '@checkout-shared/make-form-errors-visible';
import { CheckoutPaymentFormComponent } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  CardType,
  GlobalMessageService,
  GlobalMessageType,
  LoggerService,
  TranslationService,
  UserAddressService,
  UserIdService,
  UserPaymentService
} from '@spartacus/core';
import { LaunchDialogService } from '@spartacus/storefront';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import {
  FrameCardTokenizationFailedEvent,
  FrameCardTokenizedEvent,
  FramePaymentMethodChangedEvent,
  FramesCardholder,
  FramesLocalization
} from '../checkout-com-frames-form/interfaces';

@Component({
  selector: 'lib-checkout-com-payment-form',
  templateUrl: './checkout-com-payment-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComPaymentFormComponent extends CheckoutPaymentFormComponent implements OnInit, OnDestroy {
  @Input() processing: boolean = false;
  @Output() override setPaymentDetails: EventEmitter<{
    paymentDetails: CheckoutComPaymentDetails,
    billingAddress: Address
  }> = new EventEmitter<{
    paymentDetails: CheckoutComPaymentDetails,
    billingAddress: Address
  }>();
  public submitEvent$: Subject<void> = new Subject<void>();
  public submitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canSaveCard$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public override paymentForm: UntypedFormGroup = this.fb.group({
    defaultPayment: [false],
    save: [false],
    accountHolderName: ['', false]
  });
  framesLocalization$: Observable<FramesLocalization>;
  framesCardholder$: EventEmitter<FramesCardholder> = new EventEmitter<FramesCardholder>();
  override billingAddressService: CheckoutComBillingAddressFormService = inject(CheckoutComBillingAddressFormService);
  protected logger: LoggerService = inject(LoggerService);
  protected showBillingAddressForm$: Observable<boolean> = this.billingAddressService.showBillingAddressForm();
  protected destroyRef: DestroyRef = inject(DestroyRef);
  private spartacusCardTypes: CardType[] = [];
  private framesPaymentMethod: string = null;

  /**
   * Constructor for the CheckoutComPaymentFormComponent.
   * Initializes the component with the provided services and calls the parent class's constructor.
   *
   * @param {CheckoutComFlowFacade} checkoutPaymentFacade - The checkout payment facade service.
   * @param {CheckoutDeliveryAddressFacade} checkoutDeliveryAddressFacade - The checkout delivery address facade service.
   * @param {UserPaymentService} userPaymentService - The user payment service.
   * @param {GlobalMessageService} globalMessageService - The global message service.
   * @param {UntypedFormBuilder} fb - The form builder service.
   * @param {UserAddressService} userAddressService - The user address service.
   * @param {LaunchDialogService} launchDialogService - The launch dialog service.
   * @param {TranslationService} translationService - The translation service.
   * @param {UserIdService} userIdService - The user ID service.
   * @since 5.2.0
   */
  constructor(
    protected override checkoutPaymentFacade: CheckoutComFlowFacade,
    protected override checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected override userPaymentService: UserPaymentService,
    protected override globalMessageService: GlobalMessageService,
    protected override fb: UntypedFormBuilder,
    protected override userAddressService: UserAddressService,
    protected override launchDialogService: LaunchDialogService,
    protected override translationService: TranslationService,
    protected userIdService: UserIdService
  ) {
    super(
      checkoutPaymentFacade,
      checkoutDeliveryAddressFacade,
      userPaymentService,
      globalMessageService,
      fb,
      userAddressService,
      launchDialogService,
      translationService
    );
  }

  /**
   * Initializes the component.
   * Calls the parent class's `ngOnInit` method, loads payment card types,
   * checks if the payment can be saved, binds payment form changes,
   * and sets the frames localization observable.
   *
   * @override
   * @returns {void}
   * @since 4.2.7
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.getPaymentCardTypes();
    this.canSavePayment();
    this.bindPaymentFormChanges();
    this.framesLocalization$ = this.getFramesLocalization();
  }

  /**
   * Retrieves the available payment card types from the checkout payment facade.
   * Filters out null or empty card types and updates the local `spartacusCardTypes` array.
   * Subscribes to the observable and handles the response or error.
   *
   * @returns {void}
   * @since 5.2.0
   */
  getPaymentCardTypes(): void {
    this.checkoutPaymentFacade.getPaymentCardTypes().pipe(
      filter((types: CardType[]): boolean => types != null && types?.length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (cardTypes: CardType[]): void => {
        this.spartacusCardTypes = cardTypes;
      },
      error: (err: unknown): void => this.logger.error('getCardTypes with errors', { err })
    });
  }

  /**
   * Checks if the payment can be saved by retrieving the user ID and
   * determining if the card can be saved for the user.
   * Updates the `canSaveCard$` observable with the result.
   *
   * @returns {void}
   * @since 5.2.0
   */
  canSavePayment(): void {
    this.userIdService.getUserId().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (userId: string): void => {
        this.canSaveCard$.next(
          this.checkoutPaymentFacade.canSaveCard(userId)
        );
      },
      error: (err: unknown): void => this.logger.error('getUserId with errors', { err })
    });
  }

  /**
   * Binds changes to the payment form and emits the account holder's name
   * to the `framesCardholder$` event emitter.
   * Uses debounce to limit the rate of change detection and ensures
   * distinct changes are processed.
   *
   * @returns {void}
   * @since 5.2.0
   */
  bindPaymentFormChanges(): void {
    this.paymentForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (changes: any): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { accountHolderName }: any = changes;
        this.framesCardholder$.emit({
          name: accountHolderName
        });
      },
      error: (err: unknown): void => this.logger.error('valueChanges with erorrs', { err })
    });
  }

  /**
   * Validates the payment and billing address forms, and if all forms are valid,
   * sets the submitting state to true and emits the submit event.
   *
   * @override
   * @returns {void}
   * @since 4.2.7
   */
  override next(): void {
    let everyFormIsValid: boolean = true;
    if (
      this.billingAddressService.isEditModeEnabledValue() &&
      !this.billingAddressService.isBillingAddressSameAsDeliveryAddress() &&
      !this.billingAddressService.isBillingAddressFormValid()
    ) {
      everyFormIsValid = false;
      this.billingAddressService.markAllAsTouched();
      makeFormErrorsVisible(this.billingAddressService.getBillingAddressForm());
    }

    if (!this.paymentForm.valid) {
      everyFormIsValid = false;
      makeFormErrorsVisible(this.paymentForm);
    }

    if (everyFormIsValid) {
      this.submitting$.next(true);
      this.submitEvent$.next();
    }
  }

  /**
   * Handles the tokenized event from the payment frames.
   * Extracts user input and billing address from the payment form,
   * constructs the payment details object, and emits the setPaymentDetails event.
   *
   * @param {FrameCardTokenizedEvent} event - The event containing the tokenized card details.
   * @returns {void}
   * @since 4.7.2
   */
  tokenized(event: FrameCardTokenizedEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userInput: any = this.paymentForm.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let billingAddress: any = null;
    this.sameAsDeliveryAddress = this.billingAddressService.isBillingAddressSameAsDeliveryAddress();
    if (
      !this.billingAddressService.isBillingAddressSameAsDeliveryAddress() &&
      this.billingAddressService.isBillingAddressFormValid()
    ) {
      billingAddress = this.billingAddressService.getBillingAddressForm().value;
    } else {
      if (
        !this.billingAddressService.isBillingAddressSameAsDeliveryAddress() &&
        !this.billingAddressService.isEditModeEnabledValue()
      ) {
        billingAddress = this.billingAddressService.getBillingAddress();
      }
    }

    const details: CheckoutComPaymentDetails = {
      addressLine1: billingAddress?.line1,
      addressLine2: billingAddress?.line2,
      city: billingAddress?.town,
      country: billingAddress?.country,
      postalCode: billingAddress?.postalCode,
      billingAddress,
      cardNumber: event.bin + '******' + event.last4,
      cardType: this.getCardTypeFromTokenizedEvent(event.scheme ?? this.framesPaymentMethod),
      defaultPayment: userInput.defaultPayment,
      expiryMonth: event.expiry_month,
      expiryYear: event.expiry_year,
      paymentToken: event.token,
      type: event.type.toUpperCase(),
      cardBin: event.bin,
      saved: userInput.save,
      accountHolderName: userInput.accountHolderName,
      scheme: event?.preferred_scheme
    };

    this.submitting$.next(false);

    this.setPaymentDetails.emit({
      paymentDetails: details,
      billingAddress
    });
  }

  /**
   * Handles the tokenization failed event from the payment frames.
   * Sets the submitting state to false, logs the error, and displays a global error message.
   *
   * @param {FrameCardTokenizationFailedEvent} event - The event containing the tokenization failure details.
   * @returns {void}
   * @since 4.7.2
   */
  tokenizationFailed(event: FrameCardTokenizationFailedEvent): void {
    this.submitting$.next(false);
    this.logger.error('tokenization failed', event);
    this.globalMessageService.add({ key: 'paymentForm.frames.tokenizationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
  }

  /**
   * Handles the payment method change event from the payment frames.
   * Updates the local `framesPaymentMethod` variable with the new payment method.
   *
   * @param {FramePaymentMethodChangedEvent} event - The event containing the new payment method details.
   * @returns {void}
   * @since 4.7.2
   */
  framesPaymentMethodChanged(event: FramePaymentMethodChangedEvent): void {
    if (event?.paymentMethod) {
      this.framesPaymentMethod = event.paymentMethod;
    }
  }

  /**
   * Retrieves the card type from the tokenized event based on the provided scheme.
   * If the scheme matches a known card type, returns the corresponding card type.
   * If no match is found, returns a default card type with the scheme as the name.
   * Handles errors and logs them to the console.
   *
   * @param {string} scheme - The scheme of the tokenized card.
   * @returns {CardType} - The card type corresponding to the scheme.
   * @since 4.7.2
   */
  getCardTypeFromTokenizedEvent(scheme: string): CardType {
    const empty: CardType = { code: 'undefined' };
    if (!scheme || typeof scheme !== 'string') {
      return empty;
    }
    try {
      if (this.spartacusCardTypes?.length) {
        for (const spartacusCardType of this.spartacusCardTypes) {
          if (!spartacusCardType.name) {
            continue;
          }
          const spartacusName: string = spartacusCardType.name.replace(/[^0-9a-z]/gi, '').toLowerCase();
          const framesName: string = scheme.replace(/[^0-9a-z]/gi, '').toLowerCase();
          if (spartacusName === framesName) {
            return spartacusCardType;
          }
        }
      }
      // "Last Resort"
      return {
        code: scheme.toLowerCase(),
        name: scheme
      };
    } catch (e) {
      this.logger.error('getCardTypeFromTokenizedEvent', e, 'scheme:', scheme);
    }
    return empty;
  }

  /**
   * Completes the observable sequence when the component is destroyed.
   * This operator is used to automatically unsubscribe from observables
   * when the component is destroyed, preventing memory leaks.
   *
   * @returns void - An observable that completes when the destroy signal is emitted.
   * @since 4.7.2
   */
  ngOnDestroy(): void {
    this.submitting$.next(false);
    this.processing = false;
  }

  disableContinueButton(): boolean {
    return this.submitting$.value ||
           !this.paymentForm.valid ||
           this.processing ||
           (
             !this.billingAddressService.isBillingAddressSameAsDeliveryAddress() &&
             this.billingAddressService.areTheSameAddresses$.value
           );
  }

  /**
   * Retrieves the frames localization by translating the placeholders for card number, expiry month, expiry year, and CVV.
   * Combines the translations into a single FramesLocalization object.
   *
   * @returns {Observable<FramesLocalization>} - An observable emitting the FramesLocalization object.
   * @since 4.7.2
   */
  protected getFramesLocalization(): Observable<FramesLocalization> {
    return combineLatest([
      this.translationService.translate('paymentForm.frames.placeholders.cardNumberPlaceholder'),
      this.translationService.translate('paymentForm.frames.placeholders.expiryMonthPlaceholder'),
      this.translationService.translate('paymentForm.frames.placeholders.expiryYearPlaceholder'),
      this.translationService.translate('paymentForm.frames.placeholders.cvvPlaceholder')
    ]).pipe(
      take(1),
      map(([cardNumberPlaceholder, expiryMonthPlaceholder, expiryYearPlaceholder, cvvPlaceholder]: [string, string, string, string]): FramesLocalization => ({
        cardNumberPlaceholder,
        expiryMonthPlaceholder,
        expiryYearPlaceholder,
        cvvPlaceholder
      } as FramesLocalization))
    );
  }
}
