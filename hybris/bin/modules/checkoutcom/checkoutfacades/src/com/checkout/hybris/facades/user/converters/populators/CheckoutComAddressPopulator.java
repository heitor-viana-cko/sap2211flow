package com.checkout.hybris.facades.user.converters.populators;

import de.hybris.platform.commercefacades.user.converters.populator.AddressPopulator;
import de.hybris.platform.commercefacades.user.converters.populator.AddressReversePopulator;
import de.hybris.platform.commercefacades.user.data.AddressData;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

/**
 * Checkout.com populator needed to populate the email address in the model from the data.
 * It's always used as populator call and not mapped in a converter,
 * for this reason it's impossible to add another populator to a list.
 */
public class CheckoutComAddressPopulator extends AddressPopulator {

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final AddressModel source, final AddressData target) throws ConversionException {
        callSuperPopulate(source, target);

        target.setEmail(source.getEmail());
    }

    protected void callSuperPopulate(final AddressModel source, final AddressData target) {
        super.populate(source, target);
    }
}
