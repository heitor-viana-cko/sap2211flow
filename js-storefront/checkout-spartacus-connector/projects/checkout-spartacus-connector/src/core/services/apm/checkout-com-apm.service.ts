import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { COMPONENT_APM_NORMALIZER } from '@checkout-adapters/converters';
import { CheckoutComApmConnector } from '@checkout-core/connectors/checkout-com-apm/checkout-com-apm.connector';
import { CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import { ApmPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComApmFacade } from '@checkout-facades/checkout-com-apm.facade';
import { ApmData, PaymentType } from '@checkout-model/ApmData';
import { OccCmsComponentWithMedia } from '@checkout-model/ComponentData';
import { KlarnaInitParams } from '@checkout-model/Klarna';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressCreatedEvent, CheckoutDeliveryAddressSetEvent, CheckoutPaymentDetailsCreatedEvent } from '@spartacus/checkout/base/root';
import {
  CmsService,
  Command,
  CommandService,
  CommandStrategy,
  ConverterService,
  CurrencySetEvent,
  EventService,
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
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComApmService implements CheckoutComApmFacade {
  protected destroyRef: DestroyRef = inject(DestroyRef);
  protected getKlarnaInitParamsQuery$: Query<KlarnaInitParams | HttpErrorResponse, []> = this.queryService.create(
    (): Observable<KlarnaInitParams | HttpErrorResponse> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<KlarnaInitParams | HttpErrorResponse> => this.checkoutComApmConnector.getKlarnaInitParams(userId, cartId))
    ),
    {
      reloadOn: this.getPaymentTypesQueryReloadEvents(),
      resetOn: this.getPaymentTypesQueryResetEvents()
    }
  );
  protected availableApms$: BehaviorSubject<QueryState<ApmData[]>> = new BehaviorSubject({
    loading: false,
    data: [],
    error: false
  });

  protected selectedApm$: BehaviorSubject<ApmData | null> = new BehaviorSubject({ code: PaymentType.Card });
  /**
   * Creates a query to request the available payment types.
   *
   * @returns {Query<ApmData[]>} - A query object to request available payment types.
   */
  protected requestPaymentTypesQuery$: Query<ApmData[], []> = this.queryService.create(
    (): Observable<ApmData[]> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<ApmData[]> =>
        this.checkoutComApmConnector.requestAvailableApms(userId, cartId)
      )
    ),
    {
      reloadOn: this.getPaymentTypesQueryReloadEvents(),
      resetOn: this.getPaymentTypesQueryResetEvents()
    }
  );
  protected createApmPaymentDetailsCommand: Command<ApmPaymentDetails, PaymentDetails> = this.commandService.create<PaymentDetails>(
    (paymentDetails: ApmPaymentDetails): Observable<PaymentDetails> =>
      this.checkoutPreconditions().pipe(
        switchMap(([userId, cartId]: [string, string]): Observable<PaymentDetails> =>
          this.checkoutComApmConnector.createApmPaymentDetails(userId, cartId, paymentDetails).pipe(
            tap((): void => {
              this.eventService.dispatch(
                {
                  userId,
                  cartId,
                  paymentDetails: paymentDetails
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

  /**
   * Constructor for the CheckoutComApmService.
   *
   * @param {ActiveCartFacade} activeCartFacade - Service for managing the active cart.
   * @param {UserIdService} userIdService - Service for managing user IDs.
   * @param {CmsService} cmsService - Service for managing CMS components.
   * @param {ConverterService} convertService - Service for converting data.
   * @param {CommandService} commandService - Service for managing commands.
   * @param {QueryService} queryService - Service for managing queries.
   * @param {EventService} eventService - Service for managing events.
   * @param {CheckoutComApmConnector} checkoutComApmConnector - Connector for Checkout.com APM services.
   * @since 2211.32.1
   */
  constructor(
    protected activeCartFacade: ActiveCartFacade,
    protected userIdService: UserIdService,
    protected cmsService: CmsService,
    protected convertService: ConverterService,
    protected commandService: CommandService,
    protected queryService: QueryService,
    protected eventService: EventService,
    protected checkoutComApmConnector: CheckoutComApmConnector
  ) {
  }

  /**
   * Retrieves the APM (Alternative Payment Method) data by component UID and payment type.
   *
   * @param {string} componentUid - The UID of the CMS component.
   * @param {PaymentType} paymentType - The type of payment.
   * @returns {Observable<ApmData>} - An observable containing the APM data.
   * @since 4.7.2
   */
  getApmByComponent(componentUid: string, paymentType: PaymentType): Observable<ApmData> {
    return this.cmsService.getComponentData<OccCmsComponentWithMedia>(componentUid)
      .pipe(this.convertService.pipeable(COMPONENT_APM_NORMALIZER),
        map((apmData: ApmData): ApmData => ({
          ...apmData,
          code: paymentType
        }))
      );
  }

  /**
   * Requests the available APMs (Alternative Payment Methods) by dispatching an action with the user and cart IDs.
   *
   * @returns {Observable<ApmData[]>} - An observable containing the list of available APMs.
   * @since 2211.31.1
   */
  requestAvailableApms(): Observable<QueryState<ApmData[]>> {
    return this.requestPaymentTypesQuery$.getState().pipe(
      tap((queryState: QueryState<ApmData[]>): void => {
        this.availableApms$.next(queryState);
      })
    );
  }

  /**
   * Dispatches an action to set the selected APM (Alternative Payment Method).
   *
   * @param {ApmData} apm - The APM data to be set as selected.
   * @since 2211.31.1
   */
  selectApm(apm: ApmData): void {
    this.selectedApm$.next(apm);
  }

  /**
   * Retrieves the available APMs (Alternative Payment Methods) from the state.
   *
   * @returns {Observable<ApmData[]>} - An observable containing the list of available APMs.
   * @since 2211.21.1
   */
  getAvailableApmsFromState(): Observable<ApmData[]> {
    return this.availableApms$.pipe(
      map((queryState: QueryState<ApmData[]>): ApmData[] => queryState.data)
    );
  }

  /**
   * Retrieves the selected APM (Alternative Payment Method) from the state.
   *
   * @returns {Observable<ApmData>} - An observable containing the selected APM data.
   * @since 2211.31.1
   */
  getSelectedApmFromState(): Observable<ApmData> {
    return this.selectedApm$.asObservable();
  }

  /**
   * Retrieves the loading state of APMs (Alternative Payment Methods) from the state.
   *
   * @returns {Observable<boolean>} - An observable containing the loading state of APMs.
   * @since 2211.31.1
   */
  getIsApmLoadingFromState(): Observable<boolean> {
    return this.availableApms$.pipe(
      map((queryState: QueryState<ApmData[]>): boolean => queryState.loading)
    );
  }

  /**
   * Creates APM (Alternative Payment Method) payment details and dispatches an action to store them.
   *
   * @param {ApmPaymentDetails} apmPaymentDetails - The APM payment details to be created.
   * @returns {Observable<PaymentDetails>} - An observable containing the payment details.
   * @since 2211.31.1
   */
  public createApmPaymentDetails(apmPaymentDetails: ApmPaymentDetails): Observable<PaymentDetails> {
    return this.createApmPaymentDetailsCommand.execute(apmPaymentDetails);
  }

  /**
   * Retrieves the Klarna initialization parameters by dispatching an action with the user and cart IDs.
   *
   * @returns {Observable<KlarnaInitParams>} - An observable containing the Klarna initialization parameters.
   * @since 2211.31.1
   */
  getKlarnaInitParams(): Observable<KlarnaInitParams | HttpErrorResponse> {
    return this.getKlarnaInitParamsQuery$.get();
  }

  /**
   * Retrieves the events that trigger a reload of the payment types query.
   *
   * @returns {QueryNotifier[]} - An array of query notifier events for reloading payment types.
   * @since 2211.31.1
   */
  protected getPaymentTypesQueryReloadEvents(): QueryNotifier[] {
    return [
      CurrencySetEvent,
      CheckoutDeliveryAddressSetEvent,
      CheckoutDeliveryAddressCreatedEvent,
      CheckoutComBillingAddressUpdatedEvent
    ];
  }

  /**
   * Retrieves the events that trigger a reset of the payment types query.
   *
   * @returns {QueryNotifier[]} - An array of query notifier events for resetting payment types.
   * @since 2211.31.1
   */
  protected getPaymentTypesQueryResetEvents(): QueryNotifier[] {
    return [LoginEvent, OrderPlacedEvent, LogoutEvent];
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
      this.activeCartFacade.isGuestCart()
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
}
