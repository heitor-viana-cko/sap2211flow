package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Currency;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;

import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestBenefitSource;
import de.hybris.platform.core.model.order.CartModel;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.BENEFITPAY;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for BenefitPay apm payments
 */
public class CheckoutComBenefitPayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected CheckoutComBenefitPayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return BENEFITPAY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {
        RequestBenefitSource requestBenefitSource = new RequestBenefitSource();
        return PaymentRequest.builder()
                .source(requestBenefitSource)
                .currency(Currency.valueOf(currencyIsoCode))
                .amount(amount)
                .build();
    }
}
