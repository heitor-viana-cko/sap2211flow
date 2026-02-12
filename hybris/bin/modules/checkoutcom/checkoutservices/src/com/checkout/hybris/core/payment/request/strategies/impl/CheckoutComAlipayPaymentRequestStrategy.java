package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestAlipayPlusSource;
import de.hybris.platform.core.model.order.CartModel;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.ALIPAY;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Alipay apm payments
 */
public class CheckoutComAlipayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected CheckoutComAlipayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart, final String currencyIsoCode, final Long amount) {
        final RequestAlipayPlusSource requestAlipayPlusSource = RequestAlipayPlusSource.requestAlipayPlusCNSource();
        return PaymentRequest.builder().source(requestAlipayPlusSource).build();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return ALIPAY;
    }
}
