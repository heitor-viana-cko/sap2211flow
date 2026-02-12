import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Params, Router, UrlTree } from '@angular/router';
import { CheckoutComOrderService } from '@checkout-services/order/checkout-com-order.service';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutQueryService } from '@spartacus/checkout/base/core';
import { CheckoutStepType } from '@spartacus/checkout/base/root';
import { GlobalMessageService, GlobalMessageType, RoutingConfigService, SemanticPathService, UserIdService, } from '@spartacus/core';
import { Order, OrderFacade } from '@spartacus/order/root';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CheckoutComOrderConfirmationGuard implements CanActivate {

  /**
   * Constructor for the CheckoutComOrderConfirmationGuard.
   *
   * @param {OrderFacade} orderFacade - Facade for order operations.
   * @param {Router} router - Angular router for navigation.
   * @param {SemanticPathService} semanticPathService - Service for semantic path operations.
   * @param {GlobalMessageService} globalMessageService - Service for displaying global messages.
   * @param {RoutingConfigService} routingConfigService - Service for routing configuration.
   * @param {CheckoutStepService} checkoutStepService - Service for checkout step operations.
   * @param {CheckoutQueryService} checkoutQueryService - Service for querying checkout details.
   * @param {UserIdService} userIdService - Service for user ID operations.
   * @param {ActiveCartFacade} activeCartFacade - Facade for active cart operations.
   * @param {CheckoutComOrderService} checkoutComCheckoutService - Service for Checkout.com order operations.
   */
  constructor(
    protected orderFacade: OrderFacade,
    protected router: Router,
    protected semanticPathService: SemanticPathService,
    protected globalMessageService: GlobalMessageService,
    protected routingConfigService: RoutingConfigService,
    protected checkoutStepService: CheckoutStepService,
    protected checkoutQueryService: CheckoutQueryService,
    protected userIdService: UserIdService,
    protected activeCartFacade: ActiveCartFacade,
    protected checkoutComCheckoutService: CheckoutComOrderService,
  ) {
  }

  /**
 * Determines if the route can be activated based on the order details and query parameters.
 *
 * @param {ActivatedRouteSnapshot} route - The snapshot of the current route.
 * @returns {Observable<boolean | UrlTree>} - An observable that emits a boolean indicating if the route can be activated or a UrlTree for redirection.
 */
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const params: Params = route.queryParams;
    if (params == null || typeof params !== 'object' || Object.keys(params)?.length === 0) {
      return this.orderFacade.getOrderDetails().pipe(
        map((orderDetails: Order): true | UrlTree => {
          if (orderDetails && Object.keys(orderDetails).length !== 0) {
            return true;
          } else {
            return this.router.parseUrl(
              this.semanticPathService.get('orders') ?? ''
            );
          }
        })
      );
    }

    if (params.authorized === false || params.authorized === 'false') {
      this.globalMessageService.add({ key: 'checkoutReview.paymentAuthorizationError' }, GlobalMessageType.MSG_TYPE_ERROR);
      this.checkoutQueryService.getCheckoutDetailsState().subscribe();
    } else {
      const sessionId: string = params['cko-session-id'];
      if (sessionId) {
        return this.checkoutComCheckoutService.authorizeOrder(sessionId).pipe(
        // if cart is not loaded within 4 seconds we reload the page.
        // This can happen when user reloads the page and the params are still in tact
          timeout(4000),
          catchError((): Observable<UrlTree> => of(this.router.parseUrl(this.semanticPathService.get('orderConfirmation')))
          ),
        );
      }
    }

    return of(this.router.parseUrl(
      this.routingConfigService.getRouteConfig(
        this.checkoutStepService.getCheckoutStepRoute(
          CheckoutStepType.PAYMENT_DETAILS
        )
      ).paths[0]
    ));
  }

}
