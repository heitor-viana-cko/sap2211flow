package com.checkout.hybris.facades.payment.token.request.converters.populators;

import com.checkout.hybris.facades.beans.ApplePayAdditionalAuthInfo;
import com.checkout.tokens.ApplePayTokenData;
import com.checkout.tokens.ApplePayTokenRequest;
import com.checkout.tokens.WalletTokenRequest;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

import java.util.HashMap;
import java.util.Map;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.APPLEPAY;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * Populates the WalletTokenRequest from ApplePayAdditionalAuthInfo
 */
public class CheckoutComApplePayTokenRequestPopulator implements Populator<ApplePayAdditionalAuthInfo, ApplePayTokenRequest> {

    private static final String TRANSACTION_ID_REQUEST_KEY = "transactionId";
    private static final String PUBLIC_KEY_HASH_REQUEST_KEY = "publicKeyHash";
    private static final String EPHEMERAL_PUBLIC_KEY_REQUEST_KEY = "ephemeralPublicKey";

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final ApplePayAdditionalAuthInfo source, final ApplePayTokenRequest target) throws ConversionException {
        validateParameterNotNull(source, "ApplePayAdditionalAuthInfo cannot be null.");
        validateParameterNotNull(target, "WalletTokenRequest cannot be null.");

        target.setApplePayTokenData(createTokenData(source));
    }

    /**
     * Creates the TokenData map for apple pay
     *
     * @param source the populated ApplePayAdditionalAuthInfo
     * @return the TokenData map
     */
    protected ApplePayTokenData createTokenData(final ApplePayAdditionalAuthInfo source) {
        final Map<String, String> header = new HashMap<>();
        if (source.getHeader() != null) {
            header.put(EPHEMERAL_PUBLIC_KEY_REQUEST_KEY, source.getHeader().getEphemeralPublicKey());
            header.put(PUBLIC_KEY_HASH_REQUEST_KEY, source.getHeader().getPublicKeyHash());
            header.put(TRANSACTION_ID_REQUEST_KEY, source.getHeader().getTransactionId());
        }
        return ApplePayTokenData.builder()
            .version(source.getVersion())
            .data(source.getData())
            .signature(source.getSignature())
            .tokenHeader(header)
            .build();

    }
}
