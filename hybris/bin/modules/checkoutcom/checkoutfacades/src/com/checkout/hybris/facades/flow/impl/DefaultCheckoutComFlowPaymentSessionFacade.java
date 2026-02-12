package com.checkout.hybris.facades.flow.impl;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.core.flow.CheckoutComFlowPaymentSessionService;
import com.checkout.hybris.facades.flow.CheckoutComFlowConfigurationFacade;
import com.checkout.hybris.facades.flow.CheckoutComFlowPaymentSessionFacade;
import de.hybris.platform.servicelayer.dto.converter.Converter;

import java.util.Optional;

public class DefaultCheckoutComFlowPaymentSessionFacade implements CheckoutComFlowPaymentSessionFacade {

    private final CheckoutComFlowPaymentSessionService checkoutComFlowPaymentSessionService;
    private final CheckoutComFlowConfigurationFacade checkoutComFlowConfigurationFacade;
    private final Converter<PaymentSessionResponse, CheckoutComPaymentSessionResponseDTO> paymentSessionResponseConverter;

    public DefaultCheckoutComFlowPaymentSessionFacade(CheckoutComFlowPaymentSessionService checkoutComFlowPaymentSessionService, CheckoutComFlowConfigurationFacade checkoutComFlowConfigurationFacade, Converter<PaymentSessionResponse, CheckoutComPaymentSessionResponseDTO> paymentSessionResponseConverter) {
        this.checkoutComFlowPaymentSessionService = checkoutComFlowPaymentSessionService;
        this.checkoutComFlowConfigurationFacade = checkoutComFlowConfigurationFacade;
        this.paymentSessionResponseConverter = paymentSessionResponseConverter;
    }

    @Override
    public CheckoutComPaymentSessionResponseDTO createPaymentSession(final String baseSiteId) {
        if (checkoutComFlowConfigurationFacade.isFlowEnabled(baseSiteId)) {
            return Optional.ofNullable(checkoutComFlowPaymentSessionService.createPaymentSession())
                .map(paymentSessionResponseConverter::convert)
                .orElse(null);
        }
        return null;
    }

    @Override
    public CheckoutComPaymentSessionResponseDTO createPaymentSession() {
        if (checkoutComFlowConfigurationFacade.isFlowEnabled()) {
            return Optional.ofNullable(checkoutComFlowPaymentSessionService.createPaymentSession())
                .map(paymentSessionResponseConverter::convert)
                .orElse(null);
        }
        return null;
    }
}
