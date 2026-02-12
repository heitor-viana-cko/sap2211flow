package com.checkout.hybris.occ.strategies;

import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.request.strategies.impl.CheckoutPaymentRequestServicesWrapper;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.hybris.core.url.services.CheckoutComUrlService;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;

public class CheckoutPaymentRequestServicesOccWrapper extends CheckoutPaymentRequestServicesWrapper {
    protected final CheckoutComUrlService checkoutComOccUrlService;
    public CheckoutPaymentRequestServicesOccWrapper(CheckoutComUrlService checkoutComUrlService,
                                                    CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService,
                                                    CheckoutComCurrencyService checkoutComCurrencyService,
                                                    CMSSiteService cmsSiteService,
                                                    CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationService) {
        super(checkoutComUrlService, checkoutComMerchantConfigurationService, checkoutComCurrencyService,
            cmsSiteService, checkoutComPaymentIntegrationService);
        this.checkoutComOccUrlService = checkoutComUrlService;
    }
}
