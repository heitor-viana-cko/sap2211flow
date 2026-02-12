import { WindowRef } from '@spartacus/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadScript: (windowRef: WindowRef, script: string, onloadCallback?: any, idScript?: string) => void =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(windowRef: WindowRef, script: string, onloadCallback?: any, idScript?: string): void => {
  let isFound: boolean = false;
  // eslint-disable-next-line @typescript-eslint/typedef
  const scripts = windowRef.document.getElementsByTagName('script');
  /* tslint:disable */
  for (let i: number = 0; i < scripts.length; ++i) {
    if (
      scripts[i].getAttribute('src') != null &&
      scripts[i].getAttribute('src') === script
    ) {
      isFound = true;
    }
  }
  /* tslint:enable */

  if (!isFound) {
    // eslint-disable-next-line @typescript-eslint/typedef
    const node = windowRef.document.createElement('script');
    node.src = script;
    node.id = idScript;
    node.type = 'text/javascript';
    node.async = true;
    if (onloadCallback) {
      node.onload = onloadCallback;
    }

    windowRef.document.getElementsByTagName('head')[0].appendChild(node);
  }
};
