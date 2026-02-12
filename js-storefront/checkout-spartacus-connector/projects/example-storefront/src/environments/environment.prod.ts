// eslint-disable-next-line @typescript-eslint/typedef
export const environment = {
  production: true,
  enableStoreDevTools: false,
  context: {
    baseSite: ['electronics-spa'],
    currency: [
      'USD', 'PLN', 'MXN', 'NZD', 'BHD', 'AUD', 'QAR', 'JPY', 'BRL', 'EUR', 'GBP', 'EGP', 'KWD'
    ],
  },
  cds: buildProcess?.env?.CX_CDS ?? false,
  b2b: buildProcess?.env?.CX_B2B ?? false,
  cdc: buildProcess?.env?.CX_CDC ?? false,
  cpq: buildProcess?.env?.CX_CPQ ?? false,
  digitalPayments: buildProcess?.env?.CX_DIGITAL_PAYMENTS ?? false,
  epdVisualization: buildProcess?.env?.CX_EPD_VISUALIZATION ?? false,
  s4om: buildProcess?.env?.CX_S4OM ?? false,
};
