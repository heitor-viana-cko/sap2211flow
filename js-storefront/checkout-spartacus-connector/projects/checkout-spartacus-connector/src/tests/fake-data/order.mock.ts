import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { generateOneProductEntry } from '@checkout-tests/fake-data/product-entries.mock';
import { faker } from '@faker-js/faker';
import { OrderEntry } from '@spartacus/cart/base/root';
import { Order } from '@spartacus/order/root';

export const generateOrder = (productEntries: number = 1, currencyIso: string = 'USD'): Order => {
  const entries: OrderEntry[] = productEntries > 0 ? Array.from({ length: productEntries }, () => generateOneProductEntry()) : [];
  const totalItems: number = entries.length;
  const totalValue: number = entries.reduce((acc, entry: OrderEntry) => acc + entry.quantity * entry.totalPrice.value, 0);
  return {
    code: faker.string.uuid(),
    guid: faker.string.uuid(),
    guestCustomer: false,
    paymentInfo: {
      billingAddress: generateOneAddress(),
      id: faker.string.uuid(),
    },
    entries,
    totalItems,
    totalPrice: {
      currencyIso,
      formattedValue: `$${totalValue.toFixed(2)}`,
      value: totalValue
    },
  };
};