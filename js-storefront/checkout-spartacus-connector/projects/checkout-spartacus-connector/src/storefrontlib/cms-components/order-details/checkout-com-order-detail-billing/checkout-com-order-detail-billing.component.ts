import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OrderDetailBillingComponent } from '@spartacus/order/components';
import { Order, paymentMethodCard } from '@spartacus/order/root';
import { Card } from '@spartacus/storefront';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-order-detail-billing',
  templateUrl: './checkout-com-order-detail-billing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutComOrderDetailBillingComponent extends OrderDetailBillingComponent {

  /**
   * Observable that emits the order details with the payment information.
   * It overrides the `order$` observable from the parent `OrderDetailBillingComponent`.
   * The payment information is determined by checking if `checkoutComPaymentInfo` is available,
   * otherwise it falls back to `paymentInfo`.
   */
  override order$: Observable<Order | undefined> = this.orderDetailsService.getOrderDetails().pipe(
    map((order: Order | undefined): Order | undefined => {
      if(!order) {
        return undefined;
      }

      return {
        ...order,
        paymentInfo: order?.checkoutComPaymentInfo || order?.paymentInfo
      };
    })
  );

  getApmInfoCard(apm: string): Observable<Card> {
    const carData: {accountHolderName: null, cardNumber: null} = {
      accountHolderName: null,
      cardNumber: null
    };

    return combineLatest([
      this.translationService.translate('paymentForm.payment'),
      this.translationService.translate('paymentCard.apm', { apm })
    ]).pipe(
      map(([textTitle, apmText]: [string, string]): Card =>
        paymentMethodCard(textTitle, apmText, carData)
      )
    );
    
  }

  isApmInfoCard(payment: Order): boolean {
    return Boolean(payment?.paymentInfo) && !payment?.paymentInfo?.cardNumber;
  }
}
