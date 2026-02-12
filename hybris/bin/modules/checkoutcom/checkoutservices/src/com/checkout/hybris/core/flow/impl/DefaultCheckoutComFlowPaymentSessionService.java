package com.checkout.hybris.core.flow.impl;

import com.checkout.common.CountryCode;
import com.checkout.common.Currency;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.requests.Address;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.requests.Billing;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.requests.PaymentSessionRequest;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.flow.CheckoutComFlowPaymentSessionService;
import com.checkout.hybris.core.flow.exception.CheckoutComPaymentSessionException;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.services.CheckoutComApiService;
import com.checkout.hybris.core.url.services.CheckoutComUrlService;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.order.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutionException;

public class DefaultCheckoutComFlowPaymentSessionService implements CheckoutComFlowPaymentSessionService {

    private static final Logger LOG = LoggerFactory.getLogger(DefaultCheckoutComFlowPaymentSessionService.class);

    private final CartService cartService;
    private final CheckoutComCurrencyService checkoutComCurrencyService;
    private final CheckoutComUrlService checkoutComUrlService;
    private final CMSSiteService cmsSiteService;
    private final CheckoutComApiService checkoutComApiService;
    private final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;

    public DefaultCheckoutComFlowPaymentSessionService(final CartService cartService,
                                                       final CheckoutComCurrencyService checkoutComCurrencyService,
                                                       final CheckoutComUrlService checkoutComUrlService,
                                                       final CMSSiteService cmsSiteService,
                                                       final CheckoutComApiService checkoutComApiService,
                                                       final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        this.cartService = cartService;
        this.checkoutComCurrencyService = checkoutComCurrencyService;
        this.checkoutComUrlService = checkoutComUrlService;
        this.cmsSiteService = cmsSiteService;
        this.checkoutComApiService = checkoutComApiService;
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
    }

    @Override
    public PaymentSessionResponse createPaymentSession() {
        if (cartService.hasSessionCart()) {
            final CartModel currentCart = cartService.getSessionCart();
            final PaymentSessionRequest paymentSessionRequest = buildPaymentSessionRequest(currentCart);
            try {
                return checkoutComApiService.createCheckoutApi().flowClient().requestPaymentSession(paymentSessionRequest).get();
            } catch (final InterruptedException e) {
                LOG.error("InterruptedException while requestion payment session for cart code [{}]", currentCart.getCode());
                Thread.currentThread().interrupt();
                throw new CheckoutComPaymentSessionException("Error obtaining payment session", e);

            } catch (final ExecutionException e) {
                LOG.error("ExecutionException while requestion payment session for cart code [{}]", currentCart.getCode());
                throw new CheckoutComPaymentSessionException("Error obtaining payment session", e);
            }
        }
        return null;
    }

    protected PaymentSessionRequest buildPaymentSessionRequest(final CartModel cartModel) {
        final String currencyIsoCode = cartModel.getCurrency().getIsocode();

        return PaymentSessionRequest.builder()
            .amount(checkoutComCurrencyService.removeDecimalsFromCurrencyAmount(currencyIsoCode, cartModel.getTotalPrice()))
            .currency(Currency.valueOf(currencyIsoCode))
            .processingChannelId(checkoutComMerchantConfigurationService.getProcessingChannelId())
            .billing(createBillingAddress(cartModel.getPaymentAddress()))
            .successUrl(checkoutComUrlService.getFullUrl(cmsSiteService.getCurrentSite().getCheckoutComSuccessRedirectUrl(), true))
            .failureUrl(checkoutComUrlService.getFullUrl(cmsSiteService.getCurrentSite().getCheckoutComFailureRedirectUrl(), true))
            .reference(cartModel.getCheckoutComPaymentReference())
            .build();
    }

    protected Billing createBillingAddress(final AddressModel paymentAddress) {
        final Billing billing = new Billing();
        billing.setAddress(createAddress(paymentAddress));
        return billing;
    }

    protected Address createAddress(final AddressModel addressModel) {
        final Address address = new Address();
        address.setAddressLine1(addressModel.getLine1());
        address.setAddressLine2(addressModel.getLine2());
        address.setCity(addressModel.getTown());
        address.setCountry(addressModel.getCountry() != null ? CountryCode.valueOf(addressModel.getCountry().getIsocode()) : null);
        address.setState(addressModel.getRegion() != null ? addressModel.getRegion().getName() : null);
        address.setZip(addressModel.getPostalcode());
        return address;
    }
}
