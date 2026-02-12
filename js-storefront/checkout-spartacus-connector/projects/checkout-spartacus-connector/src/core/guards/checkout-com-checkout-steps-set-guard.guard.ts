import { inject, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, GuardResult, UrlTree } from '@angular/router';
import { CheckoutComBillingAddressFormFacade } from '@checkout-facades/checkout-com-checkout-billing-address-form.facade';
import { initCheckoutComFLow } from '@checkout-facades/checkout-com-facade-providers';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComCheckoutConfigService } from '@checkout-services/checkout-steps/checkout-com-checkout-config.service';
import { CheckoutStepsSetGuard } from '@spartacus/checkout/base/components';
import { CheckoutStep } from '@spartacus/checkout/base/root';
import { Address, PaymentDetails, QueryState } from '@spartacus/core';
import { map, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComStepsSetGuard extends CheckoutStepsSetGuard implements OnDestroy {

  protected checkoutComFlowFacade: CheckoutComFlowFacade = inject(CheckoutComFlowFacade);
  protected checkoutComBillingAddressFormFacade: CheckoutComBillingAddressFormFacade = inject(CheckoutComBillingAddressFormFacade);
  protected checkoutComCheckoutConfigService: CheckoutComCheckoutConfigService = inject(CheckoutComCheckoutConfigService);

  override canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    initCheckoutComFLow(this.checkoutComFlowFacade, this.checkoutComCheckoutConfigService);
    return super.canActivate(route);
  }

  protected override isPaymentDetailsSet(step: CheckoutStep): Observable<GuardResult> {
    return this.checkoutComFlowFacade.requestIsFlowEnabled().pipe(
      filter((state: QueryState<{ enabled?: boolean }>): boolean => !state.loading),
      switchMap((isFlowEnabled: QueryState<{ enabled?: boolean }>): Observable<GuardResult> => {
        if (isFlowEnabled.data?.enabled) {
          return this.flowIsPaymentDetailsSet(step);
        }
        return this.defaultIsPaymentDetailsSet(step);
      })
    );
  }

  protected defaultIsPaymentDetailsSet(step: CheckoutStep): Observable<GuardResult> {
    return this.checkoutPaymentFacade.getPaymentDetailsState().pipe(
      filter((state: QueryState<PaymentDetails>): boolean => !state.loading),
      map((state: QueryState<PaymentDetails>): PaymentDetails => state.data),
      map((paymentDetails: PaymentDetails): true | UrlTree =>
        paymentDetails && Object.keys(paymentDetails).length !== 0 ? true : this.getUrl(step.routeName)
      )
    );
  }

  protected flowIsPaymentDetailsSet(step: CheckoutStep): Observable<GuardResult> {
    return this.checkoutComBillingAddressFormFacade.requestBillingAddress().pipe(
      filter((state: QueryState<Address>): boolean => !state.loading),
      map((state: QueryState<Address>): Address => state.data),
      map((address: Address): true | UrlTree => address && Object.keys(address).length !== 0 ? true : this.getUrl(step.routeName)
      )
    );
  }
}
