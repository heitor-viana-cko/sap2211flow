import { PaymentType } from '@checkout-model/ApmData';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { faker } from '@faker-js/faker';
import { PaymentDetails } from '@spartacus/core';

export const generateOneCreditCardBrand = () => faker.finance.creditCardIssuer();
export const generateManuCrediCardBrand = (size: number): Array<string> => {
  const brands = [];
  for (let i = 0; i < size; i++) {
    brands.push(faker.finance.creditCardIssuer());
  }
  return brands;
};

export const generateRandomPaymentType = (): PaymentType => {
  const paymentTypes = Object.values(PaymentType) as PaymentType[];
  const randomIndex = Math.floor(Math.random() * paymentTypes.length);
  return paymentTypes[randomIndex];
};
export const generateCreditCardPaymentInfo = (): PaymentDetails => ({
  cardNumber: faker.finance.creditCardNumber(),
  cardType: {
    code: 'Visa',
    name: 'Visa'
  },
  expiryMonth: '12',
  expiryYear: '2023',
  id: faker.string.uuid(),
});

export const generateOnePaymentInfo = (saved: boolean = false, paymentType: PaymentType): PaymentDetails => 
  /*let paymentMethod  = null;
  switch (paymentType) {
    case PaymentType.Card : {
      paymentInfo = {
        paymentInfo,
        ...generateCreditCardPaymentInfo()
      };
    }
    case PaymentType.ACH : {
      paymentMethod = generateACHPaymentInfo();
    }

    default: {
      paymentMethod = generateCreditCardPaymentInfo();
    }
  }*/
  ({
    billingAddress: generateOneAddress(),
    saved: false
  })
;