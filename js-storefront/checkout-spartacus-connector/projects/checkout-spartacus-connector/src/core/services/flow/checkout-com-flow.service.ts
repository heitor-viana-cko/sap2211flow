import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComFlowConnector } from '@checkout-core/connectors/checkout-com-flow/checkout-com-flow.connector';
import { CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import {
  CheckoutComFlowIsEnabledRequestEvent,
  CheckoutComFlowIsEnabledSetEvent,
  CheckoutComFlowPaymentSessionGeneratedEvent,
  CheckoutComFlowUIConfigurationSetEvent
} from '@checkout-core/events/checkout-com-flow.events';
import { CheckoutComOrderPlacedEvent } from '@checkout-core/events/checkout-order.events';
import { CheckoutComFlowComponentInterface, CheckoutComFlowUIConfigurationData, CheckoutComPaymentSession, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { CheckoutComApmFacade } from '@checkout-facades/checkout-com-apm.facade';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { CheckoutWebComponents, Component, loadCheckoutWebComponents, Options, PayPaymentSessionSuccessfulResponse } from '@checkout.com/checkout-web-components';
import { CheckoutDeliveryAddressCreatedEvent, CheckoutDeliveryAddressSetEvent } from '@spartacus/checkout/base/root';
import { CurrencySetEvent, GlobalMessageType, LanguageSetEvent, LoggerService, LoginEvent, LogoutEvent, Query, QueryNotifier, QueryState, RoutingService } from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComFlowService extends CheckoutComPaymentService implements CheckoutComFlowFacade {
  public customWebComponentsOptions: Partial<Options> = {};
  public locale: string = 'en-US';
  protected flowAppearanceConfiguration: CheckoutComFlowUIConfigurationData = {};
  protected flowPaymentSession$: BehaviorSubject<CheckoutComPaymentSession> = new BehaviorSubject<CheckoutComPaymentSession>({});
  protected isFlowEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected isProcessing$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected disableModalActions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected checkoutComFlowConnector: CheckoutComFlowConnector = inject(CheckoutComFlowConnector);
  protected checkoutComApmFacade: CheckoutComApmFacade = inject(CheckoutComApmFacade);
  protected logger: LoggerService = inject(LoggerService);
  protected routingService: RoutingService = inject(RoutingService);
  protected defaultWebComponentsOptions: Partial<Options> = {
    onReady: async (): Promise<void> => {
      this.isProcessing$.next(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmit: (_self: Component): void => {
      this.disableModalActions$.next(true);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPaymentCompleted: async (_self: any, payment: PayPaymentSessionSuccessfulResponse): Promise<void> => {
      if (!payment?.status || payment.status !== 'Approved') {
        this.logger.error(`Payment not authorised. Status: ${payment?.status ?? 'unknown'}`);
        return;
      }

      await this.routingService.go(
        { cxRoute: 'orderConfirmation' },
        {
          queryParams: {
            authorized: true,
            'cko-session-id': payment.id ?? ''
          }
        }
      );
      this.disableModalActions$.next(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: async (_self: any, error: Error): Promise<void> => {
      this.globalMessageService.add({ key: 'checkoutReview.paymentAuthorizationError' }, GlobalMessageType.MSG_TYPE_ERROR);
      this.logger.error(error);
      this.isProcessing$.next(false);
      this.disableModalActions$.next(false);
    }
  };
  /**
   * Query to check if the Checkout Flow feature is enabled.
   *
   * This query creates an observable that requests the flow enabled status
   * from the `CheckoutComFlowConnector`. It updates the enabled state and
   * dispatches an event with the result.
   *
   * @protected
   * @type {Query<FlowEnabledDataResponseDTO>}
   * @since 2211.32.1
   */

  protected queryIsFlowEnabled$: Query<FlowEnabledDataResponseDTO> =
    this.queryService.create<FlowEnabledDataResponseDTO>(
      (): Observable<FlowEnabledDataResponseDTO> =>
        this.checkoutComFlowConnector.requestIsFlowEnabled().pipe(
          tap((isFlowEnabledResponse: FlowEnabledDataResponseDTO): void => {
            this.setIsFlowEnabled(isFlowEnabledResponse?.enabled);
            this.eventService.dispatch({ isEnabled: isFlowEnabledResponse?.enabled }, CheckoutComFlowIsEnabledSetEvent);
          })
        ),
      {
        reloadOn: [CheckoutComFlowIsEnabledRequestEvent]
      }
    );
  /**
   * Query to request the Checkout Flow UI configuration.
   *
   * This query creates an observable that requests the flow UI configuration
   * from the `CheckoutComFlowConnector`. It updates the configuration state and
   * dispatches an event with the result.
   *
   * @protected
   * @type {Query<CheckoutComFlowUIConfigurationData>}
   * @since 2211.32.1
   */
  protected queryRequestFlowUIConfiguration$: Query<CheckoutComFlowUIConfigurationData> =
    this.queryService.create<CheckoutComFlowUIConfigurationData>(
      (): Observable<CheckoutComFlowUIConfigurationData> =>
        this.checkoutComFlowConnector.requestFlowUIConfiguration().pipe(
          tap((flowUIConfiguration: CheckoutComFlowUIConfigurationData): void => {
            this.setFlowUIConfiguration(flowUIConfiguration);
            this.eventService.dispatch({ configuration: flowUIConfiguration }, CheckoutComFlowUIConfigurationSetEvent);
          })
        )
    );
  /**
   * Query to generate a payment session for the Checkout Flow feature.
   *
   * This query creates an observable that generates a payment session by
   * ensuring preconditions are met, then requesting the session from the
   * `CheckoutComFlowConnector`. It updates the payment session state and
   * dispatches an event with the result. The query supports reloading and
   * resetting based on specific events.
   *
   * @protected
   * @type {Query<CheckoutComPaymentSession>}
   * @since 2211.32.1
   */
  protected generatePaymentSession$: Query<CheckoutComPaymentSession> =
    this.queryService.create<CheckoutComPaymentSession>(
      (): Observable<CheckoutComPaymentSession> =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]: [string, string]): Observable<CheckoutComPaymentSession> =>
            this.checkoutComFlowConnector.requestFlowPaymentSession(userId, cartId).pipe(
              tap((paymentSession: CheckoutComPaymentSession): void => {
                this.setFlowPaymentSession(paymentSession);
                this.eventService.dispatch({ paymentSession }, CheckoutComFlowPaymentSessionGeneratedEvent);
              })
            )
          )
        ),
      {
        reloadOn: this.reloadOnPaymentSessionEvents(),
        resetOn: this.reloadOnPaymentSessionEvents()
      }
    );
  private flowInstance: CheckoutComFlowComponentInterface;

  /**
   * Retrieves the list of events that trigger a reload of the payment session.
   *
   * This method returns an array of event types that, when dispatched, will
   * cause the payment session to reload. These events are related to changes
   * in the delivery address, billing address, or currency.
   *
   * @returns {[]} An array of event types that trigger a reload of the payment session.
   * @since 2211.32.1
   */
  public reloadOnPaymentSessionEvents(): QueryNotifier[] {
    return [
      CheckoutDeliveryAddressCreatedEvent,
      CheckoutDeliveryAddressSetEvent,
      CheckoutComBillingAddressUpdatedEvent,
      CurrencySetEvent,
      LanguageSetEvent
    ];
  }

  /**
   * Retrieves the list of events that trigger a reset of the payment session.
   *
   * This method returns an array of event types that, when dispatched, will
   * cause the payment session to reset. These events are related to user
   * authentication or order placement.
   *
   * @returns {[]} An array of event types that trigger a reset of the payment session.
   * @since 2211.32.1
   */
  public resetOnPaymentSessionEvents(): QueryNotifier[] {
    return [
      LogoutEvent,
      LoginEvent,
      OrderPlacedEvent,
      CheckoutComOrderPlacedEvent
    ];
  }

  /**
   * Retrieves the current processing state of the Checkout Flow feature.
   *
   * This method provides an observable that emits a boolean value indicating
   * whether the Checkout Flow feature is currently being processed.
   *
   * @returns {Observable<boolean>} An observable that emits the processing state of the Checkout Flow feature.
   * @since 2211.32.1
   */
  public getIsProcessing(): Observable<boolean> {
    return this.isProcessing$.asObservable();
  }

  /**
   * Retrieves the current state of whether the Checkout Flow feature is enabled.
   *
   * This method provides an observable that emits the enabled state
   * of the Checkout Flow feature.
   *
   * @returns {Observable<boolean>} An observable that emits the enabled state of the Checkout Flow feature.
   * @since 2211.32.1
   */
  public getIsFlowEnabled(): Observable<boolean> {
    return this.isFlowEnabled$.asObservable();
  }

  /**
   * Retrieves the current state of whether the Checkout Flow feature is being processed.
   *
   * This method provides an observable that emits the processing state
   * of the Checkout Flow feature.
   *
   * @returns {Observable<boolean>} An observable that emits the processing state of the Checkout Flow feature.
   * @since 2211.32.1
   */
  public getIsProcessingFlowEnabled(): Observable<boolean> {
    return this.requestIsFlowEnabled().pipe(
      map((state: QueryState<FlowEnabledDataResponseDTO>): boolean => state.loading)
    );
  }

  /**
   * Retrieves the current state of the Checkout Flow UI configuration processing.
   *
   * This method provides an observable that emits the flow configuration data
   * being processed for the Checkout Flow feature.
   *
   * @returns {Observable<boolean>} An observable that emits the flow configuration data being processed.
   * @since 2211.32.1
   */
  public getIsProcessingFlowUIConfiguration(): Observable<boolean> {
    return this.requestFlowUIConfiguration().pipe(
      map((state: QueryState<CheckoutComFlowUIConfigurationData>): boolean => state.loading)
    );
  }

  /**
   * Retrieves the processing state of the payment session request.
   *
   * This method provides an observable that emits a boolean value indicating
   * whether the payment session request is currently loading.
   *
   * @returns {Observable<boolean>} An observable that emits `true` if the payment session request is loading,
   * and `false` otherwise.
   * @since 2211.32.1
   */
  public getIsProcessingRequestPaymentSession(): Observable<boolean> {
    return this.requestPaymentSession().pipe(
      map((state: QueryState<CheckoutComPaymentSession>): boolean => state.loading)
    );
  }

  /**
   * Retrieves the current Checkout Flow ui configuration for the Checkout Flow feature.
   *
   * This method provides an observable that emits the flow configuration data.
   *
   * @returns {Observable<CheckoutComFlowUIConfigurationData>} An observable that emits the flow configuration data.
   * @since 2211.32.1
   */
  public getFlowUIConfiguration(): CheckoutComFlowUIConfigurationData {
    return this.flowAppearanceConfiguration;
  }

  /**
   * Retrieves the public key for the Checkout Flow feature.
   *
   * This method provides an observable that emits the public key
   * used for the Checkout Flow feature.
   *
   * @returns {Observable<string>} An observable that emits the public key.
   * @since 2211.32.1
   */
  public getFlowPublicKey(): Observable<string> {
    return this.occMerchantKey$.asObservable();
  }

  /**
   * Initializes the Checkout Flow process.
   *
   * This method begins by requesting the current state of whether the Checkout Flow feature is enabled.
   * It updates the `isProcessingFlowEnabled$` observable with the loading state of the request.
   * If the Checkout Flow feature is enabled, it proceeds to request the flow configuration data.
   * The flow configuration request is triggered only when the feature is enabled.
   * @since 2211.32.1
   */
  public initializeFlow(): void {
    this.requestIsFlowEnabled().pipe(
      switchMap((): Observable<QueryState<CheckoutComFlowUIConfigurationData>> => this.isFlowEnabled$.pipe(
        filter((enabled: boolean): boolean => enabled === true),
        tap((): void => this.requestPublicKey()),
        switchMap((): Observable<QueryState<CheckoutComFlowUIConfigurationData>> => this.requestFlowUIConfiguration())
      )),
      catchError((): Observable<boolean> => of(false))
    ).subscribe();
  }

  /**
   * Retrieves the current state of the payment session request.
   *
   * This method provides an observable that emits the state of the payment session
   * request, including loading, error, and data states.
   *
   * @returns {Observable<QueryState<CheckoutComPaymentSession>>} An observable that emits the state of the payment session request.
   * @since 2211.32.1
   */
  public requestPaymentSession(): Observable<QueryState<CheckoutComPaymentSession>> {
    return this.generatePaymentSession$.getState();
  }

  /**
   * Creates payment sessions by combining the Flow public key and payment session data.
   *
   * This method retrieves the Flow public key and the payment session data, ensuring both are available.
   * Once both are retrieved, it loads the web components using the provided public key and payment session.
   *
   * @returns {Observable<CheckoutWebComponents>} An observable that emits the loaded Checkout Web Components.
   * The observable completes once the components are successfully loaded.
   */
  public createPaymentSessions(customOptions: Partial<Options>): Observable<CheckoutWebComponents> {
    const publicKey$: Observable<string> = this.getFlowPublicKey().pipe(
      filter((key: string): boolean => Boolean(key))
    );

    const paymentSession$: Observable<CheckoutComPaymentSession> = this.requestPaymentSession().pipe(
      map((state: QueryState<CheckoutComPaymentSession>): CheckoutComPaymentSession => state?.data),
      filter((session: CheckoutComPaymentSession): boolean => Boolean(session))
    );

    return paymentSession$.pipe(
      withLatestFrom(publicKey$),
      switchMap(([paymentSession, publicKey]: [CheckoutComPaymentSession, string]): Observable<CheckoutWebComponents> =>
        this.loadWebComponents(publicKey, paymentSession, customOptions)
      )
    );
  }

  public setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Retrieves the current state of the flow enabled request.
   *
   * This method provides an observable that emits the state of the flow enabled
   * request, including loading, error, and data states.
   *
   * @returns {Observable<QueryState<FlowEnabledDataResponseDTO>>} An observable that emits the state of the flow enabled request.
   * @since 2211.32.1
   */
  public requestIsFlowEnabled(): Observable<QueryState<FlowEnabledDataResponseDTO>> {
    return this.queryIsFlowEnabled$.getState();
  }

  public getDisableModalActions(): Observable<boolean> {
    return this.disableModalActions$.asObservable();
  }

  /**
   * Updates the current state of whether the Checkout Flow feature is enabled.
   *
   * This method sets the provided enabled state and emits it
   * to all subscribers of the `isFlowEnabled$` observable.
   *
   * @param {boolean} isEnabled - The enabled state to be set for the Checkout Flow feature.
   * @since 2211.32.1
   */
  protected setIsFlowEnabled(isEnabled: boolean): void {
    this.isFlowEnabled$.next(isEnabled);
  }

  /**
   * Retrieves the current state of the flow configuration request.
   *
   * This method provides an observable that emits the state of the flow configuration
   * request, including loading, error, and data states.
   *
   * @returns {Observable<QueryState<CheckoutComFlowUIConfigurationData>>} An observable that emits the state of the flow configuration request.
   * @since 2211.32.1
   */
  protected requestFlowUIConfiguration(): Observable<QueryState<CheckoutComFlowUIConfigurationData>> {
    return this.queryRequestFlowUIConfiguration$.getState();
  }

  /**
   * Updates the current payment session for the Checkout Flow feature.
   *
   * This method sets the provided payment session data and emits it
   * to all subscribers of the `flowPaymentSession$` observable.
   *
   * @param {CheckoutComPaymentSession} paymentSession - The payment session data to be set.
   * @since 2211.32.1
   */
  protected setFlowPaymentSession(paymentSession: CheckoutComPaymentSession): void {
    this.flowPaymentSession$.next(paymentSession);
  }

  /**
   * Updates the current flow configuration for the Checkout Flow feature.
   *
   * This method sets the provided flow configuration data and emits it
   * to all subscribers of the `flowConfiguration$` observable.
   *
   * @param {CheckoutComFlowUIConfigurationData} flowConfiguration - The flow configuration data to be set.
   * @since 2211.32.1
   */
  protected setFlowUIConfiguration(flowConfiguration: CheckoutComFlowUIConfigurationData): void {
    this.flowAppearanceConfiguration = flowConfiguration;
  }

  /**
   * Requests the public key for the Checkout Flow feature.
   *
   * This method subscribes to an observable that emits the OCC merchant key from the state.
   * It filters out invalid keys, ensures distinct values, and automatically unsubscribes
   * when the component is destroyed. Once a valid public key is retrieved, it sets the
   * public key for the Checkout Flow feature.
   *
   * @protected
   * @since 2211.32.1
   */
  protected requestPublicKey(): void {
    this.getOccMerchantKeyFromState().pipe(
      filter((key: string): boolean => Boolean(key)),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (publicKey: string): void => {
        this.setFlowPublicKey(publicKey);
      }
    });
  }

  /**
   * Sets the public key for the Checkout Flow feature.
   *
   * This method updates the observable that holds the OCC merchant key with the provided
   * configuration value.
   *
   * @param {string} config - The public key to be set for the Checkout Flow feature.
   * @protected
   * @since 2211.32.1
   */
  protected setFlowPublicKey(config: string): void {
    this.occMerchantKey$.next(config);
  }

  /**
   * Loads the Checkout Web Components.
   *
   * This method initializes the loading process by setting the processing state to `true`.
   * It constructs the options required for loading the web components, including the public key,
   * payment session, environment, appearance configuration, and other options. The method
   * returns an observable that emits the loaded Checkout Web Components.
   *
   * @param {string} publicKey - The public key used for the Checkout Web Components.
   * @param {CheckoutComPaymentSession} paymentSession - The payment session data.
   * @param {Partial<Options>} customOptions - Custom options to override the default options.
   * @returns {Observable<CheckoutWebComponents>} An observable that emits the loaded Checkout Web Components.
   * @protected
   * @since 2211.32.1
   */
  protected loadWebComponents(publicKey: string, paymentSession: CheckoutComPaymentSession, customOptions: Partial<Options>): Observable<CheckoutWebComponents> {
    this.isProcessing$.next(true);
    const options: Options = {
      publicKey,
      paymentSession,
      environment: this.getEnvironment() || 'sandbox',
      appearance: this.flowAppearanceConfiguration || undefined,
      locale: this.locale || 'en-US',
      ...customOptions,
      ...this.defaultWebComponentsOptions,
      ...this.customWebComponentsOptions
    };
    return from(loadCheckoutWebComponents(options));
  }
}
