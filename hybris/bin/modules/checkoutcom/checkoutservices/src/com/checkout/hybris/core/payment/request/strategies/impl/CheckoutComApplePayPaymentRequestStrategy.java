package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Currency;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComApplePayPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestTokenSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;

import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.APPLEPAY;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for ApplePay payments
 */
public class CheckoutComApplePayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {


    protected CheckoutComApplePayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return APPLEPAY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart, final String currencyIsoCode, final Long amount) {
        final PaymentInfoModel paymentInfo = cart.getPaymentInfo();
        if (paymentInfo instanceof CheckoutComApplePayPaymentInfoModel) {
            return createTokenSourcePaymentRequest((CheckoutComApplePayPaymentInfoModel) paymentInfo, currencyIsoCode, amount, cart.getPaymentAddress());
        } else {
            throw new IllegalArgumentException(format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]", paymentInfo.getClass(), cart.getCode()));
        }
    }

    /**
     * Creates Payment request of type Token source
     *
     * @param paymentInfo     from the cart
     * @param currencyIsoCode currency
     * @param amount          amount
     * @param billingAddress  to set in the request
     * @return paymentRequest to send to Checkout.com
     */
    protected PaymentRequest createTokenSourcePaymentRequest(final CheckoutComApplePayPaymentInfoModel paymentInfo, final String currencyIsoCode, final Long amount, final AddressModel billingAddress) {
        return PaymentRequest.builder()
            .amount(amount)
            .currency(Currency.valueOf(currencyIsoCode))
            .source(
                RequestTokenSource.builder()
                    .token(paymentInfo.getToken())
                    .billingAddress(billingAddress != null ? createAddress(billingAddress) : null)
                    .build()
            ).build();
    }

    /**
     * ApplePay is like card payments. Capture or auto-capture depends on the merchant configuration
     *
     * @return true is we auto-capture, false otherwise
     */
    @Override
    protected Optional<Boolean> isCapture() {
        return Optional.of(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.isAutoCapture());
    }
}
