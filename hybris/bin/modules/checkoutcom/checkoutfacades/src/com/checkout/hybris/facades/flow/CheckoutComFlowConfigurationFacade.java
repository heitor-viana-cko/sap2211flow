package com.checkout.hybris.facades.flow;

import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;

/**
 * Facade to handle flow configuration
 */
public interface CheckoutComFlowConfigurationFacade {

    /**
     * Checks if the flow is enabled for the given base site
     *
     * @param baseSiteId the base site identifier
     * @return true if flow is enabled, false otherwise
     */
    boolean isFlowEnabled(String baseSiteId);

    /**
     * Checks if the flow is enabled for the current base site
     *
     * @return true if flow is enabled, false otherwise
     */
    boolean isFlowEnabled();

    /**
     * Gets the flow UI configuration data for the given base site
     *
     * @param baseSiteId the base site identifier
     * @return the flow UI configuration data
     */
    CheckoutComFlowUIConfigurationData getCheckoutComFlowUIConfigurationData(String baseSiteId);

    /**
     * Gets the flow UI configuration data for the current base site
     *
     * @return the flow UI configuration data
     */
    CheckoutComFlowUIConfigurationData getCheckoutComFlowUIConfigurationData();
}
