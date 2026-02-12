import { TestBed } from '@angular/core/testing';
import { CheckoutStep, CheckoutStepType } from '@spartacus/checkout/base/root';

import { CheckoutComCheckoutConfigService } from './checkout-com-checkout-config.service';

describe('CheckoutComCheckoutConfigService', () => {
  let service: CheckoutComCheckoutConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutComCheckoutConfigService,
      ]
    });
    service = TestBed.inject(CheckoutComCheckoutConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('replacePaymentMethodStep', () => {
    it('should update the payment and review step names if steps exist', () => {
      const mockSteps: CheckoutStep[] = [
        { id: '1', name: 'step1', type: [CheckoutStepType.PAYMENT_DETAILS], routeName: 'route1' },
        { id: '2', name: 'step2', type: [CheckoutStepType.REVIEW_ORDER], routeName: 'route2' }
      ];
      service['checkoutConfig'].checkout = { steps: mockSteps };

      service.replacePaymentMethodStep();

      expect(mockSteps[0].name).toBe('checkoutProgress.billingAddress');
      expect(mockSteps[1].name).toBe('checkoutProgress.reviewAndPay');
    });

    it('should not throw an error if steps are undefined', () => {
      service['checkoutConfig'].checkout = { steps: undefined };

      expect(() => service.replacePaymentMethodStep()).not.toThrow();
    });

    it('should not update step names if PAYMENT_DETAILS step is not found', () => {
      const mockSteps: CheckoutStep[] = [
        { id: '1', name: 'step1', type: [], routeName: 'route1' },
        { id: '2', name: 'step2', type: [CheckoutStepType.REVIEW_ORDER], routeName: 'route2' }
      ];
      service['checkoutConfig'].checkout = { steps: mockSteps };

      service.replacePaymentMethodStep();

      expect(mockSteps[0].name).toBe('step1');
      expect(mockSteps[1].name).toBe('checkoutProgress.reviewAndPay');
    });

    it('should not update step names if REVIEW_ORDER step is not found', () => {
      const mockSteps: CheckoutStep[] = [
        { id: '1', name: 'step1', type: [CheckoutStepType.PAYMENT_DETAILS], routeName: 'route1' },
        { id: '2', name: 'step2', type: [], routeName: 'route2' }
      ];
      service['checkoutConfig'].checkout = { steps: mockSteps };

      service.replacePaymentMethodStep();

      expect(mockSteps[0].name).toBe('checkoutProgress.billingAddress');
      expect(mockSteps[1].name).toBe('step2');
    });
  });

  describe('getStepIndex', () => {
    it('should return the correct index when the step type exists', () => {
      const mockSteps: CheckoutStep[] = [
        { id: '1', name: 'step1', type: [CheckoutStepType.PAYMENT_DETAILS], routeName: 'route1' },
        { id: '2', name: 'step2', type: [CheckoutStepType.REVIEW_ORDER], routeName: 'route2' }
      ];
      service['checkoutConfig'].checkout = { steps: mockSteps };

      const result = service['getStepIndex'](CheckoutStepType.PAYMENT_DETAILS);

      expect(result).toBe(0);
    });

    it('should return -1 when the step type does not exist', () => {
      const mockSteps: CheckoutStep[] = [
        { id: '1', name: 'step1', type: [], routeName: 'route1' },
        { id: '2', name: 'step2', type: [CheckoutStepType.REVIEW_ORDER], routeName: 'route2' }
      ];
      service['checkoutConfig'].checkout = { steps: mockSteps };

      const result = service['getStepIndex'](CheckoutStepType.PAYMENT_DETAILS);

      expect(result).toBe(-1);
    });

    it('should return -1 when steps are undefined', () => {
      service['checkoutConfig'].checkout = { steps: undefined };

      const result = service['getStepIndex'](CheckoutStepType.PAYMENT_DETAILS);

      expect(result).toBe(-1);
    });

    it('should return -1 when checkout is undefined', () => {
      service['checkoutConfig'].checkout = undefined;

      const result = service['getStepIndex'](CheckoutStepType.PAYMENT_DETAILS);

      expect(result).toBe(-1);
    });
  });
});
