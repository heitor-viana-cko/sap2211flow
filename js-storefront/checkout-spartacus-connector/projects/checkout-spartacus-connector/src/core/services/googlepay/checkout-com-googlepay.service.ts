import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComGooglepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-googlepay.connector';
import { CheckoutComReloadGooglePaymentEvent, CheckoutComResetGooglePaymentEvent } from '@checkout-core/events/google-pay.events';
import { CheckoutComGooglepayFacade } from '@checkout-facades/checkout-com-googlepay.facade';
import {
  GooglePayAutoriseOrderParams,
  GooglePayMerchantConfiguration,
  GooglePayPaymentExpressIntents,
  GooglePayPaymentRequest,
  GooglePaySession,
  IntermediatePaymentData,
  PaymentAuthorizationResult,
  PaymentDataRequestUpdate,
  PlaceOrderResponse
} from '@checkout-model/GooglePay';
import { getUserIdCartId } from '@checkout-shared/get-user-cart-id';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressSetEvent } from '@spartacus/checkout/base/root';
import {
  Address,
  Command,
  CommandService,
  CommandStrategy,
  CurrencySetEvent,
  EventService,
  GlobalMessageService,
  GlobalMessageType,
  LoggerService,
  Query,
  QueryService,
  UserIdService,
  WindowRef
} from '@spartacus/core';
import { OrderService } from '@spartacus/order/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable({
  providedIn: 'root'
})
export class CheckoutComGooglepayService extends OrderService implements CheckoutComGooglepayFacade {
  protected logger: LoggerService = inject(LoggerService);
  protected googlePaySession$: BehaviorSubject<GooglePaySession> = new BehaviorSubject<GooglePaySession>({
    googlePayAuth: null,
    googlePayMerchantConfiguration: null,
    googlePayPaymentDataUpdate: null,
    googlePayPaymentAuthorizationResult: null
  });
  protected requestMerchantConfigurationQuery$: Query<GooglePayMerchantConfiguration, []> = this.queryService.create<GooglePayMerchantConfiguration>(
    (): Observable<GooglePayMerchantConfiguration> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<GooglePayMerchantConfiguration> =>
        this.orderConnector.getGooglePayMerchantConfiguration(userId, cartId).pipe(
          tap((merchantConfiguration: GooglePayMerchantConfiguration): void => {
            this.setGooglePayMerchantConfiguration(merchantConfiguration);
          }),
        )
      ),
    ),
    {
      reloadOn: [CheckoutComReloadGooglePaymentEvent],
      resetOn: [OrderPlacedEvent, CurrencySetEvent, CheckoutDeliveryAddressSetEvent, CheckoutComResetGooglePaymentEvent],
    }
  );
  protected autoriseOrderCommand$: Command<GooglePayAutoriseOrderParams, PlaceOrderResponse> = this.commandService.create(
    ({
      token,
      billingAddress,
      savePaymentMethod,
      shippingAddress,
      email,
    }: GooglePayAutoriseOrderParams): Observable<PlaceOrderResponse> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<PlaceOrderResponse> =>
        this.orderConnector.authoriseGooglePayPayment(userId, cartId, token, billingAddress, savePaymentMethod, shippingAddress, email).pipe(
          tap((placeOrderResponse: PlaceOrderResponse): void => {
            if (placeOrderResponse.redirectUrl) {
              this.windowRef.location.href = placeOrderResponse.redirectUrl;
            } else {
              this.setGooglePayPaymentAuthorizationResult({ transactionState: 'SUCCESS' });
              this.setPlacedOrder(placeOrderResponse.orderData);
              this.eventService.dispatch(
                {
                  userId,
                  cartId,
                  cartCode: cartId,
                  order: placeOrderResponse.orderData,
                },
                OrderPlacedEvent
              );
            }
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  protected updatePaymentDataCommand$: Command<IntermediatePaymentData, PaymentDataRequestUpdate> = this.commandService.create(
    (paymentData: IntermediatePaymentData): Observable<PaymentDataRequestUpdate> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<PaymentDataRequestUpdate> =>
        this.orderConnector.setGooglePayDeliveryInfo(userId, cartId, paymentData).pipe(
          tap((response: PaymentDataRequestUpdate): void => {
            this.setGooglePayPaymentDataUpdate(response);
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Constructor for the CheckoutComGooglepayService.
   *
   * @since 2211.31.1
   * @param {ActiveCartFacade} activeCartFacade - The active cart facade service.
   * @param {UserIdService} userIdService - The user ID service.
   * @param {CommandService} commandService - The command service.
   * @param {CheckoutComGooglepayConnector} orderConnector - The Google Pay order connector.
   * @param {EventService} eventService - The event service.
   * @param {GlobalMessageService} globalMessageService - The global message service.
   * @param {QueryService} queryService - The query service.
   * @param {WindowRef} windowRef - The window reference service.
   */
  constructor(
    protected override activeCartFacade: ActiveCartFacade,
    protected override userIdService: UserIdService,
    protected override commandService: CommandService,
    protected override orderConnector: CheckoutComGooglepayConnector,
    protected override eventService: EventService,
    protected globalMessageService: GlobalMessageService,
    protected queryService: QueryService,
    protected windowRef: WindowRef,
  ) {
    super(
      activeCartFacade,
      userIdService,
      commandService,
      orderConnector,
      eventService,
    );
    this.resetGooglePaySessionEvent();
  }

  resetGooglePaySessionEvent(): void {
    this.eventService.get(OrderPlacedEvent).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.googlePaySession$.next({
          googlePayAuth: null,
          googlePayMerchantConfiguration: null,
          googlePayPaymentDataUpdate: null,
          googlePayPaymentAuthorizationResult: null
        });
      }
    });
  }

  /**
   * Sets the Google Pay merchant configuration in the session.
   *
   * @param {GooglePayMerchantConfiguration} value - The Google Pay merchant configuration to be set.
   * @since 2211.31.1
   */
  setGooglePayMerchantConfiguration(value: GooglePayMerchantConfiguration): void {
    this.googlePaySession$.next({
      ...this.googlePaySession$.getValue(),
      googlePayMerchantConfiguration: value
    });
  }

  /**
   * Sets the Google Pay authorization data in the session.
   *
   * @param {GooglePayPaymentRequest} value - The Google Pay payment request containing authorization data.
   * @since 2211.31.1
   */
  setGooglePayAuth(value: GooglePayPaymentRequest): void {
    this.googlePaySession$.next({
      ...this.googlePaySession$.getValue(),
      googlePayAuth: value
    });
  }

  /**
   * Sets the Google Pay payment data update in the session.
   *
   * @param {PaymentDataRequestUpdate} value - The payment data update to be set.
   * @since 2211.31.1
   */
  setGooglePayPaymentDataUpdate(value: PaymentDataRequestUpdate): void {
    this.googlePaySession$.next({
      ...this.googlePaySession$.getValue(),
      googlePayPaymentDataUpdate: value
    });
  }

  /**
   * Sets the Google Pay payment authorization result in the session.
   *
   * @param {PaymentAuthorizationResult} value - The payment authorization result to be set.
   * @since 2211.31.1
   */
  setGooglePayPaymentAuthorizationResult(value: PaymentAuthorizationResult): void {
    this.googlePaySession$.next({
      ...this.googlePaySession$.getValue(),
      googlePayPaymentAuthorizationResult: value
    });
  }

  /**
   * Retrieve the Google Pay merchant configuration from the state.
   *
   * @returns {Observable<GooglePayMerchantConfiguration>} - An observable of the Google Pay merchant configuration.
   * @since 2211.31.1
   */
  getMerchantConfigurationFromState(): Observable<GooglePayMerchantConfiguration> {
    return this.googlePaySession$.pipe(
      map((session: GooglePaySession): GooglePayMerchantConfiguration => session.googlePayMerchantConfiguration)
    );
  }

  getGooglePayPaymentDataUpdateFromState(): Observable<PaymentDataRequestUpdate> {
    return this.googlePaySession$.pipe(
      map((session: GooglePaySession): PaymentDataRequestUpdate => session.googlePayPaymentDataUpdate)
    );
  }

  /**
   * Dispatches a request to retrieve the Google Pay merchant configuration from OCC.
   *
   * @since 2211.31.1
   */
  public requestMerchantConfiguration(): void {
    this.requestMerchantConfigurationQuery$.get().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error: unknown): void => {
        this.logger.error('Error requesting Google Pay merchant configuration', { error });
      }
    });
  }

  /**
   * Authorizes a Google Pay order by dispatching an action with the payment details.
   *
   * @param {GooglePayPaymentRequest} paymentRequest - The Google Pay payment request containing payment method data.
   * @param {boolean} savePaymentMethod - Indicates whether to save the payment method for future use.
   * @sinve 2211.31.1
   */
  authoriseOrder(
    paymentRequest: GooglePayPaymentRequest,
    savePaymentMethod: boolean,
  ): void {
    const billingAddress: Address = paymentRequest.paymentMethodData?.info?.billingAddress;
    const shippingAddress: Address = paymentRequest?.shippingAddress;
    const email: string = paymentRequest?.email;
    const token: any = JSON.parse(
      paymentRequest.paymentMethodData?.tokenizationData?.token
    );
    this.setGooglePayPaymentAuthorizationResult(null);
    this.autoriseOrderCommand$.execute({
      token,
      billingAddress,
      savePaymentMethod,
      shippingAddress,
      email,
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error: unknown): void => {
        this.setGooglePayPaymentAuthorizationResult({ transactionState: 'ERROR' });
        this.showErrors(
          'paymentForm.googlepay.authorisationFailed',
          'Error authorising Google Pay payment',
          error
        );
      }
    }
    );
  }

  /**
   * Updates the payment data by dispatching an action with the provided payment data.
   *
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data to be updated.
   * @since 2211.31.1
   */
  updatePaymentData(paymentData: IntermediatePaymentData,): Observable<PaymentDataRequestUpdate> {
    return this.updatePaymentDataCommand$.execute(paymentData);
  }

  /**
   * Creates an initial Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} merchantConfiguration - The Google Pay merchant configuration.
   * @param {boolean} shippingAddressRequired - Indicates whether a shipping address is required.
   * @returns {any} - The initial Google Pay payment request object.
   * @since 2211.31.1
   */
  createInitialPaymentRequest(
    merchantConfiguration: GooglePayMerchantConfiguration,
    shippingAddressRequired: boolean,
  ): any {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        merchantConfiguration.baseCardPaymentMethod
      ],
      shippingAddressRequired,
    };
  }

  /**
   * Creates a full Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} merchantConfiguration - The Google Pay merchant configuration.
   * @returns {any} - The full Google Pay payment request object.
   * @since 2211.31.1
   */
  createFullPaymentRequest(
    merchantConfiguration: GooglePayMerchantConfiguration
  ): any {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          ...merchantConfiguration.baseCardPaymentMethod,
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: merchantConfiguration.gateway,
              gatewayMerchantId: merchantConfiguration.gatewayMerchantId
            }
          }
        }
      ],
      merchantInfo: {
        merchantName: merchantConfiguration.merchantName || '',
        merchantId: merchantConfiguration.merchantId || ''
      },
      transactionInfo: {
        ...merchantConfiguration.transactionInfo,
      }
    };
  }

  /**
   * Adds payment express intents to the Google Pay payment request.
   *
   * @param {GooglePayMerchantConfiguration} paymentRequest - The Google Pay merchant configuration.
   * @returns {GooglePayPaymentExpressIntents} - The updated Google Pay payment request with express intents.
   */
  addPaymentExpressIntents(paymentRequest: GooglePayMerchantConfiguration): GooglePayPaymentExpressIntents {
    return {
      ...paymentRequest,

      callbackIntents: [
        'SHIPPING_ADDRESS',
        'SHIPPING_OPTION',
      ],
      shippingAddressRequired: true,
      emailRequired: true,
      shippingAddressParameters: {},
      shippingOptionRequired: true,
    };
  }

  /**
   * Handles the payment authorization by dispatching an action with the provided payment data.
   *
   * @param {GooglePayPaymentRequest} paymentData - The Google Pay payment request containing payment method data.
   * @returns {Promise<any>} - A promise that resolves when the payment authorization result is available.
   * @since 2211.31.1
   */
  onPaymentAuthorized(paymentData: GooglePayPaymentRequest): Promise<GooglePaySession> {
    this.authoriseOrder(paymentData, false);

    return this.googlePaySession$.pipe(
      first((googlePaySession: GooglePaySession): boolean => {
        const update: PaymentAuthorizationResult = googlePaySession.googlePayPaymentAuthorizationResult;
        return Boolean(update) && Object.keys(update).length > 0;
      })
    ).toPromise();
  }

  /**
   * Updates the payment data by dispatching an action with the provided payment data.
   *
   * @param {IntermediatePaymentData} paymentData - The intermediate payment data to be updated.
   * @returns {Promise<any>} - A promise that resolves when the payment data update result is available.
   * @since 2211.31.1
   */
  onPaymentDataChanged(paymentData: IntermediatePaymentData): Promise<any> {
    return this.updatePaymentData(paymentData).pipe(
      filter((googlePayPaymentDataUpdate: PaymentDataRequestUpdate): boolean => Boolean(googlePayPaymentDataUpdate)),
      first((googlePayPaymentDataUpdate: PaymentDataRequestUpdate): boolean => googlePayPaymentDataUpdate !== undefined && Object.keys(googlePayPaymentDataUpdate).length > 0),
      map((response: PaymentDataRequestUpdate): PaymentDataRequestUpdate => response),
      takeUntilDestroyed(this.destroyRef),
    ).toPromise();
  }

  /**
   * Updates the application's error state and displays an error message to the user.
   *
   * @param {string} key - Translatable
   * @param {string} logMessage - Custom message to show in console
   * @param {string} errorMessage - Application error message
   * @returns {void}
   * @since 2211.30.1
   *
   */
  showErrors(key: string, logMessage: string, errorMessage: unknown): void {
    this.globalMessageService.add(
      { key },
      GlobalMessageType.MSG_TYPE_ERROR
    );
    this.logger.error(logMessage, { error: errorMessage });
  }

  protected override checkoutPreconditions(): Observable<[string, string]> {
    return getUserIdCartId(this.userIdService, this.activeCartFacade).pipe(
      map(({
        userId,
        cartId
      }: { userId: string, cartId: string }): [string, string] => [userId, cartId])
    );
  }
}
