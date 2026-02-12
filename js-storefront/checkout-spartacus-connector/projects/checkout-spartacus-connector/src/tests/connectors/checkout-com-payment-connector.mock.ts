import { CheckoutComPaymentConnector } from '@checkout-core/connectors/checkout-com-payment/checkout-com-payment.connector';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CardType } from '@spartacus/core';
import { of } from 'rxjs';

const mockPaymentInfo: CheckoutComPaymentDetails = {
  id: 'mockPaymentId',
  cardBin: 'xxxx',
  accountHolderName: 'Erik Slagter',
  cardNumber: '4242424242424242',
  cvn: '100',
  expiryYear: '2022',
  expiryMonth: '12'
};
const mockCardTypes: CardType[] = [
  {
    code: 'VISA',
    name: 'Visa'
  },
  {
    code: 'MASTERCARD',
    name: 'MasterCart'
  }
];

export class MockCheckoutComPaymentConnector implements Partial<CheckoutComPaymentConnector> {
  getPaymentCardTypes() {
    return of(mockCardTypes);
  }

  createPaymentDetails() {
    return of(mockPaymentInfo);
  }

  setPaymentDetails() {
    return of('set');
  }

  setPaymentAddress() {
    return of({});
  };

  updatePaymentDetails() {
    return of(null);
  }
}