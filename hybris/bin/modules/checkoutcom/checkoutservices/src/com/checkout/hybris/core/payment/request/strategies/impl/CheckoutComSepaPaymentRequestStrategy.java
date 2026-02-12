package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.AccountHolder;
import com.checkout.common.Address;
import com.checkout.common.CountryCode;
import com.checkout.common.Currency;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComSepaPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.exception.CheckoutComPaymentIntegrationException;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.instruments.create.CreateInstrumentRequest;
import com.checkout.instruments.create.CreateInstrumentSepaRequest;
import com.checkout.instruments.create.CreateInstrumentSepaResponse;
import com.checkout.instruments.create.InstrumentData;
import com.checkout.payments.PaymentType;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestIdSource;
import de.hybris.platform.core.model.order.CartModel;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.time.Instant;

import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Sepa apm payments
 */
public class CheckoutComSepaPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected static final Logger LOG = LogManager.getLogger(CheckoutComSepaPaymentRequestStrategy.class);

    protected CheckoutComSepaPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return CheckoutComPaymentType.SEPA;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(CartModel cart, String currencyIsoCode, Long amount) {
        if (cart.getPaymentInfo() instanceof CheckoutComSepaPaymentInfoModel) {
            return PaymentRequest.builder().amount(amount).currency(Currency.valueOf(currencyIsoCode)).build();
        }
        throw new IllegalArgumentException(
            String.format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: " +
                "[%s]", cart.getPaymentInfo().getClass(), cart.getCode()));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public PaymentRequest createPaymentRequest(final CartModel cart) {
        validateParameterNotNull(cart, "Cart model cannot be null");

        final String currencyIsoCode = cart.getCurrency().getIsocode();
        final Long amount = checkoutPaymentRequestServicesWrapper.checkoutComCurrencyService.removeDecimalsFromCurrencyAmount(currencyIsoCode, cart.getTotalPrice());

        final CreateInstrumentSepaResponse sourceResponse = createSepaPaymentInstrument(cart);
        validateParameterNotNull(sourceResponse, "Checkout.com SourceResponse from set up payment source cannot be null");
        validateParameterNotNull(sourceResponse.getId(), "Checkout.com SourceResponse Id from set up payment source response cannot be null");

        final PaymentRequest paymentRequest = getRequestSourcePaymentRequest(cart, currencyIsoCode, amount);
        paymentRequest.setSource(RequestIdSource.builder().id(sourceResponse.getId()).build());

        populatePaymentRequest(cart, paymentRequest);
        createCustomerRequestFromSource(sourceResponse).ifPresent(paymentRequest::setCustomer);

        return paymentRequest;
    }

    protected CreateInstrumentSepaResponse createSepaPaymentInstrument(final CartModel cart) {
        CreateInstrumentSepaResponse sourceResponse = null;
        if (cart.getPaymentInfo() instanceof CheckoutComSepaPaymentInfoModel sepaPaymentInfo) {
            try {
                sourceResponse = checkoutPaymentRequestServicesWrapper.checkoutComPaymentIntegrationService
                    .setUpSepaPaymentSource(createSourceRequest(cart, sepaPaymentInfo));
            } catch (final CheckoutComPaymentIntegrationException e) {
                LOG.error("Error setting the payment source with checkout.com endpoint for sepa payment and cart [{}]", cart.getCode());
            }
        } else {
            throw new IllegalArgumentException("The payment info doesn't match the CheckoutComSepaPaymentInfoModel for cart number " + cart.getCode());
        }
        return sourceResponse;
    }

    /**
     * Creates the source request for the set-up payment source request to checkout.com
     *
     * @param cart            the cart model
     * @param sepaPaymentInfo the payment info for SEPA
     * @return {@link CreateInstrumentRequest} the populated CreateInstrumentRequest
     */
    protected CreateInstrumentSepaRequest createSourceRequest(final CartModel cart, final CheckoutComSepaPaymentInfoModel sepaPaymentInfo) {
        final AccountHolder accountHolder = AccountHolder.builder()
            .billingAddress(createAddress(sepaPaymentInfo))
            .firstName(sepaPaymentInfo.getFirstName())
            .lastName(sepaPaymentInfo.getLastName())
            .build();
        final InstrumentData instrumentData = InstrumentData.builder()
            .accoountNumber(sepaPaymentInfo.getAccountIban())
            .mandateId(cart.getCheckoutComPaymentReference())
            .paymentType(PaymentType.valueOf(sepaPaymentInfo.getPaymentType().getCode()))
            .country(CountryCode.valueOf(sepaPaymentInfo.getCountry()))
            .currency(Currency.valueOf(cart.getCurrency().getIsocode()))
            .dateOfSignature(Instant.now())
            .build();

        return CreateInstrumentSepaRequest.builder()
            .accountHolder(accountHolder)
            .instrumentData(instrumentData)
            .build();
    }

    /**
     * Populates the SEPA address for the request
     *
     * @param sepaPaymentInfo the sepa payment info
     * @return the populated request address
     */
    protected Address createAddress(final CheckoutComSepaPaymentInfoModel sepaPaymentInfo) {
        final Address address = new Address();
        address.setAddressLine1(sepaPaymentInfo.getAddressLine1());
        address.setCity(sepaPaymentInfo.getCity());
        address.setCountry(CountryCode.valueOf(sepaPaymentInfo.getCountry()));
        address.setZip(sepaPaymentInfo.getPostalCode());
        return address;
    }
}
