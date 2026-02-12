package com.checkout.hybris.facades.flow;

import com.checkout.payments.response.GetPaymentResponse;

/**
 * Handles payment info facade logic
 */
public interface CheckoutComFlowPaymentInfoFacade {

    /**
     * Adds the payment info to the current cart
     *
     * @param paymentResponse the payment info
     */
    void addPaymentInfoToCart(GetPaymentResponse paymentResponse);

}
