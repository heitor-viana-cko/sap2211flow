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
import com.checkout.payments.request.source.apm.RequestP24Source;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import org.apache.commons.lang.StringUtils;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.P24;
import static com.google.common.base.Preconditions.checkArgument;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for P24 apm payments
 */
@SuppressWarnings("java:S107")
public class CheckoutComPTwentyFourPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected final CheckoutComAddressService addressService;

    protected CheckoutComPTwentyFourPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService, final CheckoutComAddressService addressService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
        this.addressService = addressService;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return P24;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {
        final PaymentInfoModel paymentInfo = cart.getPaymentInfo();
        final AddressModel billingAddress = paymentInfo.getBillingAddress();

        validateParameterNotNull(billingAddress, "Billing address model cannot be null");
        validateParameterNotNull(billingAddress.getCountry(), "Billing address country cannot be null");

        final String countryIsoCode = billingAddress.getCountry().getIsocode();
        checkArgument(StringUtils.isNotEmpty(countryIsoCode), "Billing address country code cannot be null");
        final CustomerModel customer = (CustomerModel) cart.getUser();
        validateParameterNotNull(customer, "Customer model cannot be null");
        checkArgument(StringUtils.isNotEmpty(customer.getContactEmail()), "Customer email cannot be null");

        final RequestP24Source requestP24Source = RequestP24Source.builder()
                .paymentCountry(CountryCode.valueOf(countryIsoCode))
                .accountHolderEmail(customer.getContactEmail())
                .accountHolderName(addressService.getCustomerFullNameFromAddress(billingAddress))
                .build();
        final PaymentRequest paymentRequest = PaymentRequest.builder()
                .currency(Currency.valueOf(currencyIsoCode)).amount(amount).source(requestP24Source).build();

        validateParameterNotNull(customer, "Customer model cannot be null");
        checkArgument(StringUtils.isNotEmpty(customer.getContactEmail()), "Customer email cannot be null");

        return paymentRequest;
    }
}
