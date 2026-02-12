package com.checkout.hybris.occ.controllers;

import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.hybris.facades.address.CheckoutComAddressFacade;
import com.checkout.hybris.facades.payment.CheckoutComPaymentInfoFacade;
import com.checkout.hybris.occ.converters.CheckoutComPaymentDetailsDTOReverseConverter;
import com.checkout.hybris.occ.exceptions.NoCheckoutCartException;
import de.hybris.platform.commercefacades.order.CartFacade;
import de.hybris.platform.commercefacades.order.CheckoutFacade;
import de.hybris.platform.commercefacades.order.data.CCPaymentInfoData;
import de.hybris.platform.commercefacades.order.data.CartData;
import de.hybris.platform.commercefacades.user.UserFacade;
import de.hybris.platform.commercefacades.user.data.AddressData;
import de.hybris.platform.commerceservices.strategies.CheckoutCustomerStrategy;
import de.hybris.platform.commercewebservicescommons.annotation.SiteChannelRestriction;
import de.hybris.platform.commercewebservicescommons.dto.order.PaymentDetailsWsDTO;
import de.hybris.platform.commercewebservicescommons.dto.user.AddressWsDTO;
import de.hybris.platform.commercewebservicescommons.errors.exceptions.CartAddressException;
import de.hybris.platform.util.Sanitizer;
import de.hybris.platform.webservicescommons.cache.CacheControl;
import de.hybris.platform.webservicescommons.cache.CacheControlDirective;
import de.hybris.platform.webservicescommons.errors.exceptions.WebserviceValidationException;
import de.hybris.platform.webservicescommons.mapping.DataMapper;
import de.hybris.platform.webservicescommons.mapping.FieldSetLevelHelper;
import de.hybris.platform.webservicescommons.swagger.ApiBaseSiteIdUserIdAndCartIdParam;
import de.hybris.platform.webservicescommons.swagger.ApiFieldsParam;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping(value = "/{baseSiteId}/users/{userId}/carts")
@CacheControl(directive = CacheControlDirective.NO_CACHE)
@Tag(name = "Carts")
public class CheckoutComCartsController {

    private static final String DEFAULT_FIELD_SET = FieldSetLevelHelper.DEFAULT_LEVEL;
    private static final String API_COMPATIBILITY_B2C_CHANNELS = "api.compatibility.b2c.channels";
    private static final String OBJECT_NAME_ADDRESS = "address";

    @Resource(name = "checkoutComAddressFacade")
    protected CheckoutComAddressFacade checkoutComAddressFacade;
    @Resource(name = "checkoutFacade")
    private CheckoutFacade checkoutFacade;
    @Resource(name = "commerceWebServicesCartFacade2")
    private CartFacade cartFacade;
    @Resource(name = "dataMapper")
    private DataMapper dataMapper;
    @Resource(name = "userFacade")
    private UserFacade userFacade;
    @Resource(name = "checkoutCustomerStrategy")
    private CheckoutCustomerStrategy checkoutCustomerStrategy;
    @Resource(name = "checkoutComPaymentDetailsWsDTOValidValidator")
    private Validator checkoutComPaymentDetailsWsDTOValidValidator;
    @Resource(name = "checkoutComPaymentTypeResolver")
    private CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolver;
    @Resource(name = "checkoutComPaymentInfoFacade")
    private CheckoutComPaymentInfoFacade checkoutComPaymentInfoFacade;
    @Resource(name = "checkoutComPaymentDetailsDTOReverseConverter")
    private CheckoutComPaymentDetailsDTOReverseConverter checkoutComPaymentDetailsDTOReverseConverter;
    @Resource(name = "checkoutDeliveryAddressValidator")
    private Validator deliveryAddressValidator;
    @Resource(name = "checkoutAddressDTOValidator")
    private Validator addressDTOValidator;

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @PostMapping(value = "/{cartId}/checkoutcompaymentdetails", consumes = {MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "createCartPaymentDetails", description = "Defines and assigns details of a new credit card payment to the cart.", summary = "Defines the details of a new credit card, and assigns this payment option to the cart.")
    @ApiBaseSiteIdUserIdAndCartIdParam
    public PaymentDetailsWsDTO createCartPaymentDetails(@Parameter(description = """
                                                                Request body parameter that contains details such as the name on the card (accountHolderName), the card number (cardNumber), the card type (cardType.code),\s
                                                                the month of the expiry date (expiryMonth), the year of the expiry date (expiryYear), whether the payment details should be saved (saved), whether the payment details\s
                                                                should be set as default (defaultPaymentInfo), and the billing address (billingAddress.firstName, billingAddress.lastName, billingAddress.titleCode, billingAddress.country.isocode,\s
                                                                billingAddress.line1, billingAddress.line2, billingAddress.town, billingAddress.postalCode, billingAddress.region.isocode)
                                                                
                                                                The DTO is in XML or .json format.
                                                                """, required = true) @RequestBody final PaymentDetailsWsDTO paymentDetails,
                                                        @ApiFieldsParam @RequestParam(defaultValue = DEFAULT_FIELD_SET) final String fields) throws NoCheckoutCartException {
        validatePayment(paymentDetails);

        final CheckoutComPaymentType paymentType = checkoutComPaymentTypeResolver.resolvePaymentMethod(paymentDetails.getType());
        final Object paymentInfo = checkoutComPaymentDetailsDTOReverseConverter.convertPaymentDetailsWsDTO(paymentDetails, paymentType);

        checkoutComPaymentInfoFacade.addPaymentInfoToCart(paymentInfo);

        final CartData cartData = checkoutFacade.getCheckoutCart();
        final CCPaymentInfoData paymentInfoData = cartData.getPaymentInfo();

        return dataMapper.map(paymentInfoData, PaymentDetailsWsDTO.class, fields);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @PostMapping(value = "/{cartId}/checkoutcomapmpaymentdetails", consumes = {MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "createCartPaymentDetails", description = "Defines and assigns details of a new APM payment to the cart.", summary = "Defines the details of a new APM, and assigns this payment option to the cart.")
    @ApiBaseSiteIdUserIdAndCartIdParam
    public void createCartAPMPaymentDetails(@Parameter(description =
            """
                    Request body parameter that contains details such as the name on the card (accountHolderName), the card number (cardNumber), the card type (cardType.code),\s
                    the month of the expiry date (expiryMonth), the year of the expiry date (expiryYear), whether the payment details should be saved (saved), whether the payment details\s
                    should be set as default (defaultPaymentInfo), and the billing address (billingAddress.firstName, billingAddress.lastName, billingAddress.titleCode, billingAddress.country.isocode,\s
                    billingAddress.line1, billingAddress.line2, billingAddress.town, billingAddress.postalCode, billingAddress.region.isocode)
                    
                    The DTO is in XML or .json format.
                    """, required = true) @RequestBody final PaymentDetailsWsDTO paymentDetails) throws NoCheckoutCartException {
        validatePayment(paymentDetails);

        final CheckoutComPaymentType paymentType = checkoutComPaymentTypeResolver.resolvePaymentMethod(paymentDetails.getType());
        final Object paymentInfo = checkoutComPaymentDetailsDTOReverseConverter.convertPaymentDetailsWsDTO(paymentDetails, paymentType);

        checkoutComPaymentInfoFacade.addPaymentInfoToCart(paymentInfo);
    }

    /**
     * Endpoint that gets the billing address currently assigned to the cart.
     *
     * @return billing address from the cart
     *
     * @queryparam fields Response configuration (list of fields, which should be returned in response)
     * @pathparam cartId of the cart
     * @security Permitted only for customers, guests, customer managers or trusted clients. Trusted client or customer
     * manager may impersonate as any user and access cart on their behalf.
     */
    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @GetMapping(value = "/{cartId}/checkoutoccbillingaddress")
    @ResponseStatus(HttpStatus.OK)
    @ApiBaseSiteIdUserIdAndCartIdParam
    public AddressWsDTO getBillingAddressFromCart(@PathVariable String cartId, @ApiFieldsParam @RequestParam(defaultValue = DEFAULT_FIELD_SET, required = false) final String fields) {
        return dataMapper.map(checkoutComAddressFacade.getCartBillingAddress(), AddressWsDTO.class, fields);
    }

    /**
     * Endpoint accepts a billing address and assigns it to cart.
     *
     * @param address Request body parameter (DTO in xml or json format) which contains details like :
     *                billing address (
     *                billingAddress.firstName,billingAddress.lastName, billingAddress.titleCode,
     *                billingAddress.country.isocode, billingAddress.line1, billingAddress.line2, billingAddress.town,
     *                billingAddress.postalCode, billingAddress.region.isocode),
     * @return Created billing address
     *
     * @queryparam fields Response configuration (list of fields, which should be returned in response)
     * @bodyparams billingAddress(titleCode, firstName, lastName, line1, line2, town, postalCode, country ( isocode), region(isocode), defaultAddress)
     * @security Permitted only for customers, guests, customer managers or trusted clients. Trusted client or customer
     * manager may impersonate as any user and access cart on their behalf.
     */
    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @PostMapping(value = "/{cartId}/checkoutoccbillingaddress", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @ApiBaseSiteIdUserIdAndCartIdParam
    public AddressWsDTO addBillingAddressToCart(@RequestBody final AddressWsDTO address, @ApiFieldsParam @RequestParam(defaultValue = DEFAULT_FIELD_SET, required = false) final String fields) {
        return saveBillingAddress(address, fields);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_GUEST", "ROLE_TRUSTED_CLIENT"})
    @PostMapping(value = "/{cartId}/addresses/checkoutcomdeliverypayment", consumes = {
            MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "createCartDeliveryAndBillingAddress", description = "Creates a delivery and a payment address for the cart.", summary = "Creates an address and assigns it to the cart as the delivery address and the payment address.")
    @ApiBaseSiteIdUserIdAndCartIdParam
    public AddressWsDTO createCartDeliveryAndBillingAddress(@Parameter(description =
                                                                    """
                                                                            Request body parameter that contains details such as the customer's first name (firstName), the customer's last name (lastName), the customer's title (titleCode), the customer's phone (phone),\s
                                                                            the country (country.isocode), the first part of the address (line1), the second part of the address (line2), the town (town), the postal code (postalCode), and the region (region.isocode).
                                                                            
                                                                            The DTO is in XML or .json format.
                                                                            """, required = true) @RequestBody final AddressWsDTO address,
                                                            @ApiFieldsParam @RequestParam(defaultValue = DEFAULT_FIELD_SET) final String fields) {
        validate(address, OBJECT_NAME_ADDRESS, addressDTOValidator);
        AddressData addressData = dataMapper.map(address, AddressData.class, DEFAULT_FIELD_SET);
        AddressData shippingAddressData = createShippingAddressInternal(addressData);
        shippingAddressData.setEmail(checkoutCustomerStrategy.getCurrentUserForCheckout().getContactEmail());
        setCartDeliveryAddressInternal(addressData.getId());
        AddressData billingAddressData = createBillingAddressInternal(addressData);
        checkoutComAddressFacade.setCartBillingDetails(billingAddressData);
        return dataMapper.map(shippingAddressData, AddressWsDTO.class, fields);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT"})
    @PutMapping(value = "/{cartId}/addresses/checkoutcomdeliverypayment")
    @ResponseStatus(HttpStatus.OK)
    @SiteChannelRestriction(allowedSiteChannelsProperty = API_COMPATIBILITY_B2C_CHANNELS)
    @Operation(operationId = "replaceCartDeliveryAndBillingAddress", description = "Sets a delivery and payment address for the cart.", summary = "Sets a delivery and payment address for the cart. The address country must be placed among the delivery countries of the current base store.")
    @ApiBaseSiteIdUserIdAndCartIdParam
    public void replaceCartDeliveryAndBillingAddress(
            @Parameter(description = "Address identifier", required = true) @RequestParam final String addressId) {
        setCartDeliveryAddressInternal(addressId);
        setCartPaymentAddressByAddressId(addressId);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT"})
    @PutMapping(value = "/{cartId}/addresses/setbillingaddressbyid")
    @ResponseStatus(HttpStatus.OK)
    @SiteChannelRestriction(allowedSiteChannelsProperty = API_COMPATIBILITY_B2C_CHANNELS)
    @Operation(operationId = "setbillingaddressbyid", description = "Sets a delivery and payment address for the cart.", summary = "Sets a delivery and payment address for the cart. The address country must be placed among the delivery countries of the current base store.")
    @ApiBaseSiteIdUserIdAndCartIdParam
    public void setBillingAddressOnCart(  @Parameter(description = "Address", required = true) @RequestBody final String addressId) {
        setCartPaymentAddressByAddressId(addressId);
    }

    /**
     * Saves the billing address on the current user
     *
     * @param address The billing address
     */
    protected AddressWsDTO saveBillingAddress(final AddressWsDTO address, final String fields) {
        address.setEmail(checkoutCustomerStrategy.getCurrentUserForCheckout().getContactEmail());
        address.setVisibleInAddressBook(Boolean.FALSE);
        final AddressData addressData = dataMapper.map(address, AddressData.class, fields);
        checkoutComAddressFacade.setCartBillingDetails(addressData);
        return dataMapper.map(addressData, AddressWsDTO.class, fields);
    }

    /**
     * Validates the given payment details
     *
     * @param paymentDetails The payment details to validate
     * @throws NoCheckoutCartException Thrown if the current user has no checkout cart
     */
    protected void validatePayment(final PaymentDetailsWsDTO paymentDetails) throws NoCheckoutCartException {
        if (!checkoutFacade.hasCheckoutCart()) {
            throw new NoCheckoutCartException("Cannot add PaymentInfo. There was no checkout cart created yet!");
        }
        validate(paymentDetails, "paymentDetails", checkoutComPaymentDetailsWsDTOValidValidator);
    }

    /**
     * Validates the given object
     *
     * @param object     The object to validate
     * @param objectName The object name
     * @param validator  The validator used to validate the given object
     */
    protected void validate(final Object object, final String objectName, final Validator validator) {
        final Errors errors = new BeanPropertyBindingResult(object, objectName);
        validator.validate(object, errors);
        if (errors.hasErrors()) {
            throw new WebserviceValidationException(errors);
        }
    }

    /**
     * Creates a shipping address
     *
     * @param addressData The shipping address to create
     * @return The shipping address
     */
    protected AddressData createShippingAddressInternal(final AddressData addressData) {
        addressData.setShippingAddress(true);
        addressData.setVisibleInAddressBook(true);
        userFacade.addAddress(addressData);
        if (addressData.isDefaultAddress()) {
            userFacade.setDefaultAddress(addressData);
        }
        return addressData;
    }

    /**
     * Creates a shipping address
     *
     * @param addressData The shipping address to create
     * @return The shipping address
     */
    protected AddressData createBillingAddressInternal(final AddressData addressData) {
        addressData.setShippingAddress(false);
        addressData.setBillingAddress(true);
        addressData.setVisibleInAddressBook(false);
        userFacade.addAddress(addressData);
        return addressData;
    }

    /**
     * Sets the given delivery address into the session cart
     *
     * @param addressId The address id
     * @return The cartData with the session attached
     */
    protected CartData setCartDeliveryAddressInternal(final String addressId) {
        final AddressData address = new AddressData();
        address.setId(addressId);
        final Errors errors = new BeanPropertyBindingResult(address, "addressData");
        deliveryAddressValidator.validate(address, errors);
        if (errors.hasErrors()) {
            throw new CartAddressException("Address given by id " + addressId + " is not valid",
                    CartAddressException.NOT_VALID, addressId);
        }
        if (checkoutFacade.setDeliveryAddress(address)) {
            return cartFacade.getSessionCart();
        }
        throw new CartAddressException(
                "Address given by id " + addressId + " cannot be set as delivery address in this cart",
                CartAddressException.CANNOT_SET, addressId);
    }

    /**
     * Sets the given delivery address into the session cart
     *
     * @param addressId The address id
     */
    protected void setCartPaymentAddressByAddressId(final String addressId) {
        checkoutComAddressFacade.setCartBillingDetailsByAddressId(addressId);
    }

    /**
     * Sanitizes a given string.
     *
     * @param input The string to sanitize
     * @return The sanitized string
     */
    protected static String sanitize(final String input) {
        return Sanitizer.sanitize(input);
    }
}
