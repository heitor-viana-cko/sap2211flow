/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { inject, Injectable } from '@angular/core';
import { CheckoutComCheckoutBillingAddressConnector } from '@checkout-core/connectors/checkout-com-checkout-billing-address/checkout-com-checkout-billing-address.connector';
import { CheckoutComBillingAddressRequestedEvent, CheckoutComBillingAddressUpdatedEvent } from '@checkout-core/events/billing-address.events';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutDeliveryAddressCreatedEvent, CheckoutDeliveryAddressSetEvent, CheckoutPaymentDetailsCreatedEvent } from '@spartacus/checkout/base/root';
import {
  Address,
  Command,
  CommandService,
  CommandStrategy,
  EventService,
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  LoggerService,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  Query,
  QueryNotifier,
  QueryService,
  QueryState,
  tryNormalizeHttpError,
  UserIdService
} from '@spartacus/core';
import { OrderPlacedEvent } from '@spartacus/order/root';
import { combineLatest, map, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

@Injectable()
export class CheckoutComCheckoutBillingAddressService {
  protected activeCartFacade: ActiveCartFacade = inject(ActiveCartFacade);
  protected userIdService: UserIdService = inject(UserIdService);
  protected commandService: CommandService = inject(CommandService);
  protected queryService: QueryService = inject(QueryService);
  protected eventService: EventService = inject(EventService);
  protected checkoutComBillingAddressConnector: CheckoutComCheckoutBillingAddressConnector = inject(CheckoutComCheckoutBillingAddressConnector);
  protected globalMessageService: GlobalMessageService = inject(GlobalMessageService);
  protected logger: LoggerService = inject(LoggerService);

  protected requestBillingAddress$: Query<Address> = this.queryService.create<Address>(
    (): Observable<Address> => this.checkoutPreconditions().pipe(
      switchMap(([userId, cartId]: [string, string]): Observable<Address> =>
        this.checkoutComBillingAddressConnector.requestBillingAddress(userId, cartId).pipe(
          tap((billingAddress: Address): void => {
            this.eventService.dispatch({ billingAddress }, CheckoutComBillingAddressRequestedEvent);
          }),
          catchError((error: unknown): Observable<unknown> => this.handleError(error))
        )
      )
    ),
    {
      reloadOn: this.requestBillingAddressReloadOn(),
      resetOn: this.requestBillingAddressResetOn()
    }
  );

  /**
   * Command to update the delivery address.
   *
   * This command uses the `CommandService` to create a command that updates the delivery address
   * for the current user and cart. It dispatches an event upon successful update and logs any errors.
   * Function to execute the command.
   *
   * @param params - The parameters for the command.
   * @param params.addressId - The ID of the address to update.
   * @param params.deliveryAddress - The new delivery address.
   * @returns An observable that emits the updated address.
   * @since 2211.32.1
   **/
  protected setDeliveryAddressAsBillingAddressCommand: Command<{ address: Address }, Address> =
    this.commandService.create<{ address: Address }, Address>(
      ({ address }: { address: Address }): Observable<Address> =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]: [string, string]): Observable<Address> =>
            this.checkoutComBillingAddressConnector.setDeliveryAddressAsBillingAddress(userId, cartId, address).pipe(
              tap((billingAddress: Address): void => {
                this.eventService.dispatch({ billingAddress }, CheckoutComBillingAddressUpdatedEvent);
              }),
              catchError((error: unknown): Observable<unknown> => this.handleError(error))
            )
          )
        ),
      {
        strategy: CommandStrategy.CancelPrevious
      }
    );

  public requestBillingAddressReloadOn(): QueryNotifier[] {
    return [
      CheckoutPaymentDetailsCreatedEvent,
      CheckoutDeliveryAddressSetEvent,
      CheckoutDeliveryAddressCreatedEvent,
      CheckoutComBillingAddressUpdatedEvent
    ];
  }

  public requestBillingAddressResetOn(): QueryNotifier[] {
    return [OrderPlacedEvent, LogoutEvent, LoginEvent, CheckoutDeliveryAddressSetEvent, CheckoutDeliveryAddressCreatedEvent];
  }

  public requestBillingAddress(): Observable<QueryState<Address | undefined>> {
    return this.requestBillingAddress$.getState();
  }

  public setDeliveryAddressAsBillingAddress(address: Address): void {
    this.setDeliveryAddressAsBillingAddressCommand.execute({ address }).pipe(
      take(1)
    ).subscribe();
  }

  /**
   * Performs the necessary checkout preconditions.
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

  protected handleError(error: unknown): Observable<never> {
    const httpError: HttpErrorModel = tryNormalizeHttpError(error, this.logger);
    const errorMessage: string = httpError?.details?.[0]?.message;
    this.logger.error('createPaymentDetails with errors', { error });
    this.globalMessageService.add(
      {
        raw: errorMessage
      },
      GlobalMessageType.MSG_TYPE_ERROR
    );
    return throwError((): HttpErrorModel => httpError);
  }
}
