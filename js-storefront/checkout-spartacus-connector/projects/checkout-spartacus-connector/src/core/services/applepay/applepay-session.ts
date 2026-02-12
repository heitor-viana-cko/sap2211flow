/* tslint:disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { WindowRef } from '@spartacus/core';

/**
 * Creates an ApplePaySession instance if the browser supports it.
 *
 * @param windowRef
 * @returns ApplePaySession instance or null
 * @since 4.2.7
 */
export const createApplePaySession: (windowRef: WindowRef) => null | any = (windowRef: WindowRef): null | any => {
  if (!windowRef.isBrowser()) {
    return null;
  }

  return (windowRef.nativeWindow as { [key: string]: any })['ApplePaySession'];
};
/* tslint:enable */
