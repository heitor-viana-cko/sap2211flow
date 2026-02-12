import { getHeadersForUserId } from '@checkout-core/occ/adapters/occ-checkout-com.utils';
import { OCC_USER_ID_ANONYMOUS, USE_CLIENT_TOKEN } from '@spartacus/core';


describe('getHeadersForUserId', () => {
  it('should return headers with application/json content type for a regular user', () => {
    const headers = getHeadersForUserId('regularUser');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.has(USE_CLIENT_TOKEN)).toBeFalse();
  });

  it('should return headers with application/json content type for an anonymous user', () => {
    const headers = getHeadersForUserId(OCC_USER_ID_ANONYMOUS);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get(USE_CLIENT_TOKEN)).toBe('true');
  });

  it('should return headers with specified content type for a regular user', () => {
    const headers = getHeadersForUserId('regularUser', 'text/plain');
    expect(headers.get('Content-Type')).toBe('text/plain');
    expect(headers.has(USE_CLIENT_TOKEN)).toBeFalse();
  });

  it('should return headers with specified content type for an anonymous user', () => {
    const headers = getHeadersForUserId(OCC_USER_ID_ANONYMOUS, 'text/plain');
    expect(headers.get('Content-Type')).toBe('text/plain');
    expect(headers.get(USE_CLIENT_TOKEN)).toBe('true');
  });
});