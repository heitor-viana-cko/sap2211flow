import { TestBed } from '@angular/core/testing';
import { Address } from '@spartacus/core';
import { CheckoutComBillingAddressNormalizer } from './billing-address-normalizer';

describe('CheckoutComBillingAddressNormalizer', () => {
  let service: CheckoutComBillingAddressNormalizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutComBillingAddressNormalizer]
    });
    service = TestBed.inject(CheckoutComBillingAddressNormalizer);
  });

  it('should convert source address to target address with region isocodeShort', () => {
    const source: Address = {
      region: {
        isocode: 'US-CA',
        isocodeShort: 'CA'
      }
    };
    const target: Address = undefined;

    const result = service.convert(source, target);

    expect(result.region.isocode).toEqual('CA');
  });

  it('should convert source address to target address with region isocode if isocodeShort is not available', () => {
    const source: Address = {
      region: { isocode: 'US-CA' }
    };
    const target: Address = undefined;

    const result = service.convert(source, target);

    expect(result.region.isocode).toEqual('US-CA');
  });

  it('should use source address as target if target is not provided', () => {
    const source: Address = {
      region: {
        isocode: 'US-CA',
        isocodeShort: 'CA'
      }
    };

    const result = service.convert(source);

    expect(result.region.isocode).toEqual('CA');
  });

  it('should handle source address without region', () => {
    const source: Address = {};
    const target: Address = undefined;

    const result = service.convert(source, target);

    expect(result.region).toBeUndefined();
  });

  it('should handle target address without region', () => {
    const source: Address = {
      region: {
        isocode: 'US-CA',
        isocodeShort: 'CA'
      }
    };
    const target: Address = undefined;

    const result = service.convert(source, target);

    expect(result.region.isocode).toEqual('CA');
  });
});