import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GooglePayMerchantConfiguration, IntermediatePaymentData } from '@checkout-model/GooglePay';
import { loadScript } from '@checkout-shared/loadScript';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import { CheckoutComApmGooglepayComponent } from '../../checkout-com-apm-component/checkout-com-apm-googlepay/checkout-com-apm-googlepay.component';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'lib-checkout-com-express-googlepay',
  templateUrl: './checkout-com-express-googlepay.component.html',
})
export class CheckoutComExpressGooglepayComponent extends CheckoutComApmGooglepayComponent implements OnInit, AfterViewInit, OnChanges {
  @Output() buttonGooglePayClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() expressCheckout?: boolean;
  @Input() newCart?: Observable<boolean>;

  /**
   * Overrides the `ngAfterViewInit` lifecycle hook to initialize the Google Pay button.
   * Sets the `shippingAddressRequired` flag to true and checks if the Google Pay button element is available.
   * If the button is not already created, it loads the Google Pay script and creates the button.
   * If the button is already created, it calls the `createdButton` method.
   *
   * @override
   * @return {void}
   * @since 2211.31.1
   */
  override ngAfterViewInit(): void {
    this.shippingAddressRequired = true;
    if (this.windowRef.isBrowser() && this.gpayBtn?.nativeElement) {
      this.checkoutComGooglePayFacade.requestMerchantConfiguration();
      const idButton: HTMLElement = this.windowRef.document.getElementById('google-id-button');
      if (!idButton) {
        if (this.isGooglePayLoaded()) {
          this.createdButton();
        } else {
          loadScript(this.windowRef, 'https://pay.google.com/gp/p/js/pay.js', (): void => {
            this.ngZone.run((): void => {
              this.createdButton();
            });
          }, 'google-id-button');
        }
      } else {
        this.createdButton(idButton);
      }
    }
  }

  /**
   * Checks if the Google Pay API is fully loaded and available.
   *
   * This method verifies the presence of the `google` object and its nested properties
   * to determine if the Google Pay API is loaded and the `PaymentsClient` constructor is available.
   *
   * @returns {boolean} - Returns `true` if the Google Pay API is fully loaded and the `PaymentsClient` constructor is available, otherwise returns `false`.
   */
  isGooglePayLoaded(): boolean {
    // @ts-expect-error - google pay module is not defined
    return typeof google !== 'undefined' &&
           // @ts-expect-error - google pay module is not defined
           typeof google.payments !== 'undefined' &&
           // @ts-expect-error - google pay module is not defined
           typeof google.payments.api !== 'undefined' &&
           // @ts-expect-error - google pay module is not defined
           typeof google.payments.api.PaymentsClient === 'function';
  }

  /**
   * Handles changes to the component's input properties.
   * If the `newCart` input property changes and is defined, subscribes to the observable
   * to start the Google Pay payment process when the value is true.
   *
   * @param {Object} changes - An object containing the changes to the input properties.
   * @param {Observable<boolean>} changes.newCart - Observable indicating if a new cart is created.
   * @return {void}
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ngOnChanges(changes: { [x: string]: any; }): void {
    if (changes['newCart'] && this.newCart) {
      this.newCart.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (value: any): void => {
          if (value) {
            this.initBtn();
          }
        },
        error: (error: unknown): void => {
          this.logger.error(error);
        }
      });
    }
  }

  /**
   * Handles the Google Pay button click event.
   * If `expressCheckout` is enabled, emits the `buttonGooglePayClicked` event with a value of true.
   * Otherwise, starts the Google Pay payment process.
   *
   * @return {void}
   * @since 2211.31.1
   */
  googlePayButtonClicked(): void {
    if (this.expressCheckout) {
      this.buttonGooglePayClicked.emit(true);
    } else {
      this.initBtn();
    }
  }

