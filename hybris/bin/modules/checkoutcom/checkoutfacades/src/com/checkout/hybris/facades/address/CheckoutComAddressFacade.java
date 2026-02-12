package com.checkout.hybris.facades.address;

import de.hybris.platform.commercefacades.user.data.AddressData;

import java.util.List;

/**
 * Handles the address operations for checkout.com
 */
public interface CheckoutComAddressFacade {

    /**
     * Gets the current cart billing address for the checkout flow
     *
     * @return AddressData the address to expose
     */
    AddressData getCartBillingAddress();

    /**
     * Sets billing details to the session cart (payment address)
     *
     * @param addressData the address data
     */
    void setCartBillingDetails(AddressData addressData);

    /**
     * Sets billing details to the session cart (payment address) given an address
     *
     * @param addressId the address
     */
    void setCartBillingDetailsByAddress(AddressData addressId);

    void setCartBillingDetailsByAddressId(final String addressId);

    void setAddressDataCountry(String countryCode, AddressData addressData);

    void setAddressDataRegion(String region, String countryCode, AddressData addressData);
}
