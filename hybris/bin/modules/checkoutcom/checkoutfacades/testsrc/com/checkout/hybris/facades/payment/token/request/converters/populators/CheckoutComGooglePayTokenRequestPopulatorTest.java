package com.checkout.hybris.facades.payment.token.request.converters.populators;

import com.checkout.hybris.facades.beans.GooglePayPaymentToken;
import com.checkout.tokens.GooglePayTokenRequest;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.GOOGLEPAY;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class CheckoutComGooglePayTokenRequestPopulatorTest {

    private static final String SIGNATURE = "signature";
    private static final String PROTOCOL_VERSION = "protocol_version";
    private static final String SIGNATURE_MESSAGE = "signature_message";

    private final CheckoutComGooglePayTokenRequestPopulator testObj = new CheckoutComGooglePayTokenRequestPopulator();

    private final GooglePayPaymentToken source = new GooglePayPaymentToken();
    private final GooglePayTokenRequest target = new GooglePayTokenRequest();

    @BeforeEach
    public void setUp() {
        source.setProtocolVersion(PROTOCOL_VERSION);
        source.setSignedMessage(SIGNATURE_MESSAGE);
        source.setSignature(SIGNATURE);
    }

    @Test
    public void populate_WhenEverythingIsFine_ShouldPopulateTheRequest() {
        testObj.populate(source, target);

        assertEquals(PROTOCOL_VERSION, target.getGooglePayTokenData().getProtocolVersion());
        assertEquals(SIGNATURE_MESSAGE, target.getGooglePayTokenData().getSignedMessage());
        assertEquals(SIGNATURE, target.getGooglePayTokenData().getSignature());
        assertEquals(GOOGLEPAY.name().toLowerCase(), target.getType().name());
    }

    @Test
    public void populate_WhenSourceNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.populate(null, target)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void populate_WhenTargetNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.populate(source, null)).isInstanceOf(IllegalArgumentException.class);
    }
}
