import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComApplePayPaymentRequestEvent } from '@checkout-core/events/apple-pay.events';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { ApplePayAuthorization, ApplePayPaymentRequest, ApplePayShippingContactUpdate, ApplePayShippingMethodUpdate } from '@checkout-model/ApplePay';
import { createApplePaySession } from '@checkout-services/applepay/applepay-session';
import { CheckoutComApplepayFacade } from '@checkout-facades/checkout-com-applepay.facade';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { EventService, GlobalMessageService, GlobalMessageType, LoggerService, RoutingService, UserIdService, WindowRef } from '@spartacus/core';
import { Order } from '@spartacus/order/root';
import { filter } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'lib-checkout-com-apm-applepay',
  templateUrl: './checkout-com-apm-applepay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmApplepayComponent implements OnInit {
  protected destroyRef: DestroyRef = inject(DestroyRef);
  protected logger: LoggerService = inject(LoggerService);
  private applePaySession: any;

  /**
   * Constructor for the CheckoutComApmApplepayComponent.
   *
   * @param {UserIdService} userIdService - Service to manage user IDs.
   * @param {ActiveCartService} activeCartService - Service to manage the active cart.
   * @param {CheckoutComOrderFacade} orderFacade - Facade to manage orders.
   * @param {RoutingService} routingService - Service to manage routing.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @param {GlobalMessageService} globalMessageService - Global message service.
   * @param {CheckoutComApplepayFacade} checkoutComApplepayFacade - Service to manage Apple Pay operations.
   * @param {EventService} eventService - Service to handle events.
   */
  constructor(
    protected userIdService: UserIdService,
    protected activeCartService: ActiveCartService,
    protected orderFacade: CheckoutComOrderFacade,
    protected routingService: RoutingService,
    protected windowRef: WindowRef,
    protected globalMessageService: GlobalMessageService,
    protected checkoutComApplepayFacade: CheckoutComApplepayFacade,
    protected eventService: EventService,
  ) {
  }

  ngOnInit(): void {
    this.eventService.dispatch({}, CheckoutComApplePayPaymentRequestEvent);
  }

  /**
   * Retrieves the user ID and cart ID, then places an Apple Pay order.
   * Subscribes to the observable returned by `getUserIdCartId` and calls `placeApplePayOrder` with the retrieved user ID and cart ID.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getCardId(): void {
    this.placeApplePayOrder();
  }

  /**
   * Retrieves the payment request from the state and modifies it before creating an Apple Pay session.
   * Subscribes to the observable returned by `getPaymentRequestFromState` and calls `createSession` with the modified payment request, cart ID, and user ID.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getPaymentRequest(): void {
    this.checkoutComApplepayFacade.getPaymentRequestFromState().pipe(
      filter((paymentRequest: ApplePayPaymentRequest): boolean => !!paymentRequest && Object.keys(paymentRequest).length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (paymentRequest: ApplePayPaymentRequest): void => {
        const modifiedPaymentRequest: ApplePayPaymentRequest = this.modifyPaymentRequest(paymentRequest);
        this.applePaySession = this.checkoutComApplepayFacade.createSession(modifiedPaymentRequest);
      },
      error: (error: unknown): void =>
        this.logger.error('placeApplePayOrder err', { error })
    });
  }

  /**
   * Retrieves the merchant session from the state and completes the merchant validation.
   * Subscribes to the observable returned by `getMerchantSesssionFromState` and calls `completeMerchantValidation` with the retrieved session.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getMerchantSessionFromState(): void {
    // handle merchant validation from ApplePay
    this.checkoutComApplepayFacade.getMerchantSessionFromState().pipe(
      filter((session: any): boolean => !!session && Object.keys(session).length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (session: any): void => {
        this.applePaySession?.completeMerchantValidation(session);
      },
      error: (error: unknown): void => {
        this.logger.error('merchant session with error', { error });
      }
    });
  }

  /**
   * Retrieves the delivery address update from the state and completes the shipping contact selection.
   * Subscribes to the observable returned by `getDeliveryAddressUpdateFromState` and calls `completeShippingContactSelection` with the retrieved update.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getDeliveryAddressUpdate(): void {
    // handle update of the delivery address in the ApplePay modal
    this.checkoutComApplepayFacade.getDeliveryAddressUpdateFromState()
      .pipe(
        filter((update: ApplePayShippingContactUpdate): boolean => !!update && Object.keys(update).length > 0),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (update: ApplePayShippingContactUpdate): void => {
          this.applePaySession?.completeShippingContactSelection(update);
        },
        error: (error: unknown): void => this.logger.error('delivery address update with error', { error })
      });
  }

  /**
   * Retrieves the delivery method update from the state and completes the shipping method selection.
   * Subscribes to the observable returned by `getDeliveryMethodUpdateFromState` and calls `completeShippingMethodSelection` with the retrieved update.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getDeliveryMethodUpdate(): void {
    // handle update of the delivery method in the ApplePay modal
    this.checkoutComApplepayFacade.getDeliveryMethodUpdateFromState()
      .pipe(
        filter((update: ApplePayShippingMethodUpdate): boolean => !!update && Object.keys(update).length > 0),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (update: any): void => {
          this.applePaySession?.completeShippingMethodSelection(update);
        },
        error: (error: unknown): void => this.logger.error('delivery method update with error', { error })
      });
  }

  createApplepaySession(): any {
    return createApplePaySession(this.windowRef);
  }

  /**
   * Retrieves the payment authorization from the state and completes the payment.
   * Subscribes to the observable returned by `getPaymentAuthorizationFromState` and calls `completePayment` with the appropriate status code.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getPaymentAuthorization(): void {
    // handle the payment authorization from ApplePay
    this.checkoutComApplepayFacade.getPaymentAuthorizationFromState().pipe(
      filter((authorization: ApplePayAuthorization): boolean => !!authorization && Object.keys(authorization).length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (authorization: ApplePayAuthorization): void => {
        const ApplePaySession: any = this.createApplepaySession();
        const statusCode: any =
          authorization.status === 'SUCCESS'
            ? ApplePaySession.STATUS_SUCCESS
            : ApplePaySession.STATUS_FAILURE;

        this.applePaySession?.completePayment({
          status: statusCode
        });

        if (statusCode === ApplePaySession.STATUS_SUCCESS) {
          this.checkoutComApplepayFacade.resetApplepaySession();
          this.orderFacade.setPlacedOrder(authorization.orderData);
        }
      },
      error: (error: unknown): void => this.logger.error('payment authorization with error', { error })
    });

  }

  /**
   * Navigates to the order details page if an order was created.
   * Subscribes to the observable returned by `getOrderDetails` and calls `routingService.go` to navigate to the order confirmation page.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  getOrderDetails(): void {
    // navigate to the order details page if order was created
    this.orderFacade.getOrderDetails().pipe(
      filter((order: Order): boolean => order && Object.keys(order).length !== 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (): void => {
        this.routingService.go({ cxRoute: 'orderConfirmation' });
      },
      error: (error: unknown): void => {
        this.logger.error('return to order confirmation with errors', { error });
      }
    });
  }

  /**
   * Places an Apple Pay order using the provided user ID and cart ID.
   * Retrieves the payment request from the state and modifies it before creating an Apple Pay session.
   * Logs an error message if the retrieval fails.
   *
   * @return {void}
   */
  placeApplePayOrder(): void {
    this.getPaymentRequest();
    this.getMerchantSessionFromState();
    this.getDeliveryAddressUpdate();
    this.getDeliveryMethodUpdate();
    this.getPaymentAuthorization();
    this.getOrderDetails();
  }

  /**
   * Updates the application's error state and displays an error message to the user.
   *
   * @param {string} [info] - An optional string containing the error message to be displayed.
   *                          If not provided, the global message service may handle a default or null value.
   * @returns {void}
   * @since 2211.30.1
   *
   */
  showErrors(info?: string): void {
    this.globalMessageService.add(
      info,
      GlobalMessageType.MSG_TYPE_ERROR
    );
  }

  /**
   * Method you can override to add more details to the payment request
   *
   * @param paymentRequest
   */
  protected modifyPaymentRequest(paymentRequest: ApplePayPaymentRequest): ApplePayPaymentRequest {
    return paymentRequest;
  }
}
