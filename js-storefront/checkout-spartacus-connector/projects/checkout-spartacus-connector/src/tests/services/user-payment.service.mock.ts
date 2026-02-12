import { UserPaymentService } from '@spartacus/core';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

const mockCountries = [{
  isocode: 'US',
  name: 'United States'
}];

export class MockUserPaymentService implements Partial<UserPaymentService> {
  loadBillingCountries = createSpy().and.returnValue(of(mockCountries));

  getAllBillingCountries() {
    return of(mockCountries);
  }
}