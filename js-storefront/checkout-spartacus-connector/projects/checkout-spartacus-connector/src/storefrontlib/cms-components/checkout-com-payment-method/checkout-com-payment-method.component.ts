import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApmPaymentDetails, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComApmFacade } from '@checkout-facades/checkout-com-apm.facade';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { ApmData, PaymentType } from '@checkout-model/ApmData';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutPaymentMethodComponent, CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  Address,
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  LoggerService,
  PaymentDetails,
  QueryState,
  TranslationService,
  tryNormalizeHttpError,
  UserPaymentService
} from '@spartacus/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-payment-method',
  templateUrl: './checkout-com-payment-method.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CheckoutComPaymentMethodComponent extends CheckoutPaymentMethodComponent implements OnInit {
  public requiresCvn: boolean = false;
  public processing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public cvnForm: UntypedFormGroup = new UntypedFormGroup({
    cvn: new UntypedFormControl('', Validators.required)
  });
  public selectedPaymentDetails: PaymentDetails;
  public selectedApm$: Observable<ApmData> = this.checkoutComApmFacade.getSelectedApmFromState();
  public showBillingAddressForm$: Observable<boolean>;
  public isCardPayment: boolean = false;
  public isFlowEnabled: boolean = false;
  public isLoading$: Observable<boolean>;
  protected override deliveryAddress: Address;
  protected shouldRedirect: boolean;
  protected checkoutComBillingAddressFormService: CheckoutComBillingAddressFormService = inject(CheckoutComBillingAddressFormService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private logger: LoggerService = inject(LoggerService);

  constructor(
    protected override userPaymentService: UserPaymentService,
    protected override checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected override checkoutPaymentFacade: CheckoutComFlowFacade,
    protected override activatedRoute: ActivatedRoute,
    protected override translationService: TranslationService,
    protected override activeCartFacade: ActiveCartFacade,
    protected override checkoutStepService: CheckoutStepService,
    protected override globalMessageService: GlobalMessageService,
    protected checkoutComApmFacade: CheckoutComApmFacade
  ) {
    super(
      userPaymentService,
      checkoutDeliveryAddressFacade,
      checkoutPaymentFacade,
      activatedRoute,
      translationService,
      activeCartFacade,
      checkoutStepService,
      globalMessageService
    );

  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getSelectedApm();
    this.getDeliveryAddress();
    this.initializeFlow();
    this.bindShowBillingAddressForm();
  }

  /**
   * Subscribes to the selected APM (Alternative Payment Method) observable.
   * Updates the `isCardPayment` flag based on the selected APM's code.
   * Logs any errors that occur during the subscription.
   *
   * @returns {void}
   * @since 5.2.0
   */
  getSelectedApm(): void {
    this.selectedApm$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (apm: ApmData): void => {
        this.isCardPayment = apm.code === PaymentType.Card;
      },
      error: (error: unknown): void => {
        this.logger.error('selectedApm with errors', { error });
      }
    });
  }

  /**
   * Initializes the component by calling the parent class's `ngOnInit` method.
   * Retrieves the active cart ID, user ID, selected APM, and delivery address.
   *
   * @override
   * @returns {void}
   * @since 5.2.0
   */
  getDeliveryAddress(): void {
    this.checkoutDeliveryAddressFacade.getDeliveryAddressState()
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (deliveryAddress: QueryState<Address>): void => {
          this.deliveryAddress = deliveryAddress?.data;
        },
        error: (error: unknown): void => this.logger.error('getDeliveryAddress with errors', { error })
      });
  }

  /**
   * Selects the payment method by calling the parent class's `selectPaymentMethod` method.
   * Updates the local `selectedPaymentDetails` variable with the provided payment details.
   *
   * @override
   * @param {PaymentDetails} paymentDetails - The payment details to be selected.
   * @returns {void}
   * @since 4.7.2
   */
  override selectPaymentMethod(paymentDetails: PaymentDetails): void {
    // call the ootb payment details API for saved cards only!
    super.selectPaymentMethod(paymentDetails);

    this.selectedPaymentDetails = paymentDetails;
  }

  /**
   * Proceeds to the next step in the checkout process.
   * If CVN (Card Verification Number) is required and the selected payment details are available,
   * validates the CVN form. If the form is invalid, marks all fields as touched and stops the process.
   * Otherwise, updates the selected payment method with the CVN and proceeds to the next step.
   *
   * @override
   * @returns {void}
   * @since 4.7.2
   */
  override next(): void {
    if (this.requiresCvn && this.selectedPaymentDetails) {
      // TODO cvv is not always required. we need a config from the BE
      if (this.cvnForm.invalid) {
        this.cvnForm.markAllAsTouched();
        return;
      } else {
        this.selectPaymentMethod({
          ...this.selectedPaymentDetails,
          cvn: this.cvnForm.value.cvn
        });
      }
    }

    super.next();
  }

  /**
   * Sets the payment details by updating the billing address and creating new payment details.
   * If the billing address is not provided, it uses the delivery address.
   * Updates the `processing$` observable to indicate the processing state.
   * Logs any errors that occur during the process.
   *
   * @override
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be set.
   * @param {Address} [billingAddress] - The billing address to be used. If not provided, the delivery address is used.
   * @returns {void}
   * @since 2211.31.1
   */
  override setPaymentDetails({
    paymentDetails,
    billingAddress
  }: { paymentDetails: CheckoutComPaymentDetails; billingAddress?: Address; }): void {
    const details: CheckoutComPaymentDetails = { ...paymentDetails } as CheckoutComPaymentDetails;
    if (billingAddress == null) {
      billingAddress = this.deliveryAddress;
    }
    details.billingAddress = billingAddress;

    this.busy$.next(true);
    this.checkoutPaymentFacade.createPaymentDetails(details).pipe(
      finalize((): void => this.onSuccess()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.shouldRedirect = true;
      },
      complete: (): void => {
        this.next();
      },
      error: (error: unknown): void => {
        this.onError();
        const httpError: HttpErrorModel = tryNormalizeHttpError(error, this.logger);
        const errorMessage: string = httpError?.details?.[0]?.message;
        this.logger.error('createPaymentDetails with errors', { error });
        this.globalMessageService.add(
          {
            raw: errorMessage
          },
          GlobalMessageType.MSG_TYPE_ERROR
        );
      }
    });
  }

  /**
   * Sets the APM (Alternative Payment Method) payment details by updating the billing address and creating new payment details.
   * If the billing address is not provided, it uses the delivery address.
   * Updates the `processing$` observable to indicate the processing state.
   * If the APM is valid for the given billing country, persists the payment details and moves to the next step in checkout.
   * Otherwise, shows an error.
   * Logs any errors that occur during the process.
   *
   * @param {ApmPaymentDetails} paymentDetails - The APM payment details to be set.
   * @param {Address} [billingAddress] - The billing address to be used. If not provided, the delivery address is used.
   * @returns {void}
   * @since 4.7.2
   */
  setApmPaymentDetails({
    paymentDetails,
    billingAddress
  }: {
    paymentDetails: ApmPaymentDetails;
    billingAddress?: Address;
  }): void {
    if (billingAddress == null) {
      billingAddress = this.deliveryAddress;
    }
    const details: ApmPaymentDetails = {
      ...paymentDetails,
      billingAddress
    };
    this.processing$.next(true);
    this.checkoutComApmFacade.createApmPaymentDetails(details).pipe(
      finalize((): void => this.onSuccess()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.shouldRedirect = true;
      },
      complete: (): void => {
        this.next();
      },
      error: (error: unknown): void => {
        this.onError();
        const httpError: HttpErrorModel = tryNormalizeHttpError(error, this.logger);
        const errorMessage: string = httpError?.details?.[0]?.message;
        this.logger.error('createPaymentDetails with errors', { error });
        this.globalMessageService.add(
          {
            raw: errorMessage
          },
          GlobalMessageType.MSG_TYPE_ERROR
        );
      }
    });
  }

  initializeFlow(): void {
    this.checkoutPaymentFacade.initializeFlow();
    this.isLoading$ = this.checkoutPaymentFacade.getIsProcessing();
    this.checkoutPaymentFacade.getIsFlowEnabled().pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (isEnabled: boolean): void => {
        this.isFlowEnabled = isEnabled;
      }
    });
  }

  /**
   * Returns the translated label for the payment section depending on the flow.
   * @since 2211.32.1
   */
  getPaymentLabel(): Observable<string> {
    return this.translationService.translate(
      this.isFlowEnabled ? 'paymentForm.billingAddress' : 'paymentForm.payment'
    );
  }

  /**
   * Returns the translated label for the "choose" section depending on the flow.
   * @since 2211.32.1
   */
  getChoosePaymentLabel(): Observable<string> {
    return this.translationService.translate(
      this.isFlowEnabled ? 'paymentForm.chooseBillingAddress' : 'paymentForm.choosePaymentMethod'
    );
  }

  /**
   * Binds the `showBillingAddressForm$` observable to the value returned by the
   * `showBillingAddressForm` method of the `CheckoutComBillingAddressFormService`.
   * This observable determines whether the billing address form should be displayed.
   *
   * @returns {void}
   * @since 2211.32.1
   */
  bindShowBillingAddressForm(): void {
    this.showBillingAddressForm$ = this.checkoutComBillingAddressFormService.showBillingAddressForm();
  }
}
