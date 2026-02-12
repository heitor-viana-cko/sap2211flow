package com.checkout.hybris.facades.payment.token.request.converters.populators;

import com.checkout.hybris.facades.beans.GooglePayPaymentToken;
import com.checkout.tokens.GooglePayTokenData;
import com.checkout.tokens.GooglePayTokenRequest;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * Populates the WalletTokenRequest from GooglePayPaymentToken
 */
public class CheckoutComGooglePayTokenRequestPopulator implements Populator<GooglePayPaymentToken, GooglePayTokenRequest> {

    protected static final String PROTOCOL_VERSION_REQUEST_KEY = "protocolVersion";
    protected static final String SIGNED_MESSAGE_REQUEST_KEY = "signedMessage";

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final GooglePayPaymentToken source, final GooglePayTokenRequest target) throws ConversionException {
        validateParameterNotNull(source, "GooglePayPaymentToken cannot be null.");
        validateParameterNotNull(target, "WalletTokenRequest cannot be null.");

        target.setGooglePayTokenData(createTokenData(source));
    }

    /**
     * Creates the TokenData map for google pay
     *
     * @param source the populated GooglePayPaymentToken
     * @return the TokenData map
     */
    protected GooglePayTokenData createTokenData(final GooglePayPaymentToken source) {
        return GooglePayTokenData.builder()
            .protocolVersion(source.getProtocolVersion())
            .signedMessage(source.getSignedMessage())
            .signature(source.getSignature())
            .build();
    }
}
