package com.checkout.hybris.core.flow;

import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;

public interface CheckoutComFlowPaymentSessionService {
    PaymentSessionResponse createPaymentSession();
}
