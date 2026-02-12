import { GooglePayMerchantConfiguration } from '@checkout-model/GooglePay';
import { generateManuCrediCardBrand } from '@checkout-tests/fake-data/payment-info.mock';
import { faker } from '@faker-js/faker';

export const generateOneGooglePayMerchantConfiguration = (): GooglePayMerchantConfiguration => ({
  baseCardPaymentMethod: {
    parameters: {
      allowedAuthMethods: ['PAN_ONLY'],
      allowedCardNetworks: generateManuCrediCardBrand(5),
      billingAddressParameters: { format: 'FULL' },
      billingAddressRequired: true
    },
    type: 'CARD'
  },
  clientSettings: { environment: 'TEST' },
  gateway: 'checkoutltd',
  gatewayMerchantId: faker.string.uuid(),
  merchantId: faker.string.uuid(),
  merchantName: faker.person.firstName(),
  transactionInfo: {
    currencyCode: faker.finance.currencyCode(),
    totalPrice: faker.finance.amount(),
    totalPriceStatus: 'FINAL'
  },
});