package com.checkout.hybris.core.payment.services.impl;

import com.checkout.hybris.core.enums.EnvironmentType;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.services.CheckoutComApiService;
import com.checkout.CheckoutApi;
import com.checkout.CheckoutSdkBuilder;
import com.checkout.Environment;

public class DefaultCheckoutComApiService implements CheckoutComApiService {
	private final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;

	public DefaultCheckoutComApiService(final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
		this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
	}

	@Override
	public CheckoutApi createCheckoutApi() {
		return createCheckoutComApi();
	}

	protected CheckoutApi createCheckoutComApi() {
		final String secretKey = checkoutComMerchantConfigurationService.getSecretKey();
		final String publicKey = checkoutComMerchantConfigurationService.getPublicKey();
		final boolean useSandbox = checkoutComMerchantConfigurationService.getEnvironment()
																		  .equals(EnvironmentType.TEST);
		return createCheckoutComApi(secretKey, publicKey, useSandbox);

	}

	protected CheckoutApi createCheckoutComApi(final String secretKey, final String publicKey,
											   final boolean useSandbox) {
        return new CheckoutSdkBuilder.CheckoutStaticKeysSdkBuilder()
            .publicKey(publicKey)
            .secretKey(secretKey)
            .environment(useSandbox ? Environment.SANDBOX : Environment.PRODUCTION)
            .build();
    }
}
