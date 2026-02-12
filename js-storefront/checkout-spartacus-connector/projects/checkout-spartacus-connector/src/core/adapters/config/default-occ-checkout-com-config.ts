import { OccConfig, OccEndpoint } from '@spartacus/core';

declare module '@spartacus/core' {
  interface OccEndpoints {
    achOrderSuccess?: string | OccEndpoint;
    achPlaidLinkToken?: string | OccEndpoint;
    applePayPaymentRequest?: string | OccEndpoint;
    applePayPlaceOrder?: string | OccEndpoint;
    applePayRequestSession?: string | OccEndpoint;
    applePaySetDeliveryAddress?: string | OccEndpoint;
    applePaySetDeliveryMethod?: string | OccEndpoint;
    availableApms?: string | OccEndpoint;
    directPlaceOrder?: string | OccEndpoint;
    googlePayMerchantConfig?: string | OccEndpoint;
    googlePayPlaceOrder?: string | OccEndpoint;
    googlePaySetDeliveryInfo?: string | OccEndpoint;
    isABC?: string | OccEndpoint;
    klarnaClientToken?: string | OccEndpoint;
    merchantKey?: string | OccEndpoint;
    placeOrder?: string | OccEndpoint;
    redirectPlaceOrder?: string | OccEndpoint;
    setApmPaymentDetails?: string | OccEndpoint;
    setDeliveryAddress?: string | OccEndpoint;
    setPaymentAddress?: string | OccEndpoint;
    requestBillingAddress?: string | OccEndpoint;
    setPaymentDetails?: string | OccEndpoint;
    updatePaymentDetails?: string | OccEndpoint;
    getCheckoutDetails?: string | OccEndpoint;
    requestIsFlowEnabled?: string | OccEndpoint;
    requestFlowUIConfiguration?: string | OccEndpoint;
    requestFlowPaymentSession?: string | OccEndpoint;
    addresses?: string | OccEndpoint;
    setDeliveryAddressAsBillingAddress?: string | OccEndpoint;
  }
}

export const defaultOccCheckoutComConfig: OccConfig = {
  backend: {
    occ: {
      endpoints: {
        achOrderSuccess: 'users/${userId}/carts/${cartId}/ach/item/public_token/exchange',
        achPlaidLinkToken: 'users/${userId}/carts/${cartId}/ach/link/token/create',
        applePayPaymentRequest: 'users/${userId}/carts/${cartId}/applepay/paymentRequest',
        applePayPlaceOrder: 'users/${userId}/carts/${cartId}/applepay/placeOrder',
        applePayRequestSession: 'users/${userId}/carts/${cartId}/applepay/requestSession',
        applePaySetDeliveryAddress: 'users/${userId}/carts/${cartId}/applepay/deliveryAddress',
        applePaySetDeliveryMethod: 'users/${userId}/carts/${cartId}/applepay/deliveryMethod',
        availableApms: 'users/${userId}/carts/${cartId}/apm/available',
        directPlaceOrder: 'users/${userId}/carts/${cartId}/direct-place-order',
        googlePayMerchantConfig: 'users/${userId}/carts/${cartId}/google/merchant-configuration',
        googlePayPlaceOrder: 'users/${userId}/carts/${cartId}/google/placeOrder',
        googlePaySetDeliveryInfo: 'users/${userId}/carts/${cartId}/google/deliveryInfo',
        isABC: 'merchantKey/isABC',
        klarnaClientToken: 'users/${userId}/carts/${cartId}/klarna/clientToken',
        merchantKey: 'merchantKey',
        placeOrder: 'users/${userId}/orders?fields=FULL',
        redirectPlaceOrder: 'users/${userId}/carts/${cartId}/redirect-place-order?fields=FULL',
        setApmPaymentDetails: 'users/${userId}/carts/${cartId}/checkoutcomapmpaymentdetails',
        createDeliveryAddress: 'users/${userId}/carts/${cartId}/addresses/checkoutcomdeliverypayment',
        setDeliveryAddress: 'users/${userId}/carts/${cartId}/addresses/checkoutcomdeliverypayment',
        setPaymentAddress: 'users/${userId}/carts/${cartId}/checkoutoccbillingaddress',
        requestBillingAddress: 'users/${userId}/carts/${cartId}/checkoutoccbillingaddress',
        setPaymentDetails: 'users/${userId}/carts/${cartId}/checkoutcompaymentdetails',
        updatePaymentDetails: 'users/${userId}/paymentdetails/${paymentDetailsId}',
        getCheckoutDetails:
          'users/${userId}/carts/${cartId}?fields=deliveryAddress(FULL),deliveryMode(FULL),paymentInfo(FULL),checkoutComPaymentInfo(FULL)',
        requestIsFlowEnabled: 'flow/enabled',
        requestFlowUIConfiguration: 'flow/configuration',
        requestFlowPaymentSession: 'users/${userId}/carts/${cartId}/payment-session',
        setDeliveryAddressAsBillingAddress: 'users/${userId}/carts/${cartId}/addresses/setbillingaddressbyid'
      },
    },
  },
};
