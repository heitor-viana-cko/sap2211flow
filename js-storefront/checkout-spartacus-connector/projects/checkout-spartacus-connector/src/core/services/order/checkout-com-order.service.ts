import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComOrderConnector } from '@checkout-core/connectors/checkout-com-order/checkout-com-order.connector';
import { CheckoutComOrderPlacedEvent } from '@checkout-core/events/checkout-order.events';
import { CheckoutComOrderResult, CheckoutComRedirect } from '@checkout-core/interfaces';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { Command, CommandService, CommandStrategy, EventService, LoggerService, UserIdService } from '@spartacus/core';
import { OrderService } from '@spartacus/order/core';
import { Order, OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, EmptyError, Observable, of, throwError } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComOrderService extends OrderService implements CheckoutComOrderFacade {
  protected logger: LoggerService = inject(LoggerService);
  protected checkoutComOrderPlaced$: BehaviorSubject<CheckoutComOrderPlacedEvent> = new BehaviorSubject<CheckoutComOrderPlacedEvent>(null);
  protected authorizeOrderCommand$: Command<string, Order> =
    this.commandService.create<string, Order>(
      (payload: string): Observable<Order> =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]: [string, string]): Observable<Order> =>
            this.orderConnector.authorizeRedirectPlaceOrder(userId, cartId, payload).pipe(
              tap((order: Order): void => {
                this.onCheckoutComOrderPlaced(userId, cartId, order);
              })
            )
          )
        ),
      {
        strategy: CommandStrategy.CancelPrevious,
      }
    );
  protected override placeOrderCommand: Command<boolean, Order> =
    this.commandService.create<boolean, Order>(
      (payload: boolean): Observable<Order> =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]: [string, string]): Observable<Order> =>
            this.orderConnector.placeOrder(userId, cartId, payload).pipe(
              tap((order: Order): void => {
                let redirected: boolean = false;
                try {
                  // eslint-disable-next-line no-prototype-builtins
                  if (order != null && typeof order === 'object' && order.hasOwnProperty('redirectUrl')) {
                    this.onCheckoutComRedirect(order as CheckoutComRedirect);
                    redirected = true;
                  }
                } catch (error) {
                  this.logger.error('Error while redirecting to Checkout.com', error);
                }

                if (!redirected) {
                  this.onCheckoutComOrderPlaced(userId, cartId, order);
                }
              }),
              catchError((error: unknown): Observable<Order> => {
                this.logger.error(error);
                return throwError((): unknown => error);
              })
            )
          )
        ),
      {
        strategy: CommandStrategy.CancelPrevious,
      }
    );
  private destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    protected override activeCartFacade: ActiveCartFacade,
    protected override userIdService: UserIdService,
    protected override commandService: CommandService,
    protected override orderConnector: CheckoutComOrderConnector,
    protected override eventService: EventService,
  ) {
    super(
      activeCartFacade,
      userIdService,
      commandService,
      orderConnector,
      eventService
    );
  }

  /**
   * Retrieves the current value of the checkoutComOrderPlaced$ BehaviorSubject.
   *
   * @returns {CheckoutComOrderPlacedEvent} - The current value of the checkoutComOrderPlaced$ BehaviorSubject.
   */
  getCheckoutComOrderPlacedValue(): CheckoutComOrderPlacedEvent {
    return this.checkoutComOrderPlaced$.value;
  }

  /**
   * Sets the value of the checkoutComOrderPlaced$ BehaviorSubject.
   *
   * @param {CheckoutComOrderPlacedEvent} value - The value to set.
   */
  setCheckoutComOrderPlacedValue(value: CheckoutComOrderPlacedEvent): void {
    this.checkoutComOrderPlaced$.next(value);
  }

  /**
   * Handles the redirect response from Checkout.com.
   *
   * @param {CheckoutComRedirect} resposne - The redirect response from Checkout.com.
   * @since 2211.31.1
   */
  onCheckoutComRedirect(resposne: CheckoutComRedirect): void {
    this.setCheckoutComOrderPlacedValue(
      {
        order: null,
        successful: null,
        redirect: resposne,
        httpError: null,
      });
    this.eventService.dispatch(
      this.getCheckoutComOrderPlacedValue(),
      CheckoutComOrderPlacedEvent
    );
  }

  /**
   * Handles the event when a Checkout.com order is placed.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} cartId - The ID of the cart.
   * @param {Order} order - The placed order.
   * @since 2211.31.1
   */
  onCheckoutComOrderPlaced(userId: string, cartId: string, order: Order): void {
    this.setPlacedOrder(order);
    this.checkoutComOrderPlaced$.next(
      {
        order,
        successful: true,
        redirect: null,
        httpError: null,
      }
    );

    // OOTB event dispatch
    this.eventService.dispatch(
      {
        userId,
        cartId,
        /**
         * As we know the cart is not anonymous (precondition checked),
         * we can safely use the cartId, which is actually the cart.code.
         */
        cartCode: cartId,
        order,
      },
      OrderPlacedEvent
    );

    this.eventService.dispatch(
      this.checkoutComOrderPlaced$.value,
      CheckoutComOrderPlacedEvent
    );
  }

  /**
   * Send the session id from Checkout.com to the backend for order creation
   *
   * @param sessionId the session id from redirect
   * @returns true if the order was created successfully
   * @since 2211.31.1
   */
  public authorizeOrder(sessionId: string): Observable<boolean> {
    this.authorizeOrderCommand$.execute(sessionId).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      error: (error: unknown): void => this.logger.error('CheckoutComOrderService AuthorizeOrder error', { error })
    });

    return this.getOrderDetails().pipe(
      first((result: Order): boolean => result != null),
      map((orderDetails: Order): boolean => !!orderDetails),
      catchError((error: unknown): Observable<boolean> => {
        if (error instanceof EmptyError) {
          return of(false);
        }
        throw error;
      })
    );
  }

  /**
   * Retrieves the order result from the state.
   *
   * @returns {Observable<CheckoutComOrderResult>} - An observable containing the order result.
   * @since 2211.31.1
   */
  public getOrderResultFromState(): Observable<CheckoutComOrderResult> {
    return this.checkoutComOrderPlaced$.asObservable();
  }

  /**
   * Clears the placed order and resets the checkoutComOrderPlaced$ BehaviorSubject.
   *
   * @override
   */
  public override clearPlacedOrder(): void {
    super.clearPlacedOrder();
    this.checkoutComOrderPlaced$.next(null);
  }
}