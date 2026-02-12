export const generateOneApplePayPaymentRequest = () => ({
  currencyCode: 'USD',
  countryCode: 'US',
  supportedNetworks: ['visa', 'masterCard'],
  merchantCapabilities: ['supports3DS'],
  total: {
    label: 'Total',
    amount: '10.00'
  },
  requiredBillingContactFields: ['postalAddress'],
  requiredShippingContactFields: ['postalAddress']
});