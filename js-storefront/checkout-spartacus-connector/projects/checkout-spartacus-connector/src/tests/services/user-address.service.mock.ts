import { Region, UserAddressService } from '@spartacus/core';
import { of } from 'rxjs';

const mockRegions: Region[] = [
  {
    isocode: 'CA-ON',
    name: 'Ontario',
  },
  {
    isocode: 'CA-QC',
    name: 'Quebec',
  },
];

export class MockUserAddressService implements Partial<UserAddressService>{
  getRegions() {
    return of(mockRegions);
  }
}