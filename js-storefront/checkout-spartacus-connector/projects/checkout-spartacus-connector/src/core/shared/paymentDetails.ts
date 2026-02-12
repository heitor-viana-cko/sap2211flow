import { GlobalMessage, GlobalMessageActions, GlobalMessageType, PaymentDetails, TranslationService } from '@spartacus/core';
import { AddMessage } from '@spartacus/core/src/global-message/store/actions/global-message.actions';
import { Observable } from 'rxjs';

/**
 * give payment details translation for an order
 */
export const getPaymentDetailsLineTranslation: (translation: TranslationService, paymentDetails: PaymentDetails, paymentType: string) => Observable<string>  =
  (translation: TranslationService, paymentDetails: PaymentDetails, paymentType: string): Observable<string> => {
    let paymentDetailsTranslation: Observable<string>;
    if (paymentDetails.expiryMonth) {
      paymentDetailsTranslation = translation.translate('paymentCard.expires', {
        month: paymentDetails.expiryMonth,
        year: paymentDetails.expiryYear,
      });
    } else {
      paymentDetailsTranslation =
      translation.translate(
        'paymentCard.apm', {
          apm: paymentType
        }
      );
    }
    return paymentDetailsTranslation;
  };

export const showPaymentMethodFailMessage: (key?: string) => AddMessage = (
  key: string = 'checkoutReview.initialPaymentRequestFailed'
): AddMessage => {
  const failMessage: GlobalMessage = {
    text: {
      key
    },
    type: GlobalMessageType.MSG_TYPE_ERROR
  };
  return new GlobalMessageActions.AddMessage(failMessage);
};