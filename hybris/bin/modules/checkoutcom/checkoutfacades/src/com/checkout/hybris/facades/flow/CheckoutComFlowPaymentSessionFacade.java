package com.checkout.hybris.facades.flow;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;

/**
 * Facade for handling payment session creation for Checkout.com Flow
 */
public interface CheckoutComFlowPaymentSessionFacade {

    /**
     * Creates a payment session for the given base site id
     *
     * @param baseSiteId the base site identifier
     * @return PaymentSessionResponse
     */
    CheckoutComPaymentSessionResponseDTO createPaymentSession(String baseSiteId);

    /**
     * Creates a payment session for the current base site
     *
     * @return PaymentSessionResponse
     */
    CheckoutComPaymentSessionResponseDTO createPaymentSession();
}
