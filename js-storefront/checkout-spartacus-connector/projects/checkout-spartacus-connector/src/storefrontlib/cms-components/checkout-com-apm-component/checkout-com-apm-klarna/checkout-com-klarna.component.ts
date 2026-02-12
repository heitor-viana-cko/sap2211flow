import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { KlarnaAddress, KlarnaAuthResponse, KlarnaInitParams, KlarnaLoadResponse } from '@checkout-core/model/Klarna';
import { PaymentType } from '@checkout-model/ApmData';
import { CheckoutComApmService } from '@checkout-services/apm/checkout-com-apm.service';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { Address, GlobalMessageType, WindowRef } from '@spartacus/core';
import { Translatable } from '@spartacus/core/src/i18n/translatable';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'lib-checkout-com-apm-klarna',
  templateUrl: './checkout-com-klarna.component.html',
  styleUrls: ['./checkout-com-klarna.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComKlarnaComponent extends CheckoutComBillingAddressFormComponent implements OnInit {
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> = new EventEmitter<{
    paymentDetails: ApmPaymentDetails,
    billingAddress: Address
  }>();
  @ViewChild('widget') widget: ElementRef;
  public loadingWidget$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public authorizing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public initializing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasFailed: boolean = false;
  public paymentContext: string = null;
  public instanceId: string = null;
  public emailAddress: string = '';
  public klarnaShippingAddressData: KlarnaAddress;
  public klarnaBillingAddressData: KlarnaAddress;
  private currentCountryCode: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private billingAddressHasBeenSet: boolean = false;

  /**
   * Constructor for the CheckoutComKlarnaComponent.
   * Initializes the services and dependencies required by the component.
   *
   * @param {CheckoutComApmService} checkoutComApmSrv - Service for handling APM (Alternative Payment Methods) related operations.
   * @param {CheckoutComPaymentService} checkoutComPaymentService - Service for handling payment operations.
   * @param {NgZone} ngZone - Angular service for executing code inside or outside of the Angular zone.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @since 5.2.0
   */
  constructor(
    private ngZone: NgZone,
    protected windowRef: WindowRef,
    protected checkoutComApmSrv: CheckoutComApmService,
    protected checkoutComPaymentService: CheckoutComPaymentService,
  ) {
    super();
  }

  /**
   * Angular lifecycle hook that is called after the component's view has been initialized.
   * Adds the Klarna script to the document.
   *
   * @return {void}
   * @since 4.2.7
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.hasFailed = false;
    this.addScript();
  }

  /**
   * Listens for changes in the address source.
   * Updates the `sameAsDeliveryAddress` flag and the current country code based on the billing address form.
   * Normalizes and sets the Klarna shipping and billing address data.
   *
   * @return {void}
   * @since 2211.32.1
   */
  listenForAddressSourceChange(): void {
    combineLatest([
      this.deliveryAddress$,
      this.billingAddress$
    ]).pipe(
      map(([deliveryAddress, billingAddress]: [Address, Address]): void => {
        this.klarnaShippingAddressData = this.normalizeKlarnaAddress(deliveryAddress);
        if (this.sameAsDeliveryAddress) {
          this.klarnaBillingAddressData = this.klarnaShippingAddressData;
        } else {
          this.klarnaBillingAddressData = this.normalizeKlarnaAddress(billingAddress);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Normalizes the address data to match the Klarna address format.
   *
   * @param {Address} address - The address data to be normalized.
   * @return {KlarnaAddress} The normalized address data.
   * @since 4.2.7
   */
  normalizeKlarnaAddress(address: Address): KlarnaAddress {
    return {
      given_name: address.firstName || '',
      family_name: address.lastName || '',
      email: this.emailAddress,
      street_address: address.line1 || '',
      postal_code: address.postalCode || '',
      city: address.town || '',
      phone: address.phone || '',
      country: address.country?.isocode || ''
    };
  }

  /**
   * Authorizes the payment by calling the Klarna authorize method.
   * Validates the billing address form and displays form errors if the form is invalid.
   * If the authorization is in progress, it returns without performing any action.
   * If the Klarna Payments object is not available, it logs an error message.
   * If the authorization is successful, it emits the payment details and billing address to the parent component.
   *
   * @return {void}
   * @since 4.2.7
   */
  public authorize(): void {
    if (this.authorizing$.getValue()) {
      return;
    }

    try {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const k: any = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      this.authorizing$.next(true);
      k.authorize({
        instance_id: this.instanceId
      },
      {
        billing_address: this.klarnaBillingAddressData,
        shipping_address: this.klarnaShippingAddressData
      },
      (response: KlarnaAuthResponse): void => {
        this.authorizing$.next(false);
        if (response?.approved === true && response?.authorization_token) {
          this.setPaymentDetails.next({
            paymentDetails: {
              type: PaymentType.Klarna,
              authorizationToken: response.authorization_token,
              paymentContextId: this.paymentContext,
            } as ApmPaymentDetails,
            billingAddress: this.klarnaBillingAddressData as Address
          });
        }
      });
    } catch (e) {
      this.showErrorMessage({ key: 'paymentForm.klarna.klarnaIsNotSet' }, 'CheckoutComKlarnaComponent::authorize::KlarnaIsNotSet', e);
    }
  }

  showErrorMessage(translation: Translatable, loggerMessage: string, error: unknown): void {
    this.loadingWidget$.next(false);
    this.authorizing$.next(false);
    this.initializing$.next(false);
    this.logger.error(loggerMessage, error);
    this.globalMessageService.add(translation, GlobalMessageType.MSG_TYPE_ERROR);
    this.hasFailed = true;
  }

  /**
   * Adds the Klarna script to the document.
   * If the Klarna script is not already present, it creates a script element and appends it to the document body.
   * Defines a callback function to be executed when the Klarna script is loaded.
   * If the Klarna script is already present, it directly calls the `klarnaIsReady` method.
   *
   * @private
   * @return {void}
   * @since 4.2.7
   */
  private addScript(): void {
    if (
      this.windowRef &&
      !(this.windowRef?.nativeWindow as { [key: string]: any })['Klarna'] as any &&
      !(this.windowRef?.nativeWindow as { [key: string]: any })['klarnaAsyncCallback'] as any
    ) {
      Object.defineProperty(this.windowRef.nativeWindow, 'klarnaAsyncCallback', {
        value: (): void => {
          this.ngZone.run((): void => {
            this.klarnaIsReady();
          });
        },
      });
      const script: HTMLScriptElement = this.windowRef.document.createElement('script');
      script.setAttribute('src', 'https://x.klarnacdn.net/kp/lib/v1/api.js');
      script.setAttribute('async', 'true');
      this.windowRef.document.body.appendChild(script);
    } else {
      this.ngZone.run((): void => {
        this.klarnaIsReady();
      });
    }
  }

  /**
   * Listens for changes in the current country code.
   * Updates the Klarna initialization parameters when the country code changes.
   * Handles errors by logging them and displaying a global error message.
   *
   * @private
   * @return {void}
   * @since 4.2.7
   */
  private listenForCountryCode(): void {
    this.currentCountryCode.pipe(
      filter((country: string): boolean => !!country && this.billingAddressHasBeenSet),
      distinctUntilChanged(),
      switchMap((): Observable<KlarnaInitParams | HttpErrorResponse> => this.checkoutComApmSrv.getKlarnaInitParams()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (params: KlarnaInitParams | HttpErrorResponse): void => {
        if (params instanceof HttpErrorResponse) {
          this.showErrorMessage({ key: 'paymentForm.klarna.initializationFailed' }, 'CheckoutComKlarnaComponent::listenForCountryCode', params.error);
        }

        if (typeof params === 'object') {
          this.initKlarna(params as KlarnaInitParams);
        }
      },
      error: (error: unknown): void => {
        this.showErrorMessage({ key: 'paymentForm.klarna.initializationFailed' }, 'CheckoutComKlarnaComponent::listenForCountryCode', error);
      },
    });
  }

  /**
   * Initializes the Klarna payment process when the Klarna script is ready.
   * Sets the `initializing$` observable to true and retrieves the delivery address state.
   * Updates the payment address and Klarna address data.
   * Listens for changes in the country code, country selection, and address source.
   * Displays an error message if the country is not set in the address.
   *
   * @private
   * @return {void}
   * @since 4.2.7
   */
  private klarnaIsReady(): void {
    this.initializing$.next(true);
    this.billingAddressFormService.billingAddress$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (address: Address): void => {
        if (address?.country?.isocode) {
          this.klarnaBillingAddressData = this.normalizeKlarnaAddress(address);
          this.emailAddress = address?.email;
          this.billingAddressHasBeenSet = true;
          this.currentCountryCode.next(address.country.isocode);
          this.listenForCountryCode();
          this.listenForAddressSourceChange();
        } else {
          this.showErrorMessage({ key: 'paymentForm.klarna.countryIsRequired' }, 'CheckoutComKlarnaComponent::klarnaIsReady', 'Country is required');
        }
        this.initializing$.next(false);
      },
      error: (error: unknown): void => {
        this.showErrorMessage({ key: 'paymentForm.klarna.countryIsRequired' }, 'CheckoutComKlarnaComponent::klarnaIsReady', error);
      },
    });
  }

  /**
   * Initializes the Klarna payment process with the provided parameters.
   * Sets the payment context and instance ID, and initializes the Klarna Payments object.
   * Loads the Klarna widget if the initialization is successful.
   * Logs an error message if the Klarna Payments object is not available or if an exception occurs.
   *
   * @private
   * @param {KlarnaInitParams} params - The initialization parameters for Klarna.
   * @return {void}
   * @since 4.2.7
   */
  private initKlarna(params: KlarnaInitParams): void {
    try {
      const klarna: any = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      this.paymentContext = params.paymentContext;
      this.instanceId = params.instanceId;

      klarna.init({
        client_token: params.clientToken,
      });
      this.loadWidget();
    } catch (e) {
      this.showErrorMessage({ key: 'paymentForm.klarna.klarnaIsNotSet' }, 'CheckoutComKlarnaComponent::initKlarna', e);
    }
  }

  /**
   * Loads the Klarna widget into the specified container.
   * Sets the `loadingWidget$` observable to true while the widget is being loaded.
   * If the Klarna Payments object is not available, logs an error message and returns.
   * If the widget loading is successful, updates the `loadingWidget$` observable to false.
   * Logs an error message if the widget loading response contains an error or if an exception occurs.
   *
   * @private
   * @return {void}
   * @since 4.2.7
   */
  private loadWidget(): void {
    try {
      const k: any = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      this.loadingWidget$.next(true);
      k.load(
        {
          container: '#klarnaContainer',
          instance_id: this.instanceId
        },
        {},
        (response: KlarnaLoadResponse): void => {
          if (response != null && typeof response === 'object') {
            if (response.error) {
              this.showErrorMessage(
                {
                  key: 'paymentForm.klarna.loadWidgetError',
                  params: { error: response.error }
                },
                'CheckoutComKlarnaComponent::loadWidget::response',
                response.error as string
              );
            }
          }
          this.loadingWidget$.next(false);
        });
    } catch (e) {
      this.showErrorMessage({ key: 'paymentForm.klarna.isNotSet' }, 'CheckoutComKlarnaComponent::loadWidget', e);
    }
  }
}
