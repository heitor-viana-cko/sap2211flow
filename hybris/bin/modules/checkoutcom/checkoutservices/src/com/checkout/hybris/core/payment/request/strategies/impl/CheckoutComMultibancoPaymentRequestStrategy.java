package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.CountryCode;
import com.checkout.common.Currency;
import com.checkout.hybris.core.address.services.CheckoutComAddressService;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestMultiBancoSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.apache.commons.lang.StringUtils;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.MULTIBANCO;
import static com.google.common.base.Preconditions.checkArgument;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Multibanco apm payments
 */
public class CheckoutComMultibancoPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected final CheckoutComAddressService addressService;

    protected CheckoutComMultibancoPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService, final CheckoutComAddressService addressService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
        this.addressService = addressService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return MULTIBANCO;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {
        final AddressModel billingAddress = cart.getPaymentInfo().getBillingAddress();

        validateParameterNotNull(billingAddress, "Billing address model cannot be null");
        validateParameterNotNull(billingAddress.getCountry(), "Billing address country cannot be null");

        final String countryIsoCode = billingAddress.getCountry().getIsocode();
        checkArgument(StringUtils.isNotEmpty(countryIsoCode), "Billing address country code cannot be null");

        return PaymentRequest.builder()
            .source(
                RequestMultiBancoSource.builder()
                    .paymentCountry(CountryCode.valueOf(countryIsoCode))
                    .accountHolderName(addressService.getCustomerFullNameFromAddress(billingAddress))
                    .build()
            )
            .amount(amount)
            .currency(Currency.valueOf(currencyIsoCode))
            .build();
    }
}
