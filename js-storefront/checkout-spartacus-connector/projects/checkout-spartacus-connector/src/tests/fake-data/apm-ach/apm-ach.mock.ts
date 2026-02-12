import { AccountMeta, AchSuccessMetadata, InstitutionMeta } from '@checkout-core/model/Ach';
import { faker } from '@faker-js/faker';

export const intitutionMetaList: InstitutionMeta[] = [
  {
    name: 'Bank of America',
    institution_id: faker.string.uuid(),
  },
  {
    name: 'Chase',
    institution_id: faker.string.uuid(),
  },
  {
    name: 'TD',
    institution_id: faker.string.uuid(),
  },
];
export const generateInstitutionMeta = (): InstitutionMeta => intitutionMetaList[Math.floor(Math.random() * intitutionMetaList.length)];

export const generateAccountMeta = (): AccountMeta => ({
  id: faker.string.uuid(),
  name: faker.finance.accountName(),
  mask: faker.finance.accountNumber(4),
  type: faker.finance.transactionType(),
  subtype: faker.finance.transactionType(),
  verification_status: null,
  class_type: null
});

export const generateAchSuccessMetadata = (institution?:InstitutionMeta, accountsMeta?: AccountMeta[]  ): AchSuccessMetadata => {
  const accounts = accountsMeta || [generateAccountMeta()];
  return {
    status: faker.finance.transactionType(),
    link_session_id: faker.string.uuid(),
    institution: generateInstitutionMeta(),
    accounts,
    account: accounts[0],
    account_id: faker.string.uuid(),
    transfer_status: faker.finance.transactionType(),
    public_token: faker.string.uuid()
  };
};