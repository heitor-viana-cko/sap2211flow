package com.checkout.hybris.facades.payment.token.request.converters.populators;

import com.checkout.hybris.facades.beans.ApplePayAdditionalAuthInfo;
import com.checkout.hybris.facades.beans.ApplePayHeader;
import com.checkout.tokens.ApplePayTokenRequest;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Before;
import org.junit.Test;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.APPLEPAY;
import static org.junit.Assert.assertEquals;

@UnitTest
public class CheckoutComApplePayTokenRequestPopulatorTest {

    private static final String TRANSACTION_ID = "transactionId";
    private static final String PUBLIC_KEY_HASH = "PublicKeyHash";
    private static final String EPHEMERAL_PUBLICKEY = "EphemeralPublicKey";
    private static final String SIGNATURE = "signature";
    private static final String DATA = "data";
    private static final String VERSION = "version";
    private static final String TRANSACTION_ID_REQUEST_KEY = "transactionId";
    private static final String PUBLIC_KEY_HASH_REQUEST_KEY = "publicKeyHash";
    private static final String EPHEMERAL_PUBLIC_KEY_REQUEST_KEY = "ephemeralPublicKey";

    private final CheckoutComApplePayTokenRequestPopulator testObj = new CheckoutComApplePayTokenRequestPopulator();

    private final ApplePayAdditionalAuthInfo source = new ApplePayAdditionalAuthInfo();
    private final ApplePayTokenRequest target = new ApplePayTokenRequest();

    @Before
    public void setUp() {
        source.setVersion(VERSION);
        source.setData(DATA);
        source.setSignature(SIGNATURE);
        final ApplePayHeader applePayHeader = new ApplePayHeader();
        applePayHeader.setEphemeralPublicKey(EPHEMERAL_PUBLICKEY);
        applePayHeader.setPublicKeyHash(PUBLIC_KEY_HASH);
        applePayHeader.setTransactionId(TRANSACTION_ID);
        source.setHeader(applePayHeader);
    }

    @Test
    public void populate_WhenEverythingIsFine_ShouldPopulateTheRequest() {
        testObj.populate(source, target);

        assertEquals(VERSION, target.getApplePayTokenData().getVersion());
        assertEquals(DATA, target.getApplePayTokenData().getData());
        assertEquals(SIGNATURE, target.getApplePayTokenData().getSignature());
        assertEquals(EPHEMERAL_PUBLICKEY, target.getApplePayTokenData().getTokenHeader().get(EPHEMERAL_PUBLIC_KEY_REQUEST_KEY));
        assertEquals(PUBLIC_KEY_HASH, target.getApplePayTokenData().getTokenHeader().get(PUBLIC_KEY_HASH_REQUEST_KEY));
        assertEquals(TRANSACTION_ID, target.getApplePayTokenData().getTokenHeader().get(TRANSACTION_ID_REQUEST_KEY));
        assertEquals(APPLEPAY.name(), target.getType().name());
    }

    @Test(expected = IllegalArgumentException.class)
    public void populate_WhenSourceNull_ShouldThrowException() {
        testObj.populate(null, target);
    }

    @Test(expected = IllegalArgumentException.class)
    public void populate_WhenTargetNull_ShouldThrowException() {
        testObj.populate(source, null);
    }
}
