import { GlobalMessageActions, GlobalMessageType, PaymentDetails, TranslationService } from '@spartacus/core';
import { of } from 'rxjs';
import { getPaymentDetailsLineTranslation, showPaymentMethodFailMessage } from './paymentDetails';

describe('Payment Utilities', () => {
  describe('getPaymentDetailsLineTranslation', () => {
    let mockTranslationService: jasmine.SpyObj<TranslationService>;
    let mockPaymentDetails: PaymentDetails;

    beforeEach(() => {
      mockTranslationService = jasmine.createSpyObj('TranslationService', ['translate']);
    });

    it('should translate expiry details when expiryMonth exists in paymentDetails', (done) => {
      mockPaymentDetails = {
        expiryMonth: '12',
        expiryYear: '2024',
      };

      const translationKey = 'paymentCard.expires';
      const translationResult = 'Expires: 12/2024';
      mockTranslationService.translate.and.returnValue(of(translationResult));

      getPaymentDetailsLineTranslation(
        mockTranslationService,
        mockPaymentDetails,
        'creditCard'
      ).subscribe((result) => {
        expect(result).toBe(translationResult);
        expect(mockTranslationService.translate).toHaveBeenCalledWith(translationKey, {
          month: '12',
          year: '2024',
        });
        done();
      });
    });

    it('should translate payment type when expiryMonth is not present', (done) => {
      mockPaymentDetails = {}; // No expiryMonth
      const paymentType = 'PayPal';
      const translationKey = 'paymentCard.apm';
      const translationResult = 'Payment method: PayPal';
      mockTranslationService.translate.and.returnValue(of(translationResult));

      getPaymentDetailsLineTranslation(
        mockTranslationService,
        mockPaymentDetails,
        paymentType
      ).subscribe((result) => {
        expect(result).toBe(translationResult);
        expect(mockTranslationService.translate).toHaveBeenCalledWith(translationKey, {
          apm: paymentType,
        });
        done();
      });
    });
  });

  describe('showPaymentMethodFailMessage', () => {
    it('should return a GlobalMessageActions.AddMessage with default error message key', () => {
      const action = showPaymentMethodFailMessage();

      expect(action).toBeInstanceOf(GlobalMessageActions.AddMessage);
      expect(action.payload.text.key).toBe('checkoutReview.initialPaymentRequestFailed');
      expect(action.payload.type).toBe(GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should return a GlobalMessageActions.AddMessage with a custom error message key', () => {
      const customKey = 'custom.error.key';
      const action = showPaymentMethodFailMessage(customKey);

      expect(action).toBeInstanceOf(GlobalMessageActions.AddMessage);
      expect(action.payload.text.key).toBe(customKey);
      expect(action.payload.type).toBe(GlobalMessageType.MSG_TYPE_ERROR);
    });
  });
});