package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Currency;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestQPaySource;
import de.hybris.platform.basecommerce.model.site.BaseSiteModel;
import de.hybris.platform.core.model.order.CartModel;
import org.apache.commons.lang.StringUtils;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.QPAY;
import static com.google.common.base.Preconditions.checkArgument;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for QPay apm payments
 */
public class CheckoutComQPayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {


    protected CheckoutComQPayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return QPAY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {

        final BaseSiteModel site = cart.getSite();
        validateParameterNotNull(site, "Site related to the cart cannot be null");
        validateParameterNotNull(site.getCheckoutComMerchantConfiguration(), "Site merchant configuration cannot be null");
        checkArgument(StringUtils.isNotEmpty(site.getCheckoutComMerchantConfiguration().getCode()), "Site merchant configuration code cannot be null");

        final RequestQPaySource requestQPaySource = RequestQPaySource.builder().description(site.getCheckoutComMerchantConfiguration().getCode()).build();
        return PaymentRequest.builder().source(requestQPaySource).currency(Currency.valueOf(currencyIsoCode)).amount(amount).build();
    }
}
