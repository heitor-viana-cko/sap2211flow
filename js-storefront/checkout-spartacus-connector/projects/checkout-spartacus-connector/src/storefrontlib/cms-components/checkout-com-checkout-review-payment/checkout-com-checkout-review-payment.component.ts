import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutStepType } from '@spartacus/checkout/base/root';
import { Address, PaymentDetails, QueryState, TranslationService } from '@spartacus/core';
import { billingAddressCard, paymentMethodCard } from '@spartacus/order/root';
import { Card, ICON_TYPE } from '@spartacus/storefront';
import { combineLatest, Observable, switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-checkout-review-payment',
  templateUrl: './checkout-com-checkout-review-payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CheckoutComCheckoutReviewPaymentComponent implements OnInit {

  iconTypes: typeof ICON_TYPE = ICON_TYPE;
  paymentDetailsStepRoute: string = this.checkoutStepService.getCheckoutStepRoute(
    CheckoutStepType.PAYMENT_DETAILS
  );
  paymentDetails$: Observable<PaymentDetails | undefined>;
  protected billingAddressFormService: CheckoutComBillingAddressFormService = inject(CheckoutComBillingAddressFormService);

  constructor(
    protected checkoutStepService: CheckoutStepService,
    protected checkoutPaymentFacade: CheckoutComFlowFacade,
    protected translationService: TranslationService
  ) {
  }

  ngOnInit(): void {
    this.paymentDetails$ = this.checkoutPaymentFacade.getIsFlowEnabled().pipe(
      switchMap((isFlowEnabled: boolean): Observable<PaymentDetails> => {
        if (isFlowEnabled) {
          return this.getBillingAddress();
        }

        return this.getPaymentDetails();
      })
    );
  }

  getPaymentDetails(): Observable<PaymentDetails> {
    return this.checkoutPaymentFacade.getPaymentDetailsState().pipe(
      filter((state: QueryState<PaymentDetails>): boolean => !state.loading && !state.error),
      map((state: QueryState<PaymentDetails>): PaymentDetails => state.data)
    );
  }

  getBillingAddress(): Observable<PaymentDetails> {
    return this.billingAddressFormService.requestBillingAddress().pipe(
      filter((state: QueryState<Address>): boolean => !state.loading),
      switchMap((): Observable<PaymentDetails> => this.billingAddressFormService.billingAddress$.pipe(
        map((address: Address): PaymentDetails => ({
          billingAddress: address
        })
        )
      ))
    );
  }

  /**
   * Overrides the method to get the payment method card details.
   * This method combines translations for payment, expiry, and billing address
   * and maps them to a Card object.
   *
   * @param {any} paymentDetails - The payment details, either standard PaymentDetails or ApmPaymentDetails.
   * @returns {Observable<Card>} An observable that emits the Card object with payment method details.
   */
  getPaymentMethodCard(paymentDetails: PaymentDetails): Observable<Card> {
    return combineLatest([
      this.translationService.translate('paymentForm.payment'),
      this.getPaymentDetailsLineTranslation(paymentDetails)
    ]).pipe(
      map(([textTitle, textExpires]: [string, string]): Card =>
        paymentMethodCard(textTitle, textExpires, paymentDetails)
      )
    );
  }

  getBillingAddressCard(paymentDetails: PaymentDetails): Observable<Card> {
    return combineLatest([
      this.translationService.translate('paymentForm.billingAddress'),
      this.translationService.translate('addressCard.billTo')
    ]).pipe(
      map(([billingAddress, billTo]: [string, string]): Card =>
        billingAddressCard(billingAddress, billTo, paymentDetails)
      )
    );
  }

  /**
   * Retrieves the translation for the payment details line.
   * This method translates either the expiry date or the APM type based on the payment details provided.
   *
   * @param {any} paymentDetails - The payment details, either standard PaymentDetails or ApmPaymentDetails.
   * @returns {Observable<string>} An observable that emits the translated payment details line.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getPaymentDetailsLineTranslation(paymentDetails: any): Observable<string> {
    let paymentDetailsTranslation: Observable<string>;
    if (paymentDetails.expiryYear) {
      paymentDetailsTranslation = this.translationService.translate('paymentCard.expires', {
        month: paymentDetails.expiryMonth,
        year: paymentDetails.expiryYear
      });
    } else {
      paymentDetailsTranslation =
        this.translationService.translate(
          'paymentCard.apm', {
            apm: paymentDetails.type
          }
        );
    }
    return paymentDetailsTranslation;
  }
}
