import { HttpResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { CHECKOUT_COM_ADDRESS_NORMALIZER } from '@checkout-adapters/converters';
import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import { CheckoutComCustomerConfiguration, CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { EnvironmentUnion } from '@checkout.com/checkout-web-components';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutPaymentService } from '@spartacus/checkout/base/core';
import { CheckoutPaymentDetailsCreatedEvent, CheckoutPaymentDetailsSetEvent, CheckoutQueryFacade, CheckoutState } from '@spartacus/checkout/base/root';
import {
  Address,
  Command,
  CommandService,
  CommandStrategy,
  ConverterService,
  EventService,
  GlobalMessageService,
  LoadUserPaymentMethodsEvent,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  PaymentDetails,
  Query,
  QueryNotifier,
  QueryService,
  QueryState,
  UserIdService
} from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComPaymentService extends CheckoutPaymentService implements CheckoutComPaymentFacade {
  protected globalMessageService: GlobalMessageService = inject(GlobalMessageService);
  protected checkoutComConnector: CheckoutComConnector = inject(CheckoutComConnector);
  protected convertService: ConverterService = inject(ConverterService);
  protected occMerchantKey$: BehaviorSubject<string> | null = new BehaviorSubject<string>(null);
  protected paymentDetails$: BehaviorSubject<CheckoutComPaymentDetails> | null = new BehaviorSubject<CheckoutComPaymentDetails>(null);
  //TODO: Remove isABC$ if confirmed that it is not used
  protected isABC$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected environment: EnvironmentUnion;
  protected override createPaymentMethodCommand: Command<CheckoutComPaymentDetails, PaymentDetails> = this.commandService.create<PaymentDetails>(
    (paymentDetails: CheckoutComPaymentDetails): Observable<PaymentDetails> =>
      this.checkoutPreconditions().pipe(
        switchMap(([userId, cartId]: [string, string]): Observable<PaymentDetails> =>
          this.checkoutPaymentConnector.createPaymentDetails(userId, cartId, paymentDetails).pipe(
            tap((response: PaymentDetails): void => {
              this.eventService.dispatch(
                {
                  userId,
                  cartId,
                  paymentDetails: response
                },
                CheckoutPaymentDetailsCreatedEvent
              );
            }
            )
          )
        )
      ),
    {
      strategy: CommandStrategy.CancelPrevious
    }
  );
  protected paymentAddress$: BehaviorSubject<Address> | null = new BehaviorSubject<Address>(null);
  protected setPaymentAddressCommand: Command<Address, Address> = this.commandService.create(
    (address: Address): Observable<Address> => this.checkoutPreconditions().pipe(
      map(([userId, cartId]: [string, string]): [string, string] => [userId, cartId]),
      map(([userId, cartId]: [string, string]): {
        userId: string;
        cartId: string;
        normalizedAddress: Address;
      } => ({
        userId,
        cartId,
        normalizedAddress: this.convertService.convert(address, CHECKOUT_COM_ADDRESS_NORMALIZER)
      })),
      switchMap(({ userId, cartId, normalizedAddress }: { userId: string, cartId: string, normalizedAddress: Address }): Observable<Address> =>
        this.checkoutPaymentConnector.setPaymentAddress(userId, cartId, normalizedAddress).pipe(
          tap((billingAddress: Address): void => {
            this.paymentAddress$.next(billingAddress);
            this.eventService.dispatch({ billingAddress }, CheckoutComBillingAddressUpdatedEvent);
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious
    }
  );
  protected updatePaymentDetailsCommand: Command<CheckoutComPaymentDetails, HttpResponse<void>> = this.commandService.create(
    (paymentDetails: CheckoutComPaymentDetails): Observable<HttpResponse<void>> => this.userIdService.getUserId().pipe(
      switchMap((userId: string): Observable<HttpResponse<void>> =>
        this.checkoutPaymentConnector.updatePaymentDetails(userId, paymentDetails).pipe(
          tap((): void => {
            this.paymentDetails$.next(null);
            this.eventService.dispatch(
              {
                userId,
                paymentDetailsId: paymentDetails.id
              },
              CheckoutPaymentDetailsSetEvent
            );
            this.eventService.dispatch({ userId }, LoadUserPaymentMethodsEvent);
          })
        )
      )
    ),
    {
      strategy: CommandStrategy.CancelPrevious
    }
  );
  protected requestOccMerchantConfigurationQuery$: Query<string, []> = this.queryService.create(
    (): Observable<string> => this.userIdService.getUserId().pipe(
      switchMap((userId: string): Observable<string> => this.checkoutComConnector.getMerchantKey(userId)
        .pipe(
          tap((response: string): void => {
            const {
              environment,
              publicKey
            }: CheckoutComCustomerConfiguration = JSON.parse(response);
            this.occMerchantKey$.next(publicKey);
            this.environment = environment === 'test' ? 'sandbox' : environment;
          })
        )
      )
    ),
    {
      reloadOn: this.checkoutComPaymentServiceReloadEvents(),
      resetOn: this.checkoutComPaymentServiceResetEvents()
    }
  );
  protected getIsABCQuery$: Query<boolean, []> = this.queryService.create(
    (): Observable<boolean> => this.userIdService.getUserId().pipe(
      switchMap((userId: string): Observable<boolean> => this.checkoutComConnector.getIsABC(userId).pipe(
        tap((isABC: boolean): void => {
          this.isABC$.next(isABC);
        })
      )
      )
    ),
    {
      resetOn: this.checkoutComPaymentServiceResetEvents()
    }
  );
  protected destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Constructor for the CheckoutComPaymentService.
   *
   * @param {ActiveCartFacade} activeCartFacade - Service to manage the active cart.
   * @param {UserIdService} userIdService - Service to manage user IDs.
   * @param {QueryService} queryService - Service to manage queries.
   * @param {CommandService} commandService - Service to manage commands.
   * @param {EventService} eventService - Service to manage events.
   * @param {CheckoutComPaymentConnector} checkoutPaymentConnector - Connector for Checkout.com payment.
   * @param {CheckoutQueryFacade} checkoutQueryFacade - Facade for checkout queries.
   *
   * @since 2211.31.1
   */
  constructor(
    protected override activeCartFacade: ActiveCartFacade,
    protected override userIdService: UserIdService,
    protected override queryService: QueryService,
    protected override commandService: CommandService,
    protected override eventService: EventService,
    protected override checkoutPaymentConnector: CheckoutComPaymentConnector,
    protected override checkoutQueryFacade: CheckoutQueryFacade
  ) {
    super(
      activeCartFacade,
      userIdService,
      queryService,
      commandService,
      eventService,
      checkoutPaymentConnector,
      checkoutQueryFacade
    );
  }

  /**
   * Specifies the events that trigger a reload of the OCC merchant key query.
   *
   * @returns {QueryNotifier[]} - An array of events that trigger a reload.
   */
  checkoutComPaymentServiceReloadEvents(): QueryNotifier[] {
    return [LoginEvent];
  }

  /**
   * Specifies the events that trigger a reset of the OCC merchant key query.
   *
   * @returns {QueryNotifier[]} - An array of events that trigger a reset.
   */
  checkoutComPaymentServiceResetEvents(): QueryNotifier[] {
    return [LogoutEvent, OrderPlacedEvent];
  }

  /**
   * Retrieves the OCC merchant key from the state.
   *
   * @returns {Observable<string>} - An observable containing the OCC merchant key.
   * @since 4.2.7
   */
  public getOccMerchantKeyFromState(): Observable<string> {
    return this.requestOccMerchantConfiguration().pipe(
      map((): string => this.occMerchantKey$.getValue())
    );
  }

  /**
   * Dispatches an action to request the OCC merchant key for the given user ID.
   *
   * @since 4.2.7
   */
  public requestOccMerchantConfiguration(): Observable<string> {
    return this.requestOccMerchantConfigurationQuery$.get();
  }

  /**
   * Checks if the card can be saved based on the user ID.
   *
   * @param {string} userId - The ID of the user.
   * @returns {boolean} - Returns true if the card can be saved, false otherwise.
   */
  public canSaveCard(userId: string): boolean {
    return userId !== OCC_USER_ID_ANONYMOUS;
  }

  /**
   * Retrieves the payment details from the state.
   *
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details or an error.
   * @since 4.2.7
   */
  public getPaymentDetailsFromState(): Observable<CheckoutComPaymentDetails> {
    return this.paymentDetails$.asObservable();
  }

  /**
   * Creates payment details and dispatches an action to store them.
   *
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be created.
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details.
   * @since 2211.31.1
   */
  public override createPaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<CheckoutComPaymentDetails> {
    return this.createPaymentMethodCommand.execute(paymentDetails);
  }

  /**
   * Updates the payment details and dispatches an action to store them.
   *
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be updated.
   * @returns {Observable<HttpResponse<void>>} - An observable that completes when the action is dispatched.
   * @since 2211.31.1
   */
  public updatePaymentDetails(paymentDetails: CheckoutComPaymentDetails): Observable<HttpResponse<void>> {
    return this.updatePaymentDetailsCommand.execute(paymentDetails);
  }

  /**
   * Retrieves the payment address from the state.
   *
   * @returns {Observable<Address>} - An observable containing the payment address or an error.
   * @since 4.2.7
   */
  public getPaymentAddressFromState(): Observable<Address> {
    return this.paymentAddress$.asObservable();
  }

  /**
   * Updates the payment address and executes the set payment address command.
   *
   * @param {Address} address - The payment address to be updated.
   * @returns {Observable<Address>} - An observable containing the updated payment address.
   * @since 2211.31.1
   */
  public updatePaymentAddress(address: Address): Observable<Address> {
    this.paymentAddress$.next(null);
    return this.setPaymentAddressCommand.execute(address);
  }

  /**
   * Dispatches an action to set the payment address.
   *
   * @param {Address} address - The payment address to be set.
   * @since 4.2.7
   */
  public setPaymentAddress(address: Address): Observable<Address> {
    return this.updatePaymentAddress(address);
  }

  /**
   * TODO: Remove if confirmed that it is not used
   * Dispatches an action to set the OCC IsABC flag for the given user ID.
   *
   * @since 2211.31.1
   */
  public getIsABC(): Observable<QueryState<boolean>> {
    return this.getIsABCQuery$.getState();
  }

  /**
   * TODO: Remove if confirmed that it is not used
   * Retrieves the OCC IsABC flag from the state.
   *
   * @returns {Observable<boolean>} - An observable containing the OCC IsABC flag.
   * @since 2211.31.1
   */
  public getIsABCFromState(): Observable<boolean> {
    return this.getIsABC().pipe(
      map((state: QueryState<boolean>): boolean => state.data)
    );
  }

  /**
   * Retrieves the OCC IsABC flag from the state.
   *
   * @returns {Observable<boolean>} - An observable containing the OCC IsABC flag.
   * @since 4.2.7
   */
  public override getPaymentDetailsState(): Observable<QueryState<PaymentDetails | undefined>> {
    return this.checkoutQueryFacade.getCheckoutDetailsState().pipe(
      map((state: QueryState<CheckoutState>): { data: PaymentDetails; loading: boolean; error: false | Error; } => ({
        ...state,
        data: state.data?.checkoutComPaymentInfo ?? state.data?.paymentInfo
      }))
    );
  }

  /**
   * Retrieves the current environment for the Checkout.com integration.
   *
   * This method returns the environment value, which is used to determine
   * the operational mode (e.g., 'sandbox' or 'production') for the integration.
   *
   * @returns {EnvironmentUnion} The current environment value.
   * @since 2211.32.1
   */
  public getEnvironment(): EnvironmentUnion {
    return this.environment;
  }
}
