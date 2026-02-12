package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Address;
import com.checkout.common.CountryCode;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.merchantconfiguration.BillingDescriptor;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.instruments.create.CreateInstrumentResponse;
import com.checkout.payments.PaymentType;
import com.checkout.payments.RiskRequest;
import com.checkout.payments.ShippingDetails;
import com.checkout.payments.ThreeDSRequest;
import com.checkout.payments.request.PaymentCustomerRequest;
import com.checkout.payments.request.PaymentRequest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import org.apache.commons.lang.StringUtils;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;
import static java.util.Optional.empty;

/**
 * Abstract strategy to implement the common request population logic
 */
public abstract class CheckoutComAbstractPaymentRequestStrategy implements CheckoutComPaymentRequestStrategy {
    protected static final String SITE_ID_KEY = "site_id";
    protected static final String UDF1_KEY = "udf1";

   protected CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy;
   protected CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper;
   protected CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter;
   protected CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper;
   protected CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;

    protected CheckoutComAbstractPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
                                                        final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper,
                                                        final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter,
                                                        final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper,
                                                        final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        // default empty constructor
        this.checkoutComPhoneNumberStrategy = checkoutComPhoneNumberStrategy;
        this.checkoutComPaymentRequestStrategyMapper = checkoutComPaymentRequestStrategyMapper;
        this.checkoutComCartModelToPaymentL2AndL3Converter = checkoutComCartModelToPaymentL2AndL3Converter;
        this.checkoutPaymentRequestServicesWrapper = checkoutPaymentRequestServicesWrapper;
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
    }

    protected CheckoutComAbstractPaymentRequestStrategy() {
    }

    /**
     * Add the strategy to the factory map of strategies
     */
    @PostConstruct
    protected void registerStrategy() {
        checkoutComPaymentRequestStrategyMapper.addStrategy(getStrategyKey(), this);
    }

    /**
     * Returns the key of the strategy used to register the strategy
     *
     * @return the key the strategy will be registered as
     */
    protected abstract CheckoutComPaymentType getStrategyKey();

    /**
     * {@inheritDoc}
     */
    @Override
    public PaymentRequest createPaymentRequest(final CartModel cart) {
        validateParameterNotNull(cart, "Cart model cannot be null");

        final String currencyIsoCode = cart.getCurrency().getIsocode();
        final Long amount = checkoutPaymentRequestServicesWrapper.checkoutComCurrencyService.
            removeDecimalsFromCurrencyAmount(currencyIsoCode, cart.getTotalPrice());

        final PaymentRequest request = getRequestSourcePaymentRequest(cart, currencyIsoCode, amount);

        populatePaymentRequest(cart, request);

        return request;
    }

    /**
     * Populates the created request with all required information
     *
     * @param cart    the cart
     * @param request the request
     */
    protected void populatePaymentRequest(final CartModel cart, final PaymentRequest request) {
        request.setReference(cart.getCheckoutComPaymentReference());
        request.setPaymentType(PaymentType.REGULAR);
        request.setCustomer(getCustomerRequest((CustomerModel) cart.getUser()));
        request.setRisk(RiskRequest.builder().build());
        request.setShipping(createShippingDetails(cart.getDeliveryAddress()));
        createThreeDSRequest().ifPresent(request::setThreeDS);
        isCapture().ifPresent(request::setCapture);
        Optional.ofNullable(checkoutComMerchantConfigurationService.getProcessingChannelId()).ifPresent(request::setProcessingChannelId);
        populateRedirectUrls(request);
        populateRequestMetadata(request);
        populateDynamicBillingDescriptor(request);
        checkoutComCartModelToPaymentL2AndL3Converter.convert(cart, request);
    }


    /**
     * Populates the request's billing descriptor values based on the merchant configuration
     *
     * @param request the payment request
     */
    protected void populateDynamicBillingDescriptor(final PaymentRequest request) {
        final BillingDescriptor billingDescriptorMerchantConfiguration =
            checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.getBillingDescriptor();
        final Boolean includeBillingDescriptor = billingDescriptorMerchantConfiguration.getIncludeBillingDescriptor();
        if (Boolean.TRUE.equals(includeBillingDescriptor)) {
            final com.checkout.payments.BillingDescriptor billingDescriptor =
                    new com.checkout.payments.BillingDescriptor();
            billingDescriptor.setName(billingDescriptorMerchantConfiguration.getBillingDescriptorName());
            billingDescriptor.setCity(billingDescriptorMerchantConfiguration.getBillingDescriptorCity());
            request.setBillingDescriptor(billingDescriptor);
        }
    }

    /**
     * The optional empty value is by default, and checkout.com will take that as true.
     *
     * @return true if the payment is capture, false otherwise. By default optional empty.
     */
    protected Optional<Boolean> isCapture() {
        return empty();
    }

    /**
     * Populates failure and success urls
     *
     * @param request the request to populate
     */
    protected void populateRedirectUrls(final PaymentRequest request) {
        request.setSuccessUrl(checkoutPaymentRequestServicesWrapper.checkoutComUrlService
            .getFullUrl(checkoutPaymentRequestServicesWrapper.cmsSiteService
            .getCurrentSite().getCheckoutComSuccessRedirectUrl(), true));
        request.setFailureUrl(checkoutPaymentRequestServicesWrapper.checkoutComUrlService
            .getFullUrl(checkoutPaymentRequestServicesWrapper.cmsSiteService
            .getCurrentSite().getCheckoutComFailureRedirectUrl(), true));
    }

    /**
     * Creates the PaymentRequest object based on token request or id request
     *
     * @param cart            the payment info
     * @param currencyIsoCode the currency code
     * @param amount          the order amount
     * @return the payment request object
     */
    protected abstract PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                                                    final String currencyIsoCode,
                                                                                    final Long amount);

    /**
     * Creates a generic metadata for each request
     *
     * @return the metadata map
     */
    protected Map<String, Object> createGenericMetadata() {
        final Map<String, Object> metadataMap = new HashMap<>();
        metadataMap.put(SITE_ID_KEY, checkoutPaymentRequestServicesWrapper.cmsSiteService.getCurrentSite().getUid());
        return metadataMap;
    }

    /**
     * Create the shipping details for the request
     *
     * @param deliveryAddress the address model
     * @return ShippingDetails the request object
     */
    protected ShippingDetails createShippingDetails(final AddressModel deliveryAddress) {
        final ShippingDetails shippingDetails = new ShippingDetails();
        if (deliveryAddress != null) {
            final Address address = createAddress(deliveryAddress);
            shippingDetails.setPhone(checkoutComPhoneNumberStrategy.createPhone(deliveryAddress).orElse(null));
            shippingDetails.setAddress(address);
        }
        return shippingDetails;
    }

    /**
     * Populates the address for the request
     *
     * @param addressModel the address source
     * @return the populated request address
     */
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

    /**
     * Creates the customer request
     *
     * @param customer session cart customer model
     * @return CustomerRequest the request object
     */
    protected PaymentCustomerRequest getCustomerRequest(final CustomerModel customer) {
        final PaymentCustomerRequest customerRequest = new PaymentCustomerRequest();
        customerRequest.setEmail(customer.getContactEmail());
        customerRequest.setName(customer.getDisplayName());
        return customerRequest;
    }

    /**
     * Creates the 3dsecure info object for the request. By default it's empty
     *
     * @return ThreeDSRequest the request object
     */
    protected Optional<ThreeDSRequest> createThreeDSRequest() {
        return empty();
    }

    /**
     * Populates the metadata in the request object.
     *
     * @param request the request payload
     */
    protected void populateRequestMetadata(final PaymentRequest request) {
        request.setMetadata(createGenericMetadata());
    }

    /**
     * Creates the customer request using the source response id from checkout.com
     *
     * @param paymentResponse the setup source response form checkout.com
     * @return CustomerRequest the request object
     */
    protected Optional<PaymentCustomerRequest> createCustomerRequestFromSource(final CreateInstrumentResponse paymentResponse) {
        if (paymentResponse.getCustomer() != null && StringUtils.isNotBlank(paymentResponse.getCustomer().getId())) {
            final PaymentCustomerRequest customerRequest = new PaymentCustomerRequest();
            customerRequest.setId(paymentResponse.getCustomer().getId());
            return Optional.of(customerRequest);
        }
        return Optional.empty();
    }
}
