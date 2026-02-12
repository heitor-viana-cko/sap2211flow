package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Currency;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.apm.services.CheckoutComAPMConfigurationService;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComAPMConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComFawryConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComFawryPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestFawrySource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.CustomerModel;

import java.util.List;
import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.FAWRY;
import static com.google.common.base.Preconditions.checkArgument;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Fawry apm payments
 */
@SuppressWarnings("java:S107")
public class CheckoutComFawryPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected final CheckoutComAPMConfigurationService checkoutComAPMConfigurationService;

    protected CheckoutComFawryPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService, final CheckoutComAPMConfigurationService checkoutComAPMConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
        this.checkoutComAPMConfigurationService = checkoutComAPMConfigurationService;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return FAWRY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode, final Long amount) {
        final CustomerModel customer = (CustomerModel) cart.getUser();
        RequestFawrySource requestFawrySource = new RequestFawrySource();
        requestFawrySource.setCustomerEmail(customer.getContactEmail());
        requestFawrySource.setCustomerMobile(((CheckoutComFawryPaymentInfoModel) cart.getPaymentInfo()).getMobileNumber());
        requestFawrySource.setDescription(checkoutPaymentRequestServicesWrapper.cmsSiteService.getCurrentSite().getName());
        requestFawrySource.setProducts(populateProductsField(amount));

        return PaymentRequest.builder().source(requestFawrySource).currency(Currency.valueOf(currencyIsoCode)).amount(amount).build();
    }

    protected List<RequestFawrySource.Product> populateProductsField(final Long amount) {
        final Optional<CheckoutComAPMConfigurationModel> optionalFawryConfiguration =
                checkoutComAPMConfigurationService.getApmConfigurationByCode(
                        FAWRY.name());
        checkArgument(optionalFawryConfiguration.isPresent(), "Fawry configuration cannot be null");

        final CheckoutComFawryConfigurationModel fawryConfiguration =
                (CheckoutComFawryConfigurationModel) optionalFawryConfiguration.get();

        final RequestFawrySource.Product product = RequestFawrySource.Product.builder()
                .id(fawryConfiguration.getProductId())
                .description(fawryConfiguration.getProductDescription())
                .quantity(1L)
                .price(amount)
                .build();

        return List.of(product);
    }
}
