package com.checkout.hybris.events.validators.impl;

import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.services.CheckoutComPaymentEventService;
import com.checkout.hybris.events.validators.CheckoutComRequestEventValidator;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import de.hybris.platform.site.BaseSiteService;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Type;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Default implementation of {@link CheckoutComRequestEventValidator}
 */
public class DefaultCheckoutComRequestEventValidator implements CheckoutComRequestEventValidator {

    protected static final Logger LOG = LogManager.getLogger(DefaultCheckoutComRequestEventValidator.class);

    protected static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();

    protected final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;
    protected final CheckoutComPaymentEventService checkoutComPaymentEventService;
    protected final BaseSiteService baseSiteService;
    public DefaultCheckoutComRequestEventValidator(final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService,
                                                   final CheckoutComPaymentEventService checkoutComPaymentEventService,
                                                   final BaseSiteService baseSiteService) {
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
        this.checkoutComPaymentEventService = checkoutComPaymentEventService;
        this.baseSiteService = baseSiteService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isRequestEventValid(final HttpServletRequest request, final String eventBody) throws NoSuchAlgorithmException, InvalidKeyException {
        final String ckoSignature = request.getHeader("cko-signature");
        final String eventAuthorizationHeaderKey = request.getHeader("authorization");
        final Type type = new TypeToken<CheckoutComPaymentEventObject>() {/**/
        }.getType();
        final CheckoutComPaymentEventObject eventBodyData = new Gson().fromJson(eventBody, type);
        baseSiteService.setCurrentBaseSite(baseSiteService.getBaseSiteForUID(getSiteIdForTheEvent(eventBodyData)), false);

        LOG.debug("Received event authorization header: [{}]; ", eventAuthorizationHeaderKey);
        LOG.debug("Received event signature: [{}]; ", ckoSignature);
        LOG.debug("Received event body: [{}]", eventBody);

        if (isNasAuthorizationHeaderActive() && isNasAuthorizationHeaderInvalid(eventAuthorizationHeaderKey)) {
            return false;
        } else {
            return !isNasSignatureKeyActive() || isCkoSignatureValid(ckoSignature, eventBody);
        }
    }

    protected boolean isCkoSignatureValid(final String ckoSignature, final String eventBody) throws InvalidKeyException, NoSuchAlgorithmException {
        if (StringUtils.isBlank(ckoSignature) || StringUtils.isBlank(eventBody)) {
            LOG.error("ckoSignature or event body null.");
            return false;
        }
        return ckoSignature.equalsIgnoreCase(createEventBodyHash(eventBody));
    }

    private String createEventBodyHash(final String eventBody) throws NoSuchAlgorithmException, InvalidKeyException {
        final Mac hmac = Mac.getInstance(HmacAlgorithms.HMAC_SHA_256.getName());
        final byte[] secretPhrase = getSecretPhrase();
        final SecretKeySpec secretKey = new SecretKeySpec(secretPhrase, HmacAlgorithms.HMAC_SHA_256.getName());
        hmac.init(secretKey);
        final byte[] bytes = hmac.doFinal(eventBody.getBytes());
        return new String(convertBytesToHex(bytes));
    }

    private boolean isNasAuthorizationHeaderInvalid(final String eventAuthorizationHeaderKey) {
        final String authorizationKeyForSite = checkoutComMerchantConfigurationService.getAuthorizationKey();
        return StringUtils.isNotEmpty(eventAuthorizationHeaderKey) && !eventAuthorizationHeaderKey.equals(authorizationKeyForSite);
    }

    private boolean isNasAuthorizationHeaderActive() {
        return checkoutComMerchantConfigurationService.isNasAuthorisationHeaderUsedOnNotificationValidation();
    }

    private boolean isNasSignatureKeyActive() {
        return checkoutComMerchantConfigurationService.isNasSignatureKeyUsedOnNotificationValidation();
    }

    private String getSiteIdForTheEvent(final CheckoutComPaymentEventObject eventBody) {
        return checkoutComPaymentEventService.getSiteIdForTheEvent(eventBody);
    }

    private byte[] getSecretPhrase() {
        return checkoutComMerchantConfigurationService.getSignatureKey().getBytes();
    }

    private char[] convertBytesToHex(final byte[] bytes) {
        final char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return hexChars;
    }
}
