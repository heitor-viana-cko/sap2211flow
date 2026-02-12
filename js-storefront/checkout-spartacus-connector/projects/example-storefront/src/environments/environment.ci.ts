// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// eslint-disable-next-line @typescript-eslint/typedef
export const environment = {
  production: false,
  enableStoreDevTools: false,
  context: {
    baseSite: ['electronics-spa'],
    currency: [
      'USD', 'PLN', 'MXN', 'NZD', 'BHD', 'AUD', 'QAR', 'JPY', 'BRL', 'EUR', 'GBP', 'EGP', 'KWD'
    ],
  },
  cds: false,
  occBaseUrl: 'OCC_BACKEND_BASE_URL_VALUE',
  b2b: false,
  cdc: false,
  cpq: false,
  digitalPayments: false,
  epdVisualization:  false,
  s4om: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
