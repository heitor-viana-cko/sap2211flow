import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { GlobalMessageService, GlobalMessageType, LoggerService, Translatable, UserIdService, WindowRef } from '@spartacus/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, first, skipWhile, switchMap } from 'rxjs/operators';
import {
  FrameCardBindChangedEvent,
  FrameCardTokenizationFailedEvent,
  FrameCardTokenizedEvent,
  FrameCardValidationChangedEvent,
  FrameElement,
  FrameElementIdentifier,
  FramePaymentMethodChangedEvent,
  FramesCardholder,
  FramesConfig,
  FramesLocalization,
  FramesStyle,
  FrameValidationChangedEvent
} from './interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'lib-checkout-com-frames-form',
  templateUrl: './checkout-com-frames-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComFramesFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() submitEvent: Observable<any> = null; // required
  @Input() form: UntypedFormGroup = new UntypedFormGroup({});
  @Input() cardholderStream: Observable<FramesCardholder> = null;
  @Input() localization: FramesLocalization = null;
  @Input() cardNumberInputName: string = 'cardNumber';
  @Input() expiryDateInputName: string = 'expiryDate';
  @Input() cvvInputName: string = 'cvn';

  @Output() tokenized: EventEmitter<FrameCardTokenizedEvent> = new EventEmitter<FrameCardTokenizedEvent>();
  @Output() tokenizationFailed: EventEmitter<FrameCardTokenizationFailedEvent> = new EventEmitter<FrameCardTokenizationFailedEvent>();
  @Output() paymentMethodChange: EventEmitter<FramePaymentMethodChangedEvent> = new EventEmitter<FramePaymentMethodChangedEvent>();

  public InputType: typeof FrameElementIdentifier = FrameElementIdentifier;
  public paymentIconCssClass$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  showTooltip: boolean = false;
  isABC: boolean;
  cardHolderTooltipLabel: string = 'paymentForm.frames.cardHolderLabelTooltip';
  cardHolderTooltipText: string = 'paymentForm.frames.cardHolderTooltip';
  protected paymentMethod: string;
  protected logger: LoggerService = inject(LoggerService);
  private framesReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private frameActivated: Subject<FrameElement> = new Subject<FrameElement>();
  private frameFocus: Subject<FrameElement> = new Subject<FrameElement>();
  private frameBlur: Subject<FrameElement> = new Subject<FrameElement>();
  private frameValidationChanged: Subject<FrameValidationChangedEvent> = new Subject<FrameValidationChangedEvent>();
  private paymentMethodChanged: Subject<FramePaymentMethodChangedEvent> = new Subject<FramePaymentMethodChangedEvent>();
  private cardValidationChanged: Subject<FrameCardValidationChangedEvent> = new Subject<FrameCardValidationChangedEvent>();
  private cardSubmitted: Subject<void> = new Subject<void>();
  private cardTokenized: Subject<FrameCardTokenizedEvent> = new Subject<FrameCardTokenizedEvent>();
  private cardTokenizationFailed: Subject<FrameCardTokenizationFailedEvent> = new Subject<FrameCardTokenizationFailedEvent>();
  private cardBinChanged: Subject<FrameCardBindChangedEvent> = new Subject<FrameCardBindChangedEvent>();
  private validationStatusMap: Map<FrameElementIdentifier, boolean> = new Map<FrameElementIdentifier, boolean>();
  private config: FramesConfig = null;
  private framesInitialized: boolean = false;
  private destroyRef: DestroyRef = inject(DestroyRef);
  private formSubmitted: boolean = false;
  private isDestroyed: boolean = false;

  /**
   * Constructor for the CheckoutComFramesFormComponent.
   * Initializes the component with the provided services and dependencies.
   *
   * @param {NgZone} ngZone - Angular's NgZone service for running code outside of Angular's zone.
   * @param {CheckoutComPaymentFacade} checkoutComPaymentFacade - Service for handling Checkout.com payment operations.
   * @param {UserIdService} userIdService - Service for retrieving the user ID.
   * @param {GlobalMessageService} globalMessageService - Global message Service.
   * @param {WindowRef} windowRef - Service for accessing the window object.
   * @param {ChangeDetectorRef} cd - Service for detecting changes and updating the view.
   */
  constructor(
    protected ngZone: NgZone,
    protected checkoutComPaymentFacade: CheckoutComPaymentFacade,
    protected userIdService: UserIdService,
    protected globalMessageService: GlobalMessageService,
    protected windowRef: WindowRef,
    protected cd: ChangeDetectorRef
  ) {
  }

  /**
   * Initializes the component by setting the ABC parameter and listening for various events if running in a browser.
   *
   * @return {void}
   * @since 4.2.7
   */
  ngOnInit(): void {
    this.getIsABCParam();

    if (this.windowRef.isBrowser()) {
      this.listenForFramesEvents();
      this.listenForSubmitEvent();
      this.listenForCardHolder();
    }
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component's view.
   * Attempts to initialize the Frames configuration.
   *
   * @return {void}
   */
  ngAfterViewInit(): void {
    this.tryInitFrames();
  }

  /**
   * Cleans up the component by setting the `isDestroyed` flag to true and completing the `drop` subject.
   *
   * @return {void}
   * @since 4.2.7
   */
  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  /**
   * Updates the application's error state and displays an error message to the user.
   *
   * @param {string | Translatable} [text] - string | Translatable
   * @param {string} logMessage - Custom message to show in console
   * @param {string} errorMessage - Application error message
   * @returns {void}
   * @since 2211.30.1
   *
   */
  showErrors(text: string | Translatable, logMessage: string, errorMessage: unknown): void {
    this.globalMessageService.add(
      text,
      GlobalMessageType.MSG_TYPE_ERROR
    );
    this.logger.error(logMessage, { error: errorMessage });
  }

  /**
   * Retrieves the ABC parameter for the user and listens for the merchant key if the parameter is not null.
   * Requests the ABC parameter using the user ID and subscribes to the result.
   * If the ABC parameter is not null, sets the `isABC` property and calls `listenForMerchantKey`.
   * Logs any errors that occur during the subscription.
   *
   * @return {void}
   * @since 4.2.7
   */
  private getIsABCParam(): void {
    this.userIdService.getUserId().pipe(
      first((id: string): boolean => Boolean(id)),
      switchMap((): Observable<boolean> => this.checkoutComPaymentFacade.getIsABCFromState()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (isABC: boolean): void => {
        if (isABC !== null) {
          this.isABC = isABC;
          this.listenForMerchantKey();
        }
      },
      error: (err: unknown): void => {
        this.showErrors(
          { key: 'paymentForm.isABCFailed' },
          'getIsABCParam with errors',
          err
        );
      }
    }
    );
  }

  /**
   * Listens for changes in the cardholder stream and updates the Frames cardholder information accordingly.
   * Subscribes to the `cardholderStream` observable and calls `modifyFramesCardholder` with the new cardholder information.
   * Logs any errors that occur during the subscription.
   *
   * @return {void}
   * @since 4.2.7
   */
  private listenForCardHolder(): void {
    if (this.cardholderStream) {
      this.cardholderStream.pipe(
        filter(Boolean),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (cardholder: FramesCardholder): void => {
          this.modifyFramesCardholder(cardholder);
        },
        error: (err: unknown): void =>
          this.showErrors(
            { raw: err as string },
            'listenForCardHolder with errors',
            err
          )
      });
    }
  }

  /**
   * Listens for the merchant key and updates the Frames configuration accordingly.
   * Requests the OCC merchant key using the user ID and sets the initial Frames configuration.
   * If the merchant key changes, updates the Frames public key.
   *
   * @return {void}
   * @since 4.2.7
   */
  private listenForMerchantKey(): void {
    this.userIdService.getUserId().pipe(
      first((id: string): boolean => Boolean(id)),
      switchMap((): Observable<string> => this.checkoutComPaymentFacade.getOccMerchantKeyFromState().pipe(
        first((k: string): boolean => Boolean(k)),
        switchMap((firstPublicKey: string): Observable<string> => {
          const initialConfig: FramesConfig = {
            publicKey: firstPublicKey,
            cardTokenized: null,
            schemeChoice: this.isABC === false
          };
          this.setConfig(initialConfig);
          return this.checkoutComPaymentFacade.getOccMerchantKeyFromState().pipe(
            skipWhile((pk: string): boolean => pk == null || pk === firstPublicKey)
          );
        }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (publicKey: string): void => {
        this.modifyFramesPublicKey(publicKey);
      },
      error: (err: unknown): void => {
        this.showErrors(
          { key: 'paymentForm.merchantKeyFailed' },
          'listenForMerchantKey with errors',
          err
        );
      }
    });
  }

  /**
   * Returns a validator function for the specified frame element type.
   * The validator checks the validation status of the frame element and returns an error object if invalid.
   *
   * @param {FrameElementIdentifier} fieldType - The type of the frame element to validate.
   * @return {ValidatorFn} A validator function that returns an error object if the frame element is invalid, or null if valid.
   * @since 4.2.7
   */
  private getValidator(fieldType: FrameElementIdentifier): ValidatorFn {
    return (): any => {
      const isValid: boolean = this.validationStatusMap.get(fieldType);
      const errObj: any = {};
      let errKey: string;
      switch (fieldType) {
      case FrameElementIdentifier.CardNumber:
        errKey = 'cardNumberInvalid';
        break;
      case FrameElementIdentifier.ExpiryDate:
        errKey = 'expiryDateInvalid';
        break;
      case FrameElementIdentifier.Cvv:
        errKey = 'cvvInvalid';
        break;
      default:
        return null;
      }
      errObj[errKey] = true;
      if (typeof isValid !== 'boolean') {
        return errObj;
      }
      if (isValid) {
        return null;
      }
      return errObj;
    };
  }

  /**
   * Sets the Frames configuration with the provided initial configuration.
   * Merges the initial configuration with additional properties such as style, event handlers, and localization.
   * Updates the `config` property with the final configuration.
   *
   * @param {FramesConfig} initialConfig - The initial configuration object for Frames.
   * @return {void}
   * @since 4.2.7
   */
  private setConfig(initialConfig: FramesConfig): void {
    const config: FramesConfig = initialConfig;
    config.style = this.getStyleConfig();
    config.ready = (): void => this.framesReady.next(true);
    config.cardTokenized = (e: FrameCardTokenizedEvent): void => this.cardTokenized.next(e);
    config.frameActivated = (e: FrameElement): void => this.frameActivated.next(e);
    config.frameFocus = (e: FrameElement): void => this.frameFocus.next(e);
    config.frameBlur = (e: FrameElement): void => this.frameBlur.next(e);
    config.frameValidationChanged = (e: FrameValidationChangedEvent): void => this.frameValidationChanged.next(e);
    config.paymentMethodChanged = (e: FramePaymentMethodChangedEvent): void => this.paymentMethodChanged.next(e);
    config.cardValidationChanged = (e: FrameCardValidationChangedEvent): void => this.cardValidationChanged.next(e);
    config.cardSubmitted = (): void => this.cardSubmitted.next();
    config.cardTokenizationFailed = (e: FrameCardTokenizationFailedEvent): void => this.cardTokenizationFailed.next(e);
    config.cardBinChanged = (e: FrameCardBindChangedEvent): void => this.cardBinChanged.next(e);

    if (this.localization) {
      config.localization = this.localization;
    }
    this.config = config;
  }

  /**
   * Attempts to initialize the Frames configuration.
   * If initialization fails, retries after a delay of 200 milliseconds.
   * Continues retrying until the component is destroyed.
   *
   * @return {void}
   * @since 4.2.7
   */
  private tryInitFrames(): void {
    if (!this.initFrames(this.config)) {
      setTimeout((): void => {
        if (!this.isDestroyed) {
          this.tryInitFrames();
        }
      }, 200);
    }
  }

  /**
   * Initializes the Frames configuration.
   * Sets the framesReady subject to false initially.
   * If the configuration is not provided, returns false.
   * If the component is destroyed, returns true.
   * Attempts to initialize Frames with the provided configuration.
   * If initialization is successful, sets framesInitialized to true.
   * Catches any errors during initialization and returns false.
   *
   * @param {FramesConfig} config - The configuration object for Frames.
   * @return {boolean} True if Frames is successfully initialized, false otherwise.
   * @since 4.2.7
   */
  private initFrames(config: FramesConfig): boolean {
    this.framesReady.next(false);
    if (!config) {
      return false;
    }
    if (this.isDestroyed) {
      return true;
    }

    const Frames: any = (this.windowRef.nativeWindow as { [key: string]: any })['Frames'];
    if (!Frames) {
      return false;
    }
    try {
      Frames.init({
        ...config,
        modes: [Frames.modes.FEATURE_FLAG_SCHEME_CHOICE],
      });
      this.framesInitialized = true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
    return true;
  }

  /**
   * Modifies the Frames public key.
   * If the provided public key is null, the method returns immediately.
   * If the Frames object is not found, the method returns immediately.
   * If the Frames object is found, sets the public key in Frames and updates the configuration if available.
   *
   * @param {string} publicKey - The public key to be set.
   * @return {void}
   * @since 4.2.7
   */
  private modifyFramesPublicKey(publicKey: string): void {
    if (publicKey == null) {
      return;
    }
    const Frames: any = (this.windowRef.nativeWindow as { [key: string]: any })['Frames'];
    if (!Frames) {
      return;
    }
    try {
      Frames.publicKey = publicKey;
      if (this.config) {
        this.config.publicKey = publicKey;
      }
    } catch (e) {
      this.logger.error(e);
      return;
    }
  }

  /**
   * Listens for various Frames events and updates the form controls and payment method accordingly.
   * Subscribes to the `frameValidationChanged`, `frameActivated`, `paymentMethodChanged`, and `cardBinChanged` observables.
   * Updates the validation status map, form controls, and payment method based on the events received.
   *
   * @return {void}
   * @since 4.2.7
   */
  private listenForFramesEvents(): void {
    this.frameValidationChanged.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (event: FrameValidationChangedEvent): void => {
        this.validationStatusMap.set(event.element, event.isValid && !event.isEmpty);
        const ctrl: AbstractControl<any> = this.getElementByIdentifier(event.element);
        if (ctrl) {
          this.ngZone.run((): void => {
            ctrl.markAsTouched();
            ctrl.markAsDirty();
            ctrl.updateValueAndValidity();

            if (
              event.isValid &&
              event.element === FrameElementIdentifier.CardNumber &&
              this.isABC === true
            ) {
              this.paymentIconCssClass$.next(this.paymentMethod);
            } else if (event.isEmpty) {
              this.paymentIconCssClass$.next('');
              this.paymentMethod = '';
            }
          });
        }
      },
      error: (err: unknown): void => this.logger.error('listenForFramesEvents with errors', { error: err })
    });

    this.frameActivated.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (event: FrameElement): void => {
        const ctrl: AbstractControl<any, any> = this.getElementByIdentifier(event.element);
        if (ctrl) {
          const validator: ValidatorFn = this.getValidator(event.element);
          this.ngZone.run((): void => {
            ctrl.setValidators(validator);
            ctrl.updateValueAndValidity();
          });
        }
      },
      error: (err: unknown): void => this.logger.error('frameActivated with errors', { error: err })
    });

    this.paymentMethodChanged.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (event: FramePaymentMethodChangedEvent): void => {
        this.ngZone.run((): void => {
          this.paymentMethodChange.next(event);

          if (event.paymentMethod) {
            this.paymentMethod = event.paymentMethod
              .replace(/\s+/g, '-') // replace space with a dash
              .toLowerCase();
          } else {
            this.paymentMethod = ''; // reset the payment method
          }
        });
      },
      error: (err: unknown): void => this.logger.error('paymentMethodChanged with errors', { error: err })
    });

    this.cardBinChanged.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (event: FrameCardBindChangedEvent): void => {
        this.showTooltip = event?.isCoBadged;
        this.cd.detectChanges();
      },
      error: (err: unknown): void => this.logger.error('isCobadged', { error: err })
    }
    );
  }

  /**
   * Retrieves the form control associated with the given FrameElementIdentifier.
   *
   * @param {FrameElementIdentifier} identifier - The identifier of the frame element.
   * @return {AbstractControl | undefined} The form control associated with the given identifier, or undefined if not found.
   * @since 4.2.7
   */
  private getElementByIdentifier(identifier: FrameElementIdentifier): AbstractControl | undefined {
    const controlName: string = this.getInputNameByIdentifier(identifier);
    if (!controlName) {
      return undefined;
    }
    return this.form.controls[controlName];
  }

  /**
   * Returns the input name corresponding to the given FrameElementIdentifier.
   *
   * @param {FrameElementIdentifier} identifier - The identifier of the frame element.
   * @return {string} The input name associated with the given identifier.
   * @since 4.2.7
   */
  private getInputNameByIdentifier(identifier: FrameElementIdentifier): string {
    switch (identifier) {
    case FrameElementIdentifier.CardNumber:
      return this.cardNumberInputName;
    case FrameElementIdentifier.ExpiryDate:
      return this.expiryDateInputName;
    case FrameElementIdentifier.Cvv:
      return this.cvvInputName;
    }
  }

  /**
   * Listens for the submit event and handles card tokenization and tokenization failure events.
   * Subscribes to the `cardTokenized` and `cardTokenizationFailed` observables and emits the respective events.
   * If the `submitEvent` observable is provided, it subscribes to it and calls the `submitCard` method on submission.
   *
   * @return {void}
   * @since 4.2.7
   */
  private listenForSubmitEvent(): void {
    this.cardTokenized.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (e: FrameCardTokenizedEvent): void => {
        this.ngZone.run((): void => {
          this.tokenized.emit(e);
        });
      },
      error: (err: unknown): void => this.logger.error('pipe cardTokenized with errors', { error: err })
    });

    this.cardTokenizationFailed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (e: FrameCardTokenizationFailedEvent): void => {
        this.ngZone.run((): void => {
          this.tokenizationFailed.emit(e);
        });
      },
      error: (err: unknown): void => this.logger.error('pipe cardTokenizedFailed with errors', { error: err })
    });

    if (this.submitEvent) {
      this.submitEvent.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (): void => {
          this.submitCard();
        },
        error: (err: unknown): void => this.logger.error('submitEvent with errors', { error: err })
      });
    }
  }

  /**
   * Submits the card information for tokenization.
   * If the Frames object is not found, emits a tokenization failure event.
   * If the form has already been submitted, enables the submit form in Frames.
   * Attempts to submit the card using Frames and handles any errors by emitting a tokenization failure event.
   *
   * @return {boolean} True if the form submission was initiated, false otherwise.
   * @since 4.2.7
   */
  private submitCard(): boolean {
    const Frames: any = (this.windowRef.nativeWindow as { [key: string]: any })['Frames'];
    if (!Frames) {
      this.tokenizationFailed.emit({
        errorCode: 'frames_not_found',
        message: null
      });
      return false;
    }
    if (this.formSubmitted) {
      Frames.enableSubmitForm();
    }

    Frames.submitCard().catch((err: any): void => {
      this.ngZone.run((): void => {
        this.tokenizationFailed.emit({
          message: err,
          errorCode: err
        });
      });
    });
    this.formSubmitted = true;
    return true;
  }

  /**
   * Returns the style configuration for Frames.
   *
   * @return {FramesStyle} The style configuration object.
   * @since 4.2.7
   */
  private getStyleConfig(): FramesStyle {
    return {
      base: {
        color: '#333',
        fontSize: '16px'
      },
      hover: {
        color: '#333'
      },
      focus: {
        color: '#495057'
      },
      valid: {
        color: '#333'
      },
      invalid: {
        color: 'rgb(219, 0, 2)',
      },
      placeholder: {
        base: {
          color: '#97a2c1',
          fontSize: '16px'
        }
      }
    };
  }

  /**
   * Modifies the Frames cardholder information.
   * If the cardholder is null, the method returns immediately.
   * If Frames is not initialized and the configuration is available, it sets the cardholder in the configuration.
   * If Frames is available, it sets the cardholder in Frames and updates the configuration.
   *
   * @param {FramesCardholder} cardholder - The cardholder information to be set.
   * @return {void}
   * @since 4.2.7
   */
  private modifyFramesCardholder(cardholder: FramesCardholder): void {
    if (cardholder == null) {
      return;
    }

    if (!this.framesInitialized && this.config) {
      this.config.cardholder = cardholder;
      return;
    }

    const Frames: any = (this.windowRef.nativeWindow as { [key: string]: any })['Frames'];
    if (!Frames) {
      return;
    }
    try {
      Frames.cardholder = cardholder;
      if (this.config) {
        this.config.cardholder = cardholder;
      }
    } catch (err: any) {
      this.logger.error('modifyFramesCardholder', err);
    }
  }
}
