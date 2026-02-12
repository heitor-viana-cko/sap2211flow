package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.response.mappers.CheckoutComPaymentResponseStrategyMapper;
import com.checkout.hybris.core.payment.response.strategies.CheckoutComPaymentResponseStrategy;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;

/**
 * Specific {@link CheckoutComPaymentResponseStrategy} implementation for Fawry apm payment responses
 */
public class CheckoutComFawryPaymentResponseStrategy extends CheckoutComAbstractPaymentResponseStrategy {

    protected final CheckoutComPaymentInfoService paymentInfoService;

    public CheckoutComFawryPaymentResponseStrategy(final CheckoutComPaymentResponseStrategyMapper checkoutComPaymentResponseStrategyMapper,
                                                   final CheckoutComPaymentInfoService paymentInfoService) {
        super(checkoutComPaymentResponseStrategyMapper);
        this.paymentInfoService = paymentInfoService;
    }

    @Override
    protected CheckoutComPaymentType getStrategyKey() {
        return CheckoutComPaymentType.FAWRY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AuthorizeResponse handlePendingPaymentResponse(final PaymentResponse paymentResponse, final PaymentInfoModel paymentInfo) {
        throw new UnsupportedOperationException("Fawry is not supported.");
    }
}
