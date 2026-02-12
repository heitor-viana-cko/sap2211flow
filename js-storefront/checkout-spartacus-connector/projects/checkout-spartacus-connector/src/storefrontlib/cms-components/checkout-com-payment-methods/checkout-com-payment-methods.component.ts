import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { GlobalMessageService, GlobalMessageType, LoggerService, PaymentDetails, TranslationService, UserIdService, UserPaymentService } from '@spartacus/core';
import { Card, PaymentMethodsComponent } from '@spartacus/storefront';
import { combineLatest, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'y-checkout-com-payment-methods',
  templateUrl: './checkout-com-payment-methods.component.html'
})
export class CheckoutComPaymentMethodsComponent extends PaymentMethodsComponent implements OnInit {
  showEditAddressForm: boolean = false;
  selectedPaymentMethod: CheckoutComPaymentDetails;
  protected logger: LoggerService = inject(LoggerService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Constructor for the CheckoutComPaymentDetailsComponent class.
   *
   * @param {UserPaymentService} customUserPaymentService - The custom user payment service.
   * @param {TranslationService} translationService - The translation service.
   * @param {GlobalMessageService} globalMessageService - The global message service.
   * @param {UserIdService} userIdService - The user ID service.
   * @param {CheckoutComPaymentService} checkoutComPaymentService - The checkout.com payment service.
   * @since 2211.31.1
   */

  constructor(
    private customUserPaymentService: UserPaymentService,
    private translationService: TranslationService,
    protected override globalMessageService: GlobalMessageService,
    protected userIdService: UserIdService,
    protected checkoutComPaymentService: CheckoutComPaymentService,
  ) {
    super(customUserPaymentService, translationService, globalMessageService);
  }

  /**
   * Gets the card content for the given payment details.
   *
   * @param {PaymentDetails} param0 - The payment details.
   * @param {boolean} param0.defaultPayment - Indicates if this is the default payment method.
   * @param {string} param0.accountHolderName - The name of the account holder.
   * @param {string} param0.expiryMonth - The expiry month of the card.
   * @param {string} param0.expiryYear - The expiry year of the card.
   * @param {string} param0.cardNumber - The card number.
   * @param {CardType} param0.cardType - The type of the card.
   * @returns {Observable<Card>} An observable that emits the card content.
   * @since 2211.31.1
   */
  override getCardContent({
    defaultPayment,
    accountHolderName,
    expiryMonth,
    expiryYear,
    cardNumber,
    cardType,
  }: PaymentDetails): Observable<Card> {
    return combineLatest([
      this.translationService.translate('paymentCard.setAsDefault'),
      this.translationService.translate('common.delete'),
      this.translationService.translate('common.edit'),
      this.translationService.translate('paymentCard.deleteConfirmation'),
      this.translationService.translate('paymentCard.expires', {
        month: expiryMonth,
        year: expiryYear,
      }),
      this.translationService.translate('paymentCard.defaultPaymentMethod'),
      this.getIsABCParam(),
    ]).pipe(
      map(
        ([
          textSetAsDefault,
          textDelete,
          textEdit,
          textDeleteConfirmation,
          textExpires,
          textDefaultPaymentMethod,
          isABC
        ]: [string, string, string, string, string, string, boolean]): Card => {
          const actions: { name: string; event: string }[] = [];
          if (!defaultPayment) {
            actions.push({
              name: textSetAsDefault,
              event: 'default'
            });
          }
          if (isABC !== true) {
            actions.push({
              name: textEdit,
              event: 'edit'
            });
          }
          actions.push({
            name: textDelete,
            event: 'delete'
          });
          const card: Card = {
            header: defaultPayment ? textDefaultPaymentMethod : undefined,
            textBold: accountHolderName,
            text: [cardNumber ?? '', textExpires],
            actions,
            deleteMsg: textDeleteConfirmation,
            img: this.getCardIcon(cardType?.code ?? ''),
          };

          return card;
        }
      )
    );
  }

  /**
   * Handles the edit payment method button click event.
   *
   * @param {CheckoutComPaymentDetails} paymentMethod - The payment method details to be edited.
   * @since 2211.31.1
   */
  editPaymentMethodButtonHandle(paymentMethod: CheckoutComPaymentDetails): void {
    this.showEditAddressForm = true;
    this.selectedPaymentMethod = paymentMethod;
  }

  /**
   * Hides the payment form by setting the showEditAddressForm flag to false.
   */
  hidePaymentForm(): void {
    this.showEditAddressForm = false;
  }

  /**
   * Sets the payment details and updates them using the CheckoutComPaymentService.
   *
   * @param {CheckoutComPaymentDetails} paymentDetails - The payment details to be set and updated.
   * @since 2211.31.1
   */
  setPaymentDetails(paymentDetails: CheckoutComPaymentDetails): void {
    if (paymentDetails) {
      this.checkoutComPaymentService.updatePaymentDetails(paymentDetails)
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (): void => this.hidePaymentForm(),
          error: (error: unknown): void => {
            this.globalMessageService?.add({ key: 'paymentForm.merchantKeyFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
            this.logger.error('updatePaymentDetails with errors', { error });
          }
        });
    }
  }

  setEditPaymentMethod(paymentDetails: PaymentDetails): void {
    if (this.editCard !== paymentDetails.id) {
      this.editCard = paymentDetails.id;
    } else {
      this.deletePaymentMethod(paymentDetails);
    }
  }

  private getIsABCParam(): Observable<boolean> {
    return this.userIdService.getUserId().pipe(
      first((id: string): boolean => !!id),
      switchMap((): Observable<boolean> => this.checkoutComPaymentService.getIsABCFromState()),
    );
  }
}
