package com.checkout.hybris.core.payment.details.strategies;


import com.checkout.payments.response.GetPaymentResponse;

/**
 * Processes the checkout.com payment detail response
 */
public interface CheckoutComUpdatePaymentInfoStrategy {

    /**
     * Processes the payment details response from checkout.com to store required data for the given
     * payment method
     *
     * @param paymentResponse the checkout.com payment response
     */
    void processPaymentResponse(GetPaymentResponse paymentResponse);
}
