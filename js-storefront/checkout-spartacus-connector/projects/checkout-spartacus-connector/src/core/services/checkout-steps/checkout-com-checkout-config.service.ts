import { inject, Injectable } from '@angular/core';
import { CheckoutConfig, CheckoutStep, CheckoutStepType } from '@spartacus/checkout/base/root';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComCheckoutConfigService {

  protected readonly checkoutConfig: CheckoutConfig = inject(CheckoutConfig);
  private readonly stepNameMap: Partial<Record<CheckoutStepType, string>> = {
    [CheckoutStepType.PAYMENT_DETAILS]: 'checkoutProgress.billingAddress',
    [CheckoutStepType.REVIEW_ORDER]: 'checkoutProgress.reviewAndPay'
  };

  public replacePaymentMethodStep(): void {
    const steps: CheckoutStep[] = this.checkoutConfig.checkout?.steps;
    if (!steps) return;

    steps.forEach((step: CheckoutStep): void => {
      const newName: string = Object.entries(this.stepNameMap)
        .find(([type]: [string, string]): boolean => step.type.includes(type as CheckoutStepType))
        ?.[1];
      if (newName) {
        step.name = newName;
      }
    });
  }

  protected getStepIndex(stepType: CheckoutStepType): number {
    return this.checkoutConfig.checkout?.steps?.findIndex(
      (step: CheckoutStep): boolean => step.type.includes(stepType)
    ) ?? -1;
  }
}
