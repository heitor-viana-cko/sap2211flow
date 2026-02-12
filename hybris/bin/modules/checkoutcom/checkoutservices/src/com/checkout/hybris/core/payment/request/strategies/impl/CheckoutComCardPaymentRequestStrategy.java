package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.common.Currency;
import com.checkout.payments.ThreeDSRequest;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestIdSource;
import com.checkout.payments.request.source.RequestTokenSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;

import java.util.Optional;

import static com.checkout.hybris.core.enums.PaymentActionType.AUTHORIZE_AND_CAPTURE;
import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.CARD;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for card payments
 */
public class CheckoutComCardPaymentRequestStrategy extends CheckoutComAbstractPaymentRequestStrategy implements CheckoutComPaymentRequestStrategy {

    protected CheckoutComCardPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return CARD;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected Optional<Boolean> isCapture() {
        return Optional.of(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService
            .getPaymentAction().equals(AUTHORIZE_AND_CAPTURE));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {
        final PaymentInfoModel paymentInfo = cart.getPaymentInfo();
        if (paymentInfo instanceof CheckoutComCreditCardPaymentInfoModel checkoutComCreditCardPaymentInfo) {

            if (paymentInfo.isSaved() && checkoutComCreditCardPaymentInfo.getSubscriptionId() != null) {
                return createIdSourcePaymentRequest(checkoutComCreditCardPaymentInfo, currencyIsoCode, amount);
            } else {
                return createTokenSourcePaymentRequest(checkoutComCreditCardPaymentInfo, currencyIsoCode, amount, cart.getPaymentAddress());
            }
        } else {
            throw new IllegalArgumentException(format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]", paymentInfo.getClass(), cart.getCode()));
        }
    }

    /**
     * Creates Payment request of type IdSource
     *
     * @param paymentInfo     from the cart
     * @param currencyIsoCode currency
     * @param amount          amount
     * @return paymentRequest to send to Checkout.com
     */
    protected PaymentRequest createIdSourcePaymentRequest(final CheckoutComCreditCardPaymentInfoModel paymentInfo, final String currencyIsoCode, final Long amount) {
        final RequestIdSource requestIdSource = RequestIdSource.builder()
            .id(paymentInfo.getSubscriptionId())
            .build();
        return PaymentRequest.builder()
            .source(requestIdSource)
            .currency(Currency.valueOf(currencyIsoCode))
            .amount(amount)
            .build();
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
    protected PaymentRequest createTokenSourcePaymentRequest(final CheckoutComCreditCardPaymentInfoModel paymentInfo, final String currencyIsoCode, final Long amount, final AddressModel billingAddress) {
        final RequestTokenSource requestTokenSource = RequestTokenSource.builder()
            .billingAddress(billingAddress != null ? createAddress(billingAddress) : null)
            .token(paymentInfo.getCardToken()).build();
        return PaymentRequest.builder()
            .source(requestTokenSource)
            .currency(Currency.valueOf(currencyIsoCode))
            .amount(amount)
            .build();
    }

    /**
     * Create the 3dsecure info object for the request.
     *
     * @return ThreeDSRequest the request object
     */
    @Override
    protected Optional<ThreeDSRequest> createThreeDSRequest() {
        return Optional.of(ThreeDSRequest.builder()
            .enabled(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.isThreeDSEnabled())
            .attemptN3D(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.isAttemptNoThreeDSecure())
            .build()
        );
    }
}
