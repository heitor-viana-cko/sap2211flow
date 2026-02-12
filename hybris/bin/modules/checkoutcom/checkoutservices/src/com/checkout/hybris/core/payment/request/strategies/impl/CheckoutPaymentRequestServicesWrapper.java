package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.hybris.core.url.services.CheckoutComUrlService;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;

public class  CheckoutPaymentRequestServicesWrapper {
    protected final CheckoutComUrlService checkoutComUrlService;
    protected final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;
    protected final CheckoutComCurrencyService checkoutComCurrencyService;
    protected final CMSSiteService cmsSiteService;
    protected final CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationService;

    public CheckoutPaymentRequestServicesWrapper(CheckoutComUrlService checkoutComUrlService,
                                                 CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService,
                                                 CheckoutComCurrencyService checkoutComCurrencyService,
                                                 CMSSiteService cmsSiteService,
                                                 CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationService) {
        this.checkoutComUrlService = checkoutComUrlService;
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
        this.checkoutComCurrencyService = checkoutComCurrencyService;
        this.cmsSiteService = cmsSiteService;
        this.checkoutComPaymentIntegrationService = checkoutComPaymentIntegrationService;
    }
}
