import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl } from '@angular/forms';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CHECKOUT_COM_LAUNCH_CALLER } from '@checkout-core/interfaces';
import { CheckoutComAchFacade } from '@checkout-facades/checkout-com-ach.facade';
import { AchSuccessMetadata, AchSuccessPopup } from '@checkout-model/Ach';
import { Address, AddressValidation, GlobalMessageType, QueryState, RoutingService, Translatable } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { NgxPlaidLinkService, PlaidLinkHandler } from 'ngx-plaid-link';
import { LegacyPlaidConfig } from 'ngx-plaid-link/lib/interfaces';
import { BehaviorSubject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-apm-ach',
  templateUrl: './checkout-com-apm-ach.component.html',
  styleUrls: ['./checkout-com-apm-ach.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmAchComponent extends CheckoutComBillingAddressFormComponent implements OnInit {
  @ViewChild('element') element: ElementRef;
  achEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  linkToken: BehaviorSubject<string> = new BehaviorSubject<string>('');
  plaidSuccessPopup$: BehaviorSubject<AchSuccessPopup> = new BehaviorSubject<AchSuccessPopup>({});
  paymentAddress: Address;
  disabled: boolean = true;
  showLoadingIcon$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  customerConsents: UntypedFormControl = new UntypedFormControl();
  achMetadata: AchSuccessMetadata;
  private plaidLinkHandler: PlaidLinkHandler;
  private config: LegacyPlaidConfig = {
    apiVersion: 'v2',
    env: 'sandbox',
    selectAccount: false,
    token: null,
    webhook: '',
    product: ['auth'],
    countryCodes: ['US'],
    key: '',
    onSuccess: this.onSuccess,
    onExit: (): string => '',
  };

  /**
   * Constructor for the CheckoutComApmAchComponent.
   *
   * @param routingService The service used to manage routing operations.
   * @param cd The change detector reference, used to trigger change detection.
   * @param plaidLinkService The service used to manage Plaid Link operations.
   * @param checkoutComAchFacade The service used to manage ACH operations.
   * @since 2211.31.1
   */
  constructor(
    protected routingService: RoutingService,
    protected cd: ChangeDetectorRef,
    protected plaidLinkService: NgxPlaidLinkService,
    protected checkoutComAchFacade: CheckoutComAchFacade,
  ) {
    super();
  }

  /**
   * Initializes the component by calling the necessary methods to set up Plaid Link token,
   * Plaid Link metadata, and the delivery address.
   *
   * @override
   * @returns {void}
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.getPlaidLinkToken();
    this.getPlaidLinkMetadata();
    this.sameDeliveryAddress();
  }

  /**
   * Requests a Plaid Link token from the CheckoutComAchFacade.
   *
   * @return {void}
   * @since 2211.31.1
   */
  getPlaidLinkToken(): void {
    this.checkoutComAchFacade.getPlaidLinkToken().pipe(
      filter((response: string): boolean => !!response && Object.keys(response).length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (linkToken: string): void => {
        this.linkToken.next(linkToken || '');
        this.config.token = this.linkToken.getValue();
      },
      error: (err: unknown): void => this.showErrors(
        'plaidLinkTokenApi',
        'Failed to retrieve Plaid Link token',
        err
      )
    });
  }

  getPlaidLinkMetadata(): void {
    this.checkoutComAchFacade.getPlaidLinkMetadata().pipe(
      filter((response: AchSuccessMetadata): boolean => !!response),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (metaData: AchSuccessMetadata): void => {
        this.achMetadata = metaData;
      },
      error: (error: unknown): void => this.logger.error(error)
    });
  }

  /**
   * Subscribes to the sameAsDeliveryAddress$ observable to determine if the billing address
   * is the same as the delivery address. If they are the same, it retrieves the delivery address.
   *
   * @return {void}
   * @since 5.2.0
   */
  sameDeliveryAddress(): void {
    this.billingAddressFormService.getSameAsDeliveryAddress().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: boolean): void => {
        this.sameAsDeliveryAddress = res;
        if (res) {
          this.getDeliveryAddress();
        }
      },
      error: (error: unknown): void => this.logger.error(error)
    });
  }

  /**
   * Retrieves the delivery address from the CheckoutDeliveryAddressFacade.
   *
   * @return {void}
   * @since 5.2.0
   */
  getDeliveryAddress(): void {
    this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      tap((address: QueryState<Address>): void => {
        this.paymentAddress = address.data;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error: unknown): void => this.logger.error(error)
    });
  }

  override handleAddressVerificationResults(results: AddressValidation): void {
    if (results.decision === 'ACCEPT') {
      this.paymentAddress = this.billingAddressForm.value;
      this.open();
    } else if (results.decision === 'REJECT') {
      this.showErrors({ key: 'addressForm.invalidAddress' }, 'Address verification failed', results.decision);
    }
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
  override showErrors(text: string | Translatable, logMessage: string, errorMessage: unknown): void {
    this.achEnabled$.next(false);
    this.globalMessageService.add(
      text,
      GlobalMessageType.MSG_TYPE_ERROR
    );
    this.logger.error(logMessage, { error: errorMessage });
  }

  /**
   * Initiates the ACH payment process and handles address verification or payment address update.
   *
   * @returns {void} This method does not return a value. It performs an asynchronous operation to show the ACH payment pop-up and update the payment address if necessary.
   *
   * @since 2211.32.1
   */
  showACHPopUpPayment(): void {
    this.plaidLinkService.createPlaid(Object.assign({}, this.config, {
      onSuccess: (token: string, metadata: AchSuccessMetadata): void => {
        this.cd.detectChanges();
        this.onSuccess(token, metadata);
      },
      onExit: (): void => this.exit(),
      onEvent: (): string => ''
    }))
      .then((handler: PlaidLinkHandler): void => {
        this.plaidLinkHandler = handler;
        this.open();
      });
  }

  /**
   * Opens a dialog for ACH consents using the LaunchDialogService.
   *
   * @return {void}
   * @since 5.2.0
   */
  showPopUpConsents(): void {
    this.launchDialogService.openDialogAndSubscribe(
      CHECKOUT_COM_LAUNCH_CALLER.APM_ACH_CONSENTS,
      this.element,
      {
        achMetadata: this.achMetadata
      }
    );
  }

  /**
   * Opens a dialog to display ACH Plaid Link accounts using the LaunchDialogService.
   * Subscribes to the dialogClose observable to handle the dialog close event.
   *
   * @return {void}
   * @since 5.2.0
   */
  showAchPlaidLinkAccounts(): void {
    this.launchDialogService.openDialogAndSubscribe(
      CHECKOUT_COM_LAUNCH_CALLER.ACH_ACCOUNTS_LIST,
      this.element,
      {
        achMetadata: this.achMetadata
      }
    );

    this.launchDialogService.dialogClose
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any): boolean => Boolean(response)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (reason: any): void => {
          if (reason.type === 'submit' && reason.parameters) {
            this.placeOrder(reason.parameters);
          }
        },
        error: (error: unknown): void => {
          const httpError: HttpErrorResponse = error as HttpErrorResponse;
          this.showErrors(
            httpError?.error?.errors?.[0].message,
            'Failed to place order using ACH Plaid Link metadata',
            error
          );
        }
      });
  }

  /**
   * Disables the continue button based on the checked state of the target element.
   *
   * @param {any} target - The target element whose checked state is used to enable or disable the continue button.
   * @return {void}
   * @since 5.2.0
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  continueButtonDisabled(target: any): void {
    this.disabled = !(target as HTMLInputElement).checked;
  }

  /**
   * Opens the Plaid Link handler to initiate the Plaid Link flow.
   *
   * @return {void}
   * @since 5.2.0
   */
  open(): void {
    this.plaidLinkHandler.open();
  }

  /**
   * Exits the Plaid Link flow.
   *
   * @return {void}
   * @since 5.2.0
   */
  exit(): void {
    this.plaidLinkHandler.exit();
  }

  /**
   * Handles the Plaid Link success event.
   *
   * @param {string} public_token - The public token returned by Plaid Link.
   * @param {AchSuccessMetadata} metadata - The metadata returned by Plaid Link.
   * @return {void}
   * @since 5.2.0
   */
  onSuccess(public_token: string, metadata: AchSuccessMetadata): void {
    this.plaidSuccessPopup$.next({
      public_token,
      metadata
    } as AchSuccessPopup);
    this.checkoutComAchFacade.setPlaidLinkMetadata(metadata);
    this.showAchPlaidLinkAccounts();
  }

  /**
   * Places an order using the AchSuccessMetadata.
   *
   * @param {AchSuccessMetadata} metadata - The metadata used to place the order.
   * @return {void}
   * @since 5.2.0
   */
  placeOrder(metadata: AchSuccessMetadata): void {
    this.showLoadingIcon$.next(true);
    this.cd.detectChanges();
    this.checkoutComAchFacade.requestPlaidSuccessOrder(metadata.public_token, metadata, !this.disabled)
      .pipe(
        filter((AchOrderId: Order): boolean => AchOrderId && Object.keys(AchOrderId).length !== 0),
        takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (): void => {
          // eslint-disable rxjs/no-implicit-any-catch
          this.routingService.go({ cxRoute: 'orderConfirmation' });
        },
        error: (error: unknown): void => {
          const httpError: HttpErrorResponse = error as HttpErrorResponse;
          this.showErrors(
            httpError?.error?.errors?.[0]?.message,
            'Failed to place order',
            error
          );
          this.showLoadingIcon$.next(false);
        }
      });
  }
}
