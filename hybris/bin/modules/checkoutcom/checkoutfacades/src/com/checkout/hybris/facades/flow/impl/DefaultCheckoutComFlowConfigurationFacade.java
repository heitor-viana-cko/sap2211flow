package com.checkout.hybris.facades.flow.impl;

import com.checkout.hybris.core.model.CheckoutComFlowUIConfigurationModel;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import com.checkout.hybris.facades.flow.CheckoutComFlowConfigurationFacade;
import de.hybris.platform.basecommerce.model.site.BaseSiteModel;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import de.hybris.platform.site.BaseSiteService;

import java.util.Optional;

public class DefaultCheckoutComFlowConfigurationFacade implements CheckoutComFlowConfigurationFacade {

    private final BaseSiteService baseSiteService;
    private final Converter<CheckoutComFlowUIConfigurationModel, CheckoutComFlowUIConfigurationData> checkoutComFlowUIConfigurationConverter;

    public DefaultCheckoutComFlowConfigurationFacade(final BaseSiteService baseSiteService, final Converter<CheckoutComFlowUIConfigurationModel, CheckoutComFlowUIConfigurationData> checkoutComFlowUIConfigurationConverter) {
        this.baseSiteService = baseSiteService;
        this.checkoutComFlowUIConfigurationConverter = checkoutComFlowUIConfigurationConverter;
    }

    @Override
    public boolean isFlowEnabled(final String baseSiteId) {
        final BaseSiteModel baseSiteForUID = baseSiteService.getBaseSiteForUID(baseSiteId);
        return Boolean.TRUE.equals(baseSiteForUID.getFlow());
    }

    @Override
    public boolean isFlowEnabled() {
        final BaseSiteModel currentBaseSite = baseSiteService.getCurrentBaseSite();
        return Boolean.TRUE.equals(currentBaseSite.getFlow());
    }

    @Override
    public CheckoutComFlowUIConfigurationData getCheckoutComFlowUIConfigurationData(final String baseSiteId) {
        final BaseSiteModel currentBaseSite = baseSiteService.getBaseSiteForUID(baseSiteId);
        if (Boolean.TRUE.equals(currentBaseSite.getFlow())) {
            return Optional.ofNullable(currentBaseSite.getFlowUIConfiguration())
                .map(checkoutComFlowUIConfigurationConverter::convert)
                .orElse(null);
        }
        return null;
    }

    @Override
    public CheckoutComFlowUIConfigurationData getCheckoutComFlowUIConfigurationData() {
        final BaseSiteModel currentBaseSite = baseSiteService.getCurrentBaseSite();
        if (Boolean.TRUE.equals(currentBaseSite.getFlow())) {
            return Optional.ofNullable(currentBaseSite.getFlowUIConfiguration())
                .map(checkoutComFlowUIConfigurationConverter::convert)
                .orElse(null);
        }
        return null;
    }
}
