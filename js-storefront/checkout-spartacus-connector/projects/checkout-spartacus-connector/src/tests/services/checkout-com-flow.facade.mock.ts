import { CheckoutComFlowUIConfigurationData, CheckoutComPaymentDetails, FlowEnabledDataResponseDTO } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { MockCheckoutComPaymentFacade } from '@checkout-tests/services/checkout-com-payment.facade.mock';
import { CheckoutWebComponents } from '@checkout.com/checkout-web-components';
import { QueryState } from '@spartacus/core';
import { Observable, of } from 'rxjs';

const mockPublicKey = 'test-public-key';
const mockPaymentSessionState = {
  loading: false,
  data: {}
} as QueryState<CheckoutComPaymentDetails>;
const mockCheckoutWebComponents = {} as CheckoutWebComponents;
const mockCheckoutComFlowUIConfigurationData = { color: 'red' } as CheckoutComFlowUIConfigurationData;

export class MockCheckoutComFlowFacade extends MockCheckoutComPaymentFacade implements Partial<CheckoutComFlowFacade> {
  requestIsFlowEnabled(): Observable<QueryState<FlowEnabledDataResponseDTO>> {
    return of({
      loading: false,
      error: false,
      data: { enabled: false }
    });
  }

  initializeFlow(): void {
  }

  getIsProcessing() {
    return of(false);
  }

  getIsFlowEnabled() {
    return of(false);
  }

  getFlowPublicKey() {
    return of(mockPublicKey);
  }

  requestPaymentSession() {
    return of(mockPaymentSessionState);
  }

  createPaymentSessions(): Observable<CheckoutWebComponents> {
    return of(mockCheckoutWebComponents);
  }

  setLocale(locale: string): void {
  }

  getIsProcessingFlowEnabled(): Observable<boolean> {
    return of(true);
  }

  getFlowUIConfiguration(): CheckoutComFlowUIConfigurationData {
    return mockCheckoutComFlowUIConfigurationData;
  }

  getIsProcessingFlowUIConfiguration(): Observable<boolean> {
    return of(false);
  }

  getIsProcessingRequestPaymentSession(): Observable<boolean> {
    return of(false);
  }

  getDisableModalActions(): Observable<boolean> {
    return of(false);
  }
}

export class MockCheckoutFlowService extends MockCheckoutComFlowFacade {

}
