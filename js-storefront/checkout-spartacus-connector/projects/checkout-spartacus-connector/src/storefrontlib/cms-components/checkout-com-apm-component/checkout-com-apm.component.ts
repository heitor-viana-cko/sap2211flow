import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { ApplePayPaymentRequest } from '@checkout-core/model/ApplePay';
import { ApmData, PaymentType } from '@checkout-model/ApmData';
import { GooglePayMerchantConfiguration } from '@checkout-model/GooglePay';
import { CheckoutComApmService } from '@checkout-services/apm/checkout-com-apm.service';
import { createApplePaySession } from '@checkout-services/applepay/applepay-session';
import { CheckoutComApplepayService } from '@checkout-services/applepay/checkout-com-applepay.service';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CheckoutComGooglepayService } from '@checkout-services/googlepay/checkout-com-googlepay.service';
import { makeFormErrorsVisible } from '@checkout-shared/make-form-errors-visible';
import { Address, CurrencyService, GlobalMessageService, GlobalMessageType, LoggerService, WindowRef } from '@spartacus/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, finalize, first, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-apm',
  templateUrl: './checkout-com-apm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmComponent implements OnInit {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> = new EventEmitter<{
    paymentDetails: ApmPaymentDetails,
    billingAddress: Address
  }>();
  @Input() goBack: () => void;
  @Input() processing: boolean = false;
  public submitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public selectedApm$: Observable<ApmData> = this.checkoutComApmService.getSelectedApmFromState();
  public paymentType: typeof PaymentType = PaymentType;
  public availableApms$: Observable<ApmData[]> = this.checkoutComApmService.getAvailableApmsFromState();
  public card$: Observable<ApmData> = this.checkoutComApmService.getApmByComponent('cardComponent', PaymentType.Card);
  public applePay$: Observable<ApmData>;
  public googlePay$: Observable<ApmData>;
  public ach$: Observable<ApmData>;
  public loading$: Observable<boolean> = this.checkoutComApmService.getIsApmLoadingFromState();
  protected logger: LoggerService = inject(LoggerService);
  protected checkoutBillingAddressFormService: CheckoutComBillingAddressFormService = inject(CheckoutComBillingAddressFormService);
  public billingAddressForm: UntypedFormGroup = this.checkoutBillingAddressFormService.getBillingAddressForm();
  protected paymentDetails: ApmData;
  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Constructor for the CheckoutComApmComponent.
   * Initializes various services required for the component.
   *
   * @param {CheckoutComApmService} checkoutComApmService - Service to manage APMs.
   * @param {CheckoutComGooglepayService} checkoutComGooglePayService - Service to manage Google Pay.
   * @param {CurrencyService} currencyService - Service to manage currency.
   * @param {CheckoutComApplepayService} checkoutComApplepayService - Service to manage Apple Pay.
   * @param {GlobalMessageService} globalMessageService - Service to manage global messages.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @since 2211.31.1
   */
  constructor(
    protected globalMessageService: GlobalMessageService,
    protected currencyService: CurrencyService,
    protected windowRef: WindowRef,
    protected checkoutComApmService: CheckoutComApmService,
    protected checkoutComGooglePayService: CheckoutComGooglepayService,
    protected checkoutComApplepayService: CheckoutComApplepayService
  ) {
  }

  /**
   * Angular lifecycle hook that is called after the component's view has been initialized.
   * Subscribes to the selected APM observable and sets the payment details or selects the default APM if none is selected.
   * Also initializes various APM-related functionalities.
   *
   * @return {void}
   * @since 4.2.7
   */
  ngOnInit(): void {
    this.selectedApm$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (apm: ApmData): void => {
        if (!apm) {
          this.checkoutComApmService.selectApm({ code: PaymentType.Card });
        } else {
          this.paymentDetails = apm;
        }
      },
      error: (err: unknown): void => this.logger.error('selectedApm with errors', { err })
    });

    this.getActiveApms();
    this.listenToAvailableApmsAndProtectSelectedApm();
    this.initializeGooglePay();
    this.initializeAch();
    this.initializeApplePay();
    this.checkoutBillingAddressFormService.requestBillingAddress().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Selects the APM payment details and emits the payment details and billing address.
   * If the billing address is not the same as the shipping address, it validates the billing address form.
   * If the form is invalid, it makes the form errors visible and returns early.
   * If the form is valid or the billing address is the same as the shipping address, it sets the submitting state to true
   * and emits the payment details and billing address using the `setPaymentDetails` event emitter.
   *
   * @return {void}
   * @since 4.2.7
   */
  selectApmPaymentDetails(): void {
    let billingAddress: Address = null;
    if (!this.checkoutBillingAddressFormService.getSameAsDeliveryAddressValue()) {
      if (this.checkoutBillingAddressFormService.isBillingAddressFormValid()) {
        billingAddress = this.checkoutBillingAddressFormService.getBillingAddress();
      } else {
        this.makeFormErrorsVisible();
        return;
      }
    }

    this.submitting$.next(true);

    this.setPaymentDetails.emit({
      paymentDetails: { type: this.paymentDetails?.code } as ApmPaymentDetails,
      billingAddress
    });
  }

  makeFormErrorsVisible(): void {
    makeFormErrorsVisible(this.billingAddressForm);
  }

  /**
   * Determines whether to show the billing form and continue button based on the payment type.
   *
   * @param {PaymentType} code - The payment type code.
   * @return {boolean} - Returns true if the billing form and continue button should be shown, otherwise false.
   * @since 4.2.7
   */
  showBillingFormAndContinueButton(code: PaymentType): boolean {
    switch (code) {
    case PaymentType.Card:
    case PaymentType.Klarna:
    case PaymentType.GooglePay:
    case PaymentType.ApplePay:
    case PaymentType.Sepa:
    case PaymentType.Oxxo:
    case PaymentType.Fawry:
    case PaymentType.iDeal:
    case PaymentType.ACH:
      return false;

    default:
      return true;
    }
  }

  /**
   * Updates the selected APM (Alternative Payment Method) based on the provided list of available APMs.
   * If the selected APM is not a valid APM component, the function returns early.
   * If the selected APM is not found in the list of available APMs, it adds a global error message and selects the default Card payment type.
   *
   * @param {ApmData[]} apms - The list of available APMs.
   * @param {ApmData} selectedApm - The selected APM to be updated.
   * @return {void}
   * @since 4.2.7
   */
  updateSelectedApm(apms: ApmData[], selectedApm: ApmData): void {
    const isApm: boolean = this.evaluateIsApmComponent(selectedApm);

    if (!isApm) {
      return;
    }

    const apm: ApmData = apms.find(({ code }: ApmData): boolean => code === selectedApm?.code);

    this.submitting$.next(false);
    this.processing = false;

    if (!apm) {
      this.globalMessageService.add({ key: 'paymentForm.apmChanged' }, GlobalMessageType.MSG_TYPE_ERROR);

      this.checkoutComApmService.selectApm({
        code: PaymentType.Card
      });
    }
  }

  /**
   * Checks if the billing address edit mode is enabled.
   *
   * @return {Observable<boolean>} - An observable that emits a boolean value indicating whether the billing address edit mode is enabled.
   * @since 2211.32.1
   */
  showContinueButton(): Observable<boolean> {
    return combineLatest([
      this.checkoutBillingAddressFormService.showBillingAddressForm(),
      this.checkoutBillingAddressFormService.isEditModeEnabled()
    ]).pipe(
      map(([showBillingAddressForm, editModeEnabled]: [boolean, boolean]): boolean => showBillingAddressForm ?? editModeEnabled)
    );
  }

  /**
   * Requests the active APMs and subscribes to the response.
   * The list of available APMs will be updated when the currency changes.
   *
   * @protected
   * @return {void}
   * @since 4.2.7
   */
  protected getActiveApms(): void {
    this.checkoutComApmService.requestAvailableApms().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (err: unknown): void => this.logger.error('Error requesting available APMs', { err })
    });
  }

  protected evaluateIsApmComponent(selectedApm: ApmData): boolean {
    return (
      selectedApm?.code !== PaymentType.Card
      && selectedApm?.code !== PaymentType.ApplePay
      && selectedApm?.code !== PaymentType.GooglePay
    );
  }

  /**
   * Prevents the selected APM from not being in the list of available APMs.
   * If the current selected APM is not available in the new context, it will roll back to Card.
   *
   * @protected
   * @return {void}
   * @since 4.2.7
   */
  protected listenToAvailableApmsAndProtectSelectedApm(): void {
    combineLatest([
      this.checkoutComApmService.getAvailableApmsFromState(),
      this.checkoutComApmService.getSelectedApmFromState()
    ]).pipe(
      filter(([availableApms]: [ApmData[], ApmData]): boolean => !!availableApms),
      finalize((): void => this.submitting$.next(false)),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe({
        next: ([availableApms, selectedApm]: [ApmData[], ApmData]): void => {
          this.updateSelectedApm(availableApms, selectedApm);
        },
        error: (err: unknown): void => this.logger.error('listenToAvailableApmsAndProtectSelectedApm with errors', { err })
      });
  }

  /**
   * Initializes Google Pay by requesting the merchant configuration and setting up the observable.
   * The observable emits the APM data for Google Pay once the merchant configuration is retrieved.
   *
   * @protected
   * @return {void}
   * @since 2211.31.1
   */
  protected initializeGooglePay(): void {
    this.googlePay$ = this.checkoutComApmService.getApmByComponent('googlePayComponent', PaymentType.GooglePay).pipe(
      switchMap((apmData: ApmData): Observable<ApmData> => {
        this.checkoutComGooglePayService.requestMerchantConfiguration();
        return this.checkoutComGooglePayService.getMerchantConfigurationFromState().pipe(
          first((c: GooglePayMerchantConfiguration): boolean => !!c),
          map((): ApmData => apmData),
          takeUntilDestroyed(this.destroyRef)
        );
      })
    );
  }

  /**
   * Initializes ACH by requesting the APM component and setting up the observable.
   * The observable emits the APM data for ACH once the component is retrieved.
   *
   * @protected
   * @return {void}
   * @since 4.2.7
   */
  protected initializeAch(): void {
    this.ach$ = this.checkoutComApmService.getApmByComponent('achComponent', PaymentType.ACH).pipe(
      filter((component: ApmData): boolean => !!component),
      map((apmData: ApmData): ApmData => apmData)
    );
  }

  /**
   * Initializes Apple Pay by creating an Apple Pay session and requesting the payment request.
   * If Apple Pay is available and can make payments, it sets up the observable to emit the APM data for Apple Pay.
   *
   * @private
   * @return {void}
   * @since 2211.31.1
   */
  private initializeApplePay(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ApplePaySession: any = createApplePaySession(this.windowRef);
    if (ApplePaySession && ApplePaySession.canMakePayments()) {
      this.checkoutComApplepayService.requestApplePayPaymentRequest();
      this.applePay$ = combineLatest([
        this.checkoutComApmService.getApmByComponent('applePayComponent', PaymentType.ApplePay),
        this.checkoutComApplepayService.getPaymentRequestFromState()
      ]).pipe(
        filter(([component, paymentRequest]: [ApmData, ApplePayPaymentRequest]): boolean => !!component && !!paymentRequest && Object.keys(paymentRequest).length > 0),
        map(([apmData]: [ApmData, ApplePayPaymentRequest]): ApmData => apmData)
      );
    }
  }
}
