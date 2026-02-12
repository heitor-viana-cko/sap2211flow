package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.oxxo.service.CheckoutComOxxoPaymentRequestService;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import de.hybris.platform.core.model.order.CartModel;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.OXXO;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Oxxo apm payments
 */
public class CheckoutComOxxoPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected final CheckoutComOxxoPaymentRequestService checkoutComOxxoPaymentRequestService;

    protected CheckoutComOxxoPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService, final CheckoutComOxxoPaymentRequestService checkoutComOxxoPaymentRequestService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
        this.checkoutComOxxoPaymentRequestService = checkoutComOxxoPaymentRequestService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return OXXO;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart, final String currencyIsoCode, final Long amount) {
        throw new UnsupportedOperationException("OXXO payment is not supported");
    }
}
