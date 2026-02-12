import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CheckoutComReloadGooglePaymentEvent } from '@checkout-core/events/google-pay.events';
import { CheckoutComGooglepayFacade } from '@checkout-facades/checkout-com-googlepay.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { GooglePayMerchantConfiguration, GooglePayPaymentRequest } from '@checkout-model/GooglePay';
import { loadScript } from '@checkout-shared/loadScript';
import { RoutingService, WindowRef } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'lib-checkout-com-apm-googlepay',
  templateUrl: './checkout-com-apm-googlepay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmGooglepayComponent extends CheckoutComBillingAddressFormComponent implements OnInit, AfterViewInit {
  @ViewChild('gpayBtn') gpayBtn: ElementRef = null;
  protected paymentsClient: any;
  protected shippingAddressRequired: boolean = false;

  /**
   * Constructor for the CheckoutComApmGooglepayComponent.
   *
   * @param {RoutingService} routingService - Service to manage routing.
   * @param {NgZone} ngZone - Service to manage Angular zones.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @param {Renderer2} renderer - Renderer to manipulate DOM elements.
   * @param {CheckoutComOrderFacade} checkoutComOrderFacade - Facade to manage orders.
   * @param {CheckoutComGooglepayFacade} checkoutComGooglePayFacade - Service to manage Google Pay operations.
   *
   * @since 2211.32.1
   */
  constructor(
    protected routingService: RoutingService,
    protected ngZone: NgZone,
    protected windowRef: WindowRef,
    protected renderer: Renderer2,
    protected checkoutComOrderFacade: CheckoutComOrderFacade,
    protected checkoutComGooglePayFacade: CheckoutComGooglepayFacade,
  ) {
    super();
  }

  /**
   * Initializes the component and navigates to the order details page if an order was created.
   * Subscribes to the observable returned by `getOrderDetails` and calls `routingService.go` to navigate to the order confirmation page.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   * @since 4.2.7
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.checkoutComOrderFacade.getOrderDetails().pipe(
      filter((order: Order): boolean => Boolean(order) && Object.keys(order)?.length !== 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.routingService.go({ cxRoute: 'orderConfirmation' });
      },
      error: (err: unknown): void => this.logger.error('return to order confirmation with errors', { err })
    });
  }

  /**
   * After the view initializes, this method checks if the Google Pay button element is present.
   * If the button element is found, it retrieves the user ID and cart ID, then initializes the Google Pay button.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   * @since 4.2.7
   */
  ngAfterViewInit(): void {
    if (this.gpayBtn?.nativeElement) {
      this.checkoutComGooglePayFacade.requestMerchantConfiguration();
      this.initBtn();
    }
  }

  /**
   * Initializes the Google Pay button with the provided user ID and cart ID.
   * If the express option is enabled, it clones the merchant configuration and sets up payment data callbacks.
   * Loads the Google Pay script if not already loaded and initializes the PaymentsClient.
   *
   * @return {void}
   * @since 4.2.7
   */
  protected initBtn(): void {
    this.eventService.dispatch({}, CheckoutComReloadGooglePaymentEvent);
    this.checkoutComGooglePayFacade.getMerchantConfigurationFromState()
      .pipe(
        filter((merchantConfiguration: GooglePayMerchantConfiguration): boolean => Boolean(merchantConfiguration) && Object.keys(merchantConfiguration).length > 0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (merchantConfiguration: GooglePayMerchantConfiguration): void => {
          if (this.paymentsClient) {
            return;
          }

          // @ts-expect-error - google is not defined
          if (this.windowRef.nativeWindow.google?.payments?.api?.PaymentsClient) {
            this.initPaymentsClient(merchantConfiguration);
          } else {
            loadScript(this.windowRef, 'https://pay.google.com/gp/p/js/pay.js', (): void => {
              this.ngZone.run((): void => {
                this.initPaymentsClient(merchantConfiguration);
              });
            });
          }
        },
        error: (err: unknown): void => this.logger.error('initBtn with errors', { err })
      });
  }

  /**
   * Initializes the PaymentsClient with the provided merchant configuration, user ID, and cart ID.
   * Creates an initial payment request and checks if Google Pay is ready to pay.
   * If ready, creates and appends the Google Pay button to the DOM.
   * Logs an error message if the initialization fails.
   *
   * @param {GooglePayMerchantConfiguration} merchantConfiguration - The merchant configuration for Google Pay.
   * @return {void}
   * @since 4.2.7
   */
  protected initPaymentsClient(merchantConfiguration: GooglePayMerchantConfiguration): void {
    if (this.windowRef?.nativeWindow) {
      // @ts-expect-error - google is not defined
      const googleAPi: any = this.windowRef.nativeWindow?.google.payments.api;
      if (googleAPi) {
        this.paymentsClient = new googleAPi.PaymentsClient(merchantConfiguration.clientSettings);
        const isReadyToPayRequest: object = this.checkoutComGooglePayFacade.createInitialPaymentRequest(merchantConfiguration, this.shippingAddressRequired);

        if (this.paymentsClient.isReadyToPay) {
          this.paymentsClient.isReadyToPay(isReadyToPayRequest)
            .then(({ result }: any): void => {
              if (result) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const button: any = this.paymentsClient.createButton({
                  onClick: (): void => {
                    this.ngZone.run((): void => {
                      this.authorisePayment();
                    });
                  }
                });
                if (this.gpayBtn?.nativeElement.children.length === 0) {
                  this.renderer.setAttribute(this.gpayBtn?.nativeElement, 'id', 'google-pay-button');
                  this.renderer.appendChild(this.gpayBtn?.nativeElement, button);
                }
              }
            })
            .catch((err: any): void => {
              this.logger.error('failed to initialize googlepay', err);
            });
        }
      }
    }
  }

  /**
   * Authorizes the payment using Google Pay.
   * Retrieves the merchant configuration and creates a full payment request.
   * If the billing address form is not valid, it makes form errors visible and returns.
   * Loads the payment data and authorizes the order.
   * Logs an error message if the authorization fails.
   *
   * @return {void}
   * @since 4.2.7
   */
  protected authorisePayment(): void {
    const configReq: Observable<GooglePayMerchantConfiguration> =
      this.checkoutComGooglePayFacade.getMerchantConfigurationFromState().pipe(
        first((c: GooglePayMerchantConfiguration): boolean => !!c),
      );

    configReq.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (merchantConfiguration: GooglePayMerchantConfiguration): void => {
        const paymentDataRequest: any = this.checkoutComGooglePayFacade.createFullPaymentRequest(merchantConfiguration);
        this.paymentsClient.loadPaymentData(paymentDataRequest)
          .then((paymentRequest: GooglePayPaymentRequest): void => {
            this.checkoutComGooglePayFacade.authoriseOrder(paymentRequest, false);
          })
          .catch((err: any): void => {
            this.logger.log('Error google pay payment...');
            this.logger.error(err);
          });
      },
      error: (err: unknown): void => this.logger.error('authorisePayment with errors', { err })
    });
  }
}
