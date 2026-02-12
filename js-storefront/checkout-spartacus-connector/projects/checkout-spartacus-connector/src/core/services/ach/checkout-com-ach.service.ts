import { Injectable } from '@angular/core';
import { CheckoutComAchConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-ach.connector';
import { CheckoutComApmAchRequestPlaidLinkTokeSetEvent, CheckoutComApmAchRequestPlaidSuccessOrderSetEvent } from '@checkout-core/events/apm-ach.events';
import { AchOrderSuccessParams } from '@checkout-core/interfaces';
import { CheckoutComAchFacade } from '@checkout-facades/checkout-com-ach.facade';
import { AchSuccessMetadata } from '@checkout-model/Ach';
import { CheckoutComOrderService } from '@checkout-services/order/checkout-com-order.service';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import {
  Command,
  CommandService,
  EventService,
  GlobalMessageService,
  LoginEvent,
  OCC_USER_ID_ANONYMOUS,
  Query,
  QueryNotifier,
  QueryService,
  QueryState,
  UserIdService
} from '@spartacus/core';
import { Order, OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComAchService implements CheckoutComAchFacade {

  protected achSuccessMetadata$: BehaviorSubject<AchSuccessMetadata | null> = new BehaviorSubject(null);

  protected requestPlaidLinkTokenQuery$: Query<string, []> = this.queryService.create(
    (): Observable<string> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<string> => this.checkoutComAchConnector.getAchLinkToken(userId, cartId).pipe(
        tap((token: string): void => {
          this.eventService.dispatch({ token }, CheckoutComApmAchRequestPlaidLinkTokeSetEvent);
        })
      )),
    ),
    {
      reloadOn: this.getPaymentTypesQueryReloadEvents(),
      resetOn: this.getRequestPlaidLinkTokenQueryResetEvents(),
    });

  protected requestPlaidSuccessOrderCommand$: Command<AchOrderSuccessParams, Order> = this.commandService.create(
    (payload: AchOrderSuccessParams): Observable<Order> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<Order> =>
        this.checkoutComAchConnector.setAchOrderSuccess(userId, cartId, payload.publicToken, payload.metadata, payload.customerConsents).pipe(
          tap((order: Order): void => {
            this.orderService.setPlacedOrder(order);
            this.eventService.dispatch({ order: order }, CheckoutComApmAchRequestPlaidSuccessOrderSetEvent);
            // OOTB event dispatch
            this.eventService.dispatch(
              {
                userId,
                cartId,
                cartCode: cartId,
                order: order,
              },
              OrderPlacedEvent
            );
          })
        )
      )
    )
  );

  /**
   * Constructor for the CheckoutComAchService.
   * Initializes the service with the provided store and dependencies.
   *
   * @param {ActiveCartFacade} activeCartFacade - Facade for managing the active cart.
   * @param {UserIdService} userIdService - Service for retrieving the user ID.
   * @param {GlobalMessageService} globalMessageService - Service for displaying global messages.
   * @param {EventService} eventService - Service for handling events.
   * @param {CommandService} commandService - Service for executing commands.
   * @param {QueryService} queryService - Service for executing queries.
   * @param {CheckoutComOrderService} orderService - Service for orders.
   * @param {CheckoutComAchConnector} checkoutComAchConnector - Connector for ACH operations.
   * @since 2211.31.1
   */
  constructor(
    protected activeCartFacade: ActiveCartFacade,
    protected userIdService: UserIdService,
    protected globalMessageService: GlobalMessageService,
    protected eventService: EventService,
    protected commandService: CommandService,
    protected queryService: QueryService,
    protected orderService: CheckoutComOrderService,
    protected checkoutComAchConnector: CheckoutComAchConnector,
  ) {
  }

  /**
   * Requests a Plaid Link token for the current user.
   * The token is used to open the Plaid Link widget.
   *
   * @returns {Observable<QueryState<string>>} - The Plaid Link token.
   * @since 2211.31.1
   */
  public requestPlaidLinkToken(): Observable<QueryState<string>> {
    return this.requestPlaidLinkTokenQuery$.getState();
  }

  /**
   * Retrieves the Plaid Link token from the store.
   *
   * @returns {Observable<string>} - The Plaid Link token.
   * @since 4.2.7
   */
  public getPlaidLinkToken(): Observable<string> {
    return this.requestPlaidLinkToken().pipe(
      map((queryState: QueryState<string>): string => queryState.data)
    );
  }

  /**
   * Dispatches an action to set the ACH account list success metadata.
   *
   * @param {AchSuccessMetadata} achSuccessMetadata - The metadata for the ACH account list success.
   * @returns {void}
   * @since 4.2.7
   */
  public setPlaidLinkMetadata(achSuccessMetadata: AchSuccessMetadata): void {
    this.achSuccessMetadata$.next(achSuccessMetadata);
  }

  /**
   * Retrieves the Plaid Link metadata from the store.
   *
   * @returns {Observable<AchSuccessMetadata>} - The Plaid Link metadata.
   * @since 4.2.7
   */
  public getPlaidLinkMetadata(): Observable<AchSuccessMetadata> {
    return this.achSuccessMetadata$.asObservable();
  }

  /**
   * Requests a Plaid success order for the current user.
   * Dispatches an action to set the ACH order success and retrieves the order.
   *
   * @param {string} publicToken - The public token from Plaid.
   * @param {AchSuccessMetadata} metadata - The metadata for the ACH success.
   * @param {boolean} customerConsents - Indicates if the customer consents.
   * @returns {Observable<AchSuccessOrder>} - The Plaid success order.
   * @since 2211.31.1
   */
  public requestPlaidSuccessOrder(publicToken: string, metadata: AchSuccessMetadata, customerConsents: boolean): Observable<Order> {
    return this.requestPlaidSuccessOrderCommand$.execute({
      publicToken,
      metadata,
      customerConsents
    });
  }

  /**
   * Retrieves the ACH success order from the store.
   *
   * @returns {Observable<AchSuccessOrder>} - The ACH success order.
   * @since 4.2.7
   */
  public getPlaidOrder(): Observable<Order> {
    return this.orderService.getOrderDetails();
  }

  /**
   * Checks the preconditions for the checkout process.
   *
   * @returns {Observable<[string, string]>} - An observable that emits a tuple containing the user ID and cart ID.
   * @throws {Error} - Throws an error if the checkout conditions are not met.
   * @since 2211.31.1
   */
  protected checkoutPreconditions(): Observable<[string, string]> {
    return combineLatest([
      this.userIdService.takeUserId(),
      this.activeCartFacade.takeActiveCartId(),
      this.activeCartFacade.isGuestCart(),
    ]).pipe(
      take(1),
      map(([userId, cartId, isGuestCart]: [string, string, boolean]): [string, string] => {
        if (
          !userId ||
          !cartId ||
          (userId === OCC_USER_ID_ANONYMOUS && !isGuestCart)
        ) {
          throw new Error('Checkout conditions not met');
        }
        return [userId, cartId];
      })
    );
  }

  /**
   * Retrieves the events that trigger a reload of the payment types query.
   *
   * @returns {QueryNotifier[]} - An array of query notifier events for reloading payment types.
   * @since 2211.31.1
   */
  protected getPaymentTypesQueryReloadEvents(): QueryNotifier[] {
    return [];
  }

  /**
   * Retrieves the events that trigger a reload of the payment types query.
   *
   * @returns {QueryNotifier[]} - An array of query notifier events for reloading payment types.
   * @since 2211.31.1
   */
  protected getRequestPlaidLinkTokenQueryResetEvents(): QueryNotifier[] {
    return [LoginEvent, OrderPlacedEvent];
  }
}
