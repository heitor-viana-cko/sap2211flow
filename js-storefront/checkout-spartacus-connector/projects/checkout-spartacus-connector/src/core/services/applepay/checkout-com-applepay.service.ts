import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComApplepayConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-applepay.connector';
import { CheckoutComApplePayPaymentRequestEvent } from '@checkout-core/events/apple-pay.events';
import { CheckoutComApplepayFacade } from '@checkout-facades/checkout-com-applepay.facade';
import {
  ApplePayAuthorization,
  ApplePayPaymentContact,
  ApplePayPaymentRequest,
  ApplepaySession,
  ApplePayShippingContactUpdate,
  ApplePayShippingMethod,
  ApplePayShippingMethodUpdate
} from '@checkout-model/ApplePay';
import { getUserIdCartId } from '@checkout-shared/get-user-cart-id';
import { showPaymentMethodFailMessage } from '@checkout-shared/paymentDetails';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressSetEvent } from '@spartacus/checkout/base/root';
import { Command, CommandService, CommandStrategy, CurrencySetEvent, EventService, LoggerService, Query, QueryService, UserIdService, WindowRef } from '@spartacus/core';
import { AddMessage } from '@spartacus/core/src/global-message/store/actions/global-message.actions';
import { OrderService } from '@spartacus/order/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { createApplePaySession } from './applepay-session';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable({
  providedIn: 'root'
})
export class CheckoutComApplepayService extends OrderService implements CheckoutComApplepayFacade {
  protected cartId: string;
  protected userId: string;
  protected applePaySession$: BehaviorSubject<ApplepaySession> = new BehaviorSubject<ApplepaySession>({
    applePayAuthorization: null,
    applePayMerchantSession: null,
    applePayShippingMethodUpdate: null,
    applePayShippingContactUpdate: null,
    applePayPaymentRequest: null
  });
  protected logger: LoggerService = inject(LoggerService);

  /**
   * Creates a command to validate the Apple Pay merchant.
   *
   * @type {Command<any, any>}
   * @since 2211.31.1
   */
  protected validateMerchantCommand$: Command<any, any> = this.commandService.create<any>(
    (validationURL: string): Observable<any> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<any> =>
        this.orderConnector.validateApplePayMerchant(userId, cartId, validationURL).pipe(
          tap((applePayMerchantSession: any): void => {
            this.setApplepayMerchantSession(applePayMerchantSession);
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  /**
   * Creates a command to authorize the Apple Pay payment.
   *
   * @param {any} payment - The payment information.
   * @returns {Query<ApplePayAuthorization, []>} - A query that emits the Apple Pay authorization.
   * @since 2211.31.1
   */
  protected onPaymentAuthorizedCommand$: Command<ApplePayAuthorization, unknown> = this.commandService.create<ApplePayAuthorization>(
    (payment: ApplePayAuthorization): Observable<ApplePayAuthorization> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<ApplePayAuthorization> =>
        this.orderConnector.authorizeApplePayPayment(userId, cartId, payment).pipe(
          tap((applePayAuthorization: ApplePayAuthorization): void => {
            this.setPaymentAuthorized(userId, cartId, applePayAuthorization);
          }),
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );
  /**
   * Creates a command to handle the selection of a shipping contact in Apple Pay.
   *
   * @param {ApplePayPaymentContact} shippingContact - The selected shipping contact.
   * @returns {Query<ApplePayShippingContactUpdate, []>} - A query that emits the Apple Pay shipping contact update.
   * @since 2211.31.1
   */
  protected onShippingContactSelectedCommand$: Command<ApplePayPaymentContact, unknown> = this.commandService.create(
    (shippingContact: ApplePayPaymentContact): Observable<ApplePayShippingContactUpdate> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<ApplePayShippingContactUpdate> =>
        this.orderConnector.selectApplePayDeliveryAddress(userId, cartId, shippingContact).pipe(
          tap((applePayShippingContactUpdate: ApplePayShippingContactUpdate): void => {
            this.setApplePayShippingMethodUpdate(applePayShippingContactUpdate);
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  /**
   * Query to request the Apple Pay payment request.
   *
   * @type {Query<ApplePayPaymentRequest, []>}
   * @since 2211.31.1
   */
  protected requestApplePayPaymentRequestQuery$: Query<ApplePayPaymentRequest, []> =
    this.queryService.create<ApplePayPaymentRequest>((): Observable<any> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<ApplePayPaymentContact> => this.orderConnector.requestApplePayPaymentRequest(userId, cartId).pipe(
        tap((applePayPaymentRequest: ApplePayPaymentContact): void => {
          this.setApplePayPaymentRequest(applePayPaymentRequest);
        })
      )
      )
    ),
    {
      reloadOn: [CheckoutComApplePayPaymentRequestEvent],
      resetOn: [OrderPlacedEvent, CurrencySetEvent, CheckoutDeliveryAddressSetEvent],
    }
    );

  private destroyRef: DestroyRef = inject(DestroyRef);
  private deliveryAddress$: Subscription;
  private deliveryMethod$: Subscription;

  /**
   * Constructor for the CheckoutComApplepayService.
   *
   * @param {ActiveCartFacade} activeCartFacade - Service to manage the active cart.
   * @param {UserIdService} userIdService - Service to manage user IDs.
   * @param {CommandService} commandService - Service to manage commands.
   * @param {CheckoutComApplepayConnector} orderConnector - Connector for Apple Pay orders.
   * @param {EventService} eventService - Service to manage events.
   * @param {QueryService} queryService - Service to manage queries.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @since 2211.31.1
   */
  constructor(
    protected override activeCartFacade: ActiveCartFacade,
    protected override userIdService: UserIdService,
    protected override commandService: CommandService,
    protected override orderConnector: CheckoutComApplepayConnector,
    protected override eventService: EventService,
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
  }

  /**
   * Resets the Apple Pay session state by clearing all session-related data.
   * Sets the cart ID to null.
   *
   * @returns {void}
   * @since 2211.31.1
   */
  public resetApplepaySession(): void {
    this.applePaySession$.next({
      applePayAuthorization: null,
      applePayMerchantSession: null,
      applePayShippingMethodUpdate: null,
      applePayShippingContactUpdate: null,
      applePayPaymentRequest: null
    });
    this.cartId = null;
  }

  /**
   * Creates an Apple Pay session and initializes event handlers.
   *
   * @param {ApplePayPaymentRequest} paymentRequest - The payment request object for Apple Pay.
   * @returns {any} - The initialized Apple Pay session.
   * @since 2211.31.1
   */
  public createSession(paymentRequest: ApplePayPaymentRequest): any {
    if (!this.windowRef.isBrowser()) {
      return;
    }
    const ApplePaySession: any = createApplePaySession(this.windowRef);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = new ApplePaySession(5, paymentRequest);
    session.onvalidatemerchant = this.onValidateMerchant.bind(this);
    session.onpaymentauthorized = this.onPaymentAuthorized.bind(this);
    session.onshippingmethodselected = this.onShippingMethodSelected.bind(this);
    session.onshippingcontactselected = this.onShippingContactSelected.bind(this);

    session.onerror = this.onPaymentError.bind(this);
    session.oncancel = this.onPaymentError.bind(this);

    session.begin();
    return session;
  }

  /**
   * Sets the Apple Pay payment request in the session state.
   *
   * @param {ApplePayPaymentRequest} applePayPaymentRequest - The Apple Pay payment request to set.
   * @returns {void}
   * @since 2211.31.1
   */
  public setApplePayPaymentRequest(applePayPaymentRequest: ApplePayPaymentRequest): void {
    this.applePaySession$.next({
      ...this.applePaySession$.value,
      applePayPaymentRequest
    });
  }

  /**
   * Sets the Apple Pay merchant session in the session state.
   *
   * @param {any} applePayMerchantSession - The Apple Pay merchant session to set.
   * @returns {void}
   * @since 2211.31.1
   */
  public setApplepayMerchantSession(applePayMerchantSession: any): void {
    this.applePaySession$.next({
      ...this.applePaySession$.value,
      applePayMerchantSession
    });
  }

  /**
   * Sets the Apple Pay shipping method update in the session state.
   *
   * @param {any} applePayShippingMethodUpdate - The Apple Pay shipping method update to set.
   * @returns {void}
   * @since 2211.31.1
   */
  public setApplepayShippingMethodUpdateUpdate(applePayShippingMethodUpdate: any): void {
    this.applePaySession$.next({
      ...this.applePaySession$.value,
      applePayShippingMethodUpdate
    });
  }

  /**
   * Sets the Apple Pay shipping contact update in the session state.
   *
   * @param {ApplePayShippingContactUpdate} applePayShippingContactUpdate - The Apple Pay shipping contact update to set.
   * @returns {void}
   * @since 2211.31.1
   */
  public setApplePayShippingMethodUpdate(applePayShippingContactUpdate: ApplePayShippingContactUpdate): void {
    this.applePaySession$.next({
      ...this.applePaySession$.value,
      applePayShippingContactUpdate
    });
  }

  /**
   * Sets the Apple Pay payment authorization in the session state.
   *
   * @param userId
   * @param cartId
   * @param {ApplePayAuthorization} applePayAuthorization - The Apple Pay payment authorization to set.
   * @returns {void}
   * @since 2211.31.1
   */
  public setPaymentAuthorized(userId: string, cartId: string, applePayAuthorization: ApplePayAuthorization): void {
    this.applePaySession$.next({
      ...this.applePaySession$.value,
      applePayAuthorization
    });

    if (applePayAuthorization?.orderData) {
      this.setPlacedOrder(applePayAuthorization?.orderData);
      this.eventService.dispatch(
        {
          order: applePayAuthorization?.orderData,
          userId,
          cartId,
          /**
           * As we know the cart is not anonymous (precondition checked),
           * we can safely use the cartId, which is actually the cart.code.
           */
          cartCode: cartId,
        },
        OrderPlacedEvent
      );
    }
  }

  /**
   * Create observable for ApplePay Payment Request.
   *
   * @returns {Observable<ApplePayPaymentRequest>} - An observable that emits the Apple Pay payment request.
   * @since 2211.31.1
   */
  public getPaymentRequestFromState(): Observable<ApplePayPaymentRequest> {
    return this.applePaySession$.pipe(
      map((session: ApplepaySession): ApplePayPaymentRequest => session.applePayPaymentRequest)
    );
  }

  /**
   * Retrieves the Apple Pay merchant session from the state.
   *
   * @returns {Observable<any>} - An observable that emits the Apple Pay merchant session.
   * @since 2211.31.1
   */
  public getMerchantSessionFromState(): Observable<any> {
    return this.applePaySession$.pipe(
      map((session: ApplepaySession): ApplePayPaymentRequest => session.applePayMerchantSession)
    );
  }

  /**
   * Retrieves the Apple Pay payment authorization from the state.
   *
   * @returns {Observable<ApplePayAuthorization>} - An observable that emits the Apple Pay payment authorization.
   * @since 2211.31.1
   */
  public getPaymentAuthorizationFromState(): Observable<ApplePayAuthorization> {
    return this.applePaySession$.pipe(
      map((session: ApplepaySession): ApplePayAuthorization => session.applePayAuthorization)
    );
  }

  /**
   * Retrieves the Apple Pay delivery address update from the state.
   *
   * @returns {Observable<ApplePayShippingContactUpdate>} - An observable that emits the Apple Pay delivery address update.
   * @since 2211.31.1
   */
  public getDeliveryAddressUpdateFromState(): Observable<ApplePayShippingContactUpdate> {
    return this.applePaySession$.pipe(
      map((session: ApplepaySession): ApplePayShippingContactUpdate => session.applePayShippingContactUpdate)
    );
  }

  /**
   * Retrieves the Apple Pay delivery method update from the state.
   *
   * @returns {Observable<ApplePayShippingMethodUpdate>} - An observable that emits the Apple Pay delivery method update.
   * @since 2211.31.1
   */
  public getDeliveryMethodUpdateFromState(): Observable<ApplePayShippingMethodUpdate> {
    return this.applePaySession$.pipe(
      map((session: ApplepaySession): ApplePayShippingMethodUpdate => session.applePayShippingMethodUpdate)
    );
  }

  /**
   * Dispatches an action to request the Apple Pay payment request that can be used to initialize the ApplePaySession.
   * @since 2211.31.1
   */
  public requestApplePayPaymentRequest(): void {
    this.requestApplePayPaymentRequestQuery$.get().pipe(
      filter((response: ApplePayPaymentRequest): boolean => !!response),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (): AddMessage => this.showPaymentMethodFailMessage('paymentForm.applePay.merchantValidationFailed'),
    });
  }

  /**
   * Dispatches an action to validate the Apple Pay merchant.
   *
   * @param {Object} event - The event object containing the validation URL.
   * @param {string} event.validationURL - The URL to validate the Apple Pay merchant.
   * @returns {void}
   * @since 2211.31.1
   */
  public onValidateMerchant(event: { validationURL: string }): void {
    this.validateMerchantCommand$.execute(event.validationURL).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (): AddMessage => this.showPaymentMethodFailMessage('paymentForm.applePay.merchantValidationFailed'),
    });
  }

  /**
   * Called when the Apple Pay user selects a different shipping method.
   *
   * @param {Object} event - The event object containing the selected shipping method.
   * @param {ApplePayShippingMethod} event.shippingMethod - The selected shipping method.
   * @returns {void}
   * @since 2211.31.1
   */
  public onShippingMethodSelected(event: { shippingMethod: ApplePayShippingMethod }): void {
    this.onShippingMethodSelected$(event.shippingMethod).get().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (): AddMessage => this.showPaymentMethodFailMessage('paymentForm.applePay.setDeliveryMethodFailed')
    });
  }

  /**
   * Called when the Apple Pay user selects a different delivery address.
   *
   * @param {Object} event - The event object containing the selected delivery address.
   * @param {ApplePayPaymentContact} event.shippingContact - The selected delivery address.
   * @returns {void}
   * @since 2211.31.1
   */
  public onShippingContactSelected(event: { shippingContact: ApplePayPaymentContact }): void {
    this.onShippingContactSelectedCommand$.execute(event.shippingContact).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (): AddMessage => this.showPaymentMethodFailMessage('paymentForm.applePay.setDeliveryAddressFailed')
    });
  }