  /**
   * Creates and initializes the Google Pay button.
   * Removes the existing button element if it exists, creates a new Google Pay PaymentsClient,
   * and sets up the button with an onClick handler to trigger the Google Pay payment process.
   *
   * @param {any} idButton - The existing button element to be removed.
   * @protected
   * @return {void}
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected createdButton(idButton?: any): void {
    if (idButton) {
      idButton.remove();
    }
    // @ts-expect-error - google pay module is not defined
    this.paymentsClient = new google.payments.api.PaymentsClient({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const button: any = this.paymentsClient?.createButton({
      onClick: (): void => {
        this.ngZone.run((): void => {
          this.googlePayButtonClicked();
        });
      }
    });
    if (this.gpayBtn?.nativeElement.children.length === 0) {
      this.renderer.setAttribute(this.gpayBtn?.nativeElement, 'id', 'google-pay-button');
      this.renderer.appendChild(this.gpayBtn?.nativeElement, button);
    }
  }

  /**
   * Initializes the Google Pay button with the provided user and cart IDs.
   * Retrieves the merchant configuration from the state, clones the configuration object,
   * sets up the payment data callbacks, and initializes the express payments' client.
   *
   * @protected
   * @override
   * @return {void}
   * @since 2211.31.1
   */
  protected override initBtn(): void {
    this.checkoutComGooglePayFacade.getMerchantConfigurationFromState()
      .pipe(
        filter((merchantConfiguration: GooglePayMerchantConfiguration): boolean => Boolean(merchantConfiguration) && Object.keys(merchantConfiguration).length > 0),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (merchantConfiguration: GooglePayMerchantConfiguration): void => {
        // clone the object, Rx objects are immutable deep
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          const paymentClientData: any = JSON.parse(JSON.stringify(merchantConfiguration));
          const onPaymentDataChanged: (paymentData: IntermediatePaymentData) => Promise<any> =
          (paymentData: IntermediatePaymentData): Promise<any> => this.checkoutComGooglePayFacade.onPaymentDataChanged(paymentData);

          paymentClientData.clientSettings.paymentDataCallbacks = {
            onPaymentDataChanged,
          };
          this.initExpressPaymentsClient(paymentClientData);
        },
        error: (err: unknown): void => this.logger.error('initBtn with errors', { err })
      });
  }

  /**
   * Initializes the express payments client with the provided merchant configuration, user ID, and cart ID.
   * Creates a new Google Pay PaymentsClient with the provided client settings, checks if the user is ready to pay,
   * and if so, authorizes the payment.
   *
   * @param {any} merchantConfiguration - The configuration object for the merchant.
   * @protected
   * @return {void}
   * @since 2211.31.1
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected initExpressPaymentsClient(merchantConfiguration: any): void {
    // @ts-expect-error - google pay module is not defined
    this.paymentsClient = new google.payments.api.PaymentsClient(merchantConfiguration.clientSettings);
    const isReadyToPayRequest: object = this.checkoutComGooglePayFacade.createInitialPaymentRequest(merchantConfiguration, this.shippingAddressRequired);
    this.paymentsClient.isReadyToPay(isReadyToPayRequest)
      .then(({ result }: any): void => {
        if (result) {
          this.authorisePayment();
        }
      })
      .catch((err: any): void => {
        this.logger.error('failed to initialize googlepay', err);
      });
  }

  /**
   * Authorizes the Google Pay payment with the provided user and cart IDs.
   * Retrieves the merchant configuration from the state, creates a full payment request,
   * and loads the payment data. If the payment is authorized, it calls the `onPaymentAuthorized` method.
   *
   * @protected
   * @override
   * @return {void}
   * @since 2211.31.1
   */
  protected override authorisePayment(): void {
    this.checkoutComGooglePayFacade.getMerchantConfigurationFromState()
      .pipe(
        first((merchantConfiguration: GooglePayMerchantConfiguration): boolean => Boolean(merchantConfiguration) && Object.keys(merchantConfiguration).length > 0),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (merchantConfiguration: GooglePayMerchantConfiguration): void => {
          const paymentDataRequest: any = this.checkoutComGooglePayFacade.addPaymentExpressIntents(
            this.checkoutComGooglePayFacade.createFullPaymentRequest(merchantConfiguration)
          );

          this.paymentsClient.loadPaymentData(paymentDataRequest)
            .then((paymentRequest: any): void => {
              this.checkoutComGooglePayFacade.onPaymentAuthorized(paymentRequest).then();
            })
            .catch((err: unknown): void => {
              this.logger.error('Error loading payment data:', err);
            });
        },
        error: (err: unknown): void => this.logger.error('authorisePayment with errors', { err })
      });
  }
}
