import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createApplePaySession } from '@checkout-core/services/applepay/applepay-session';
import { CheckoutComApplepayService } from '@checkout-core/services/applepay/checkout-com-applepay.service';
import { CheckoutComGooglepayService } from '@checkout-core/services/googlepay/checkout-com-googlepay.service';
import { CartProceedToCheckoutComponent } from '@spartacus/cart/base/components';
import { ActiveCartService } from '@spartacus/cart/base/core';
import { UserIdService, WindowRef } from '@spartacus/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-checkout-com-express-cart-totals',
  templateUrl: './express-cart-totals.component.html',
})
export class ExpressCartTotalsComponent extends CartProceedToCheckoutComponent implements OnInit, OnDestroy {
  applePay: boolean = false;
  private drop: Subject<void> = new Subject<void>();

  constructor(
    protected override router: Router,
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService,
    protected checkoutComApplepayService: CheckoutComApplepayService,
    protected checkoutComGooglePayService: CheckoutComGooglepayService,
    protected windowRef?: WindowRef
  ) {
    super(router);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.showApplePay();
    this.checkoutComGooglePayService.requestMerchantConfiguration();
    this.checkoutComApplepayService.requestApplePayPaymentRequest();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.drop.next();
  }

  showApplePay(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ApplePaySession: any = createApplePaySession(this.windowRef);
    this.applePay = !!(ApplePaySession && ApplePaySession.canMakePayments());
  }
}