  /**
   * Dispatches an action to authorize the Apple Pay payment.
   *
   * @param {Object} event - The event object containing the payment information.
   * @param {any} event.payment - The payment information.
   * @returns {void}
   * @since 2211.31.1
   */
  public onPaymentAuthorized(event: { payment: any }): void {
    this.onPaymentAuthorizedCommand$.execute(event.payment).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (): AddMessage => this.showPaymentMethodFailMessage('paymentForm.applePay.authorisationFailed')
    });
  }

  /**
   * Handles the payment error by displaying an error message and unsubscribing from observables.
   *
   * @returns {void}
   * @since 2211.31.1
   */
  public onPaymentError(): void {
    this.showPaymentMethodFailMessage('paymentForm.applePay.cancelled');

    try {
      this.deliveryAddress$?.unsubscribe();
      this.deliveryMethod$?.unsubscribe();
    } catch (err: unknown) {
      this.logger.error(err);
    }
  }

  /**
   * Displays a payment method failure message.
   *
   * @param {string} message - The message to display.
   * @returns {AddMessage} - The action to add the message.
   * @since 2211.31.1
   */
  public showPaymentMethodFailMessage(message: string): AddMessage {
    return showPaymentMethodFailMessage(message);
  }

  /**
   * Checks the preconditions for the checkout process.
   *
   * @returns {Observable<[string, string]>} - An observable that emits the user ID and cart ID.
   * @since 2211.31.1
   * @override
   */
  protected override checkoutPreconditions(): Observable<[string, string]> {
    return getUserIdCartId(this.userIdService, this.activeCartFacade).pipe(
      map(({
        userId,
        cartId
      }: { userId: string, cartId: string }): [string, string] => [userId, cartId])
    );
  }

  /**
   * Creates a query to handle the selection of a shipping method in Apple Pay.
   *
   * @param {ApplePayShippingMethod} shippingMethod - The selected shipping method.
   * @returns {Query<ApplePayShippingMethodUpdate, []>} - A query that emits the Apple Pay shipping method update.
   * @since 2211.31.1
   */
  protected onShippingMethodSelected$(shippingMethod: ApplePayShippingMethod): Query<ApplePayShippingMethodUpdate, []> {
    return this.queryService.create<ApplePayShippingMethodUpdate>(
      (): Observable<ApplePayShippingMethodUpdate> => this.checkoutPreconditions().pipe(
        switchMap(([userId, cartId]: [string, string]): Observable<ApplePayShippingMethodUpdate> =>
          this.orderConnector.selectApplePayDeliveryMethod(userId, cartId, shippingMethod).pipe(
            tap((applePayShippingMethodUpdate: ApplePayShippingMethodUpdate): void => {
              this.setApplepayShippingMethodUpdateUpdate(applePayShippingMethodUpdate);
            })
          )
        )
      ),
      {
        resetOn: [OrderPlacedEvent, CurrencySetEvent, CheckoutDeliveryAddressSetEvent],
      }
    );
  }
}
