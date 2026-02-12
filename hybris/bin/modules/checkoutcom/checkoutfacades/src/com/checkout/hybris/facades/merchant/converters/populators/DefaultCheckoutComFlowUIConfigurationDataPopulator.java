package com.checkout.hybris.facades.merchant.converters.populators;

import com.checkout.hybris.core.model.CheckoutComFlowAroundUIConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComFlowElementUIConfigModel;
import com.checkout.hybris.core.model.CheckoutComFlowUIConfigurationModel;
import com.checkout.hybris.facades.beans.CheckoutComFlowAroundUIConfigurationData;
import com.checkout.hybris.facades.beans.CheckoutComFlowElementUIConfigData;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;
import de.hybris.platform.servicelayer.dto.converter.Converter;

import java.util.Optional;

public class DefaultCheckoutComFlowUIConfigurationDataPopulator implements Populator<CheckoutComFlowUIConfigurationModel, CheckoutComFlowUIConfigurationData> {


    private final Converter<CheckoutComFlowElementUIConfigModel, CheckoutComFlowElementUIConfigData> checkoutComFlowElementUIConfigConverter;

    private final Converter<CheckoutComFlowAroundUIConfigurationModel, CheckoutComFlowAroundUIConfigurationData> checkoutComFlowAroundUIConfigurationDataConverter;

    public DefaultCheckoutComFlowUIConfigurationDataPopulator(final Converter<CheckoutComFlowElementUIConfigModel, CheckoutComFlowElementUIConfigData> checkoutComFlowElementUIConfigConverter,
                                                              final Converter<CheckoutComFlowAroundUIConfigurationModel, CheckoutComFlowAroundUIConfigurationData> checkoutComFlowAroundUIConfigurationDataConverter) {
        this.checkoutComFlowElementUIConfigConverter = checkoutComFlowElementUIConfigConverter;
        this.checkoutComFlowAroundUIConfigurationDataConverter = checkoutComFlowAroundUIConfigurationDataConverter;
    }

    @Override
    public void populate(CheckoutComFlowUIConfigurationModel source, CheckoutComFlowUIConfigurationData target) throws ConversionException {
        target.setColorAction(source.getColorAction());
        target.setColorBackground(source.getColorBackground());
        target.setColorBorder(source.getColorBorder());
        target.setColorDisabled(source.getColorDisabled());
        target.setColorError(source.getColorError());
        target.setColorFormBackground(source.getColorFormBackground());
        target.setColorFormBorder(source.getColorFormBorder());
        target.setColorInverse(source.getColorInverse());
        target.setColorOutline(source.getColorOutline());
        target.setColorPrimary(source.getColorPrimary());
        Optional.ofNullable(source.getButton()).map(checkoutComFlowElementUIConfigConverter::convert).ifPresent(target::setButton);
        Optional.ofNullable(source.getFootnote()).map(checkoutComFlowElementUIConfigConverter::convert).ifPresent(target::setFootnote);
        Optional.ofNullable(source.getLabel()).map(checkoutComFlowElementUIConfigConverter::convert).ifPresent(target::setLabel);
        Optional.ofNullable(source.getSubheading()).map(checkoutComFlowElementUIConfigConverter::convert).ifPresent(target::setSubheading);
        Optional.ofNullable(source.getBorderRadius()).map(checkoutComFlowAroundUIConfigurationDataConverter::convert).ifPresent(target::setBorderRadius);
    }
}
