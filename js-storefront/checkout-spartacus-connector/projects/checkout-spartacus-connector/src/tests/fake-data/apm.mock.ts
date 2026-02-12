import { ApmPaymentDetails, SepaPaymentTypes } from '@checkout-core/interfaces';
import { ApmData } from '@checkout-model/ApmData';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { generateRandomPaymentType } from '@checkout-tests/fake-data/payment-info.mock';
import { generateFirstName, generateLastName } from '@checkout-tests/fake-data/user.mock';
import { faker } from '@faker-js/faker';

export  const generateSepaPaymentTypes = (): SepaPaymentTypes => {
  const sepaPaymentTypes = Object.values(SepaPaymentTypes) as SepaPaymentTypes[];
  const randomIndex: number = Math.floor(Math.random() * sepaPaymentTypes.length);
  return sepaPaymentTypes[randomIndex];
};

export const generateOneApmData = (isRedirect?: false, isUserDataRequired?: false): ApmData => ({
  code: generateRandomPaymentType(),
  name: faker.finance.transactionType(),
  isRedirect: isRedirect ?? faker.datatype.boolean(),
  isUserDataRequired: isUserDataRequired ?? faker.datatype.boolean(),
});

export const generateManyApmData = (size: number): ApmData[] => {
  const apmData: ApmData[] = [];
  for (let index = 0; index < size; index++) {
    apmData.push(generateOneApmData());
  }
  return [...apmData];
};

export const generateOneApmPaymentDetails = (): ApmPaymentDetails => {
  const address = generateOneAddress();
  return {
    accountIban: faker.finance.iban(),
    addressLine1 : address.line1,
    addressLine2: address.line2,
    authorizationToken: faker.string.uuid(),
    bic: faker.finance.bic(),
    billingAddress: address,
    city: address.town,
    country : address.country.isocode,
    document: faker.finance.routingNumber(),
    firstName : generateFirstName(),
    lastName : generateLastName(),
    mobileNumber : faker.phone.number(),
    paymentType: generateSepaPaymentTypes(),
    postalCode:  address.postalCode,
    type :generateRandomPaymentType(),
  };
};