package com.checkout.hybris.addon.interceptors.beforeview;

import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import de.hybris.platform.acceleratorstorefrontcommons.interceptors.BeforeViewHandler;
import org.apache.log4j.Logger;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CheckoutComIsMerchantABCBeforeViewHandler implements BeforeViewHandler {

    private static final Logger LOG = Logger.getLogger(CheckoutComIsMerchantABCBeforeViewHandler.class);
    protected final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;

    public CheckoutComIsMerchantABCBeforeViewHandler(final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
    }

    @Override
    public void beforeView(final HttpServletRequest request, final HttpServletResponse response, final ModelAndView modelAndView) {
        modelAndView.addObject("isABC", Boolean.FALSE);
        LOG.debug("The configuration of this merchant is NAS");
    }
}
