package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.hybris.core.model.CheckoutComKlarnaAPMPaymentInfoModel;
import com.checkout.hybris.facades.beans.KlarnaPaymentInfoData;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.KLARNA;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComKlarnaPaymentInfoReversePopulatorTest {

    private static final String KLARNA_AUTH_TOKEN_VALUE = "klarna_token";
    private static final String KLARNA_PAYMENT_CONTEXT_VALUE = "payment_context_id";

    @InjectMocks
    private CheckoutComKlarnaPaymentInfoReversePopulator testObj;

    private KlarnaPaymentInfoData source = new KlarnaPaymentInfoData();
    private CheckoutComKlarnaAPMPaymentInfoModel target = new CheckoutComKlarnaAPMPaymentInfoModel();

    @Test
    public void populate_ShouldPopulateTargetCorrectly() {
        source.setType(KLARNA.name());
        source.setAuthorizationToken(KLARNA_AUTH_TOKEN_VALUE);
        source.setPaymentContextId(KLARNA_PAYMENT_CONTEXT_VALUE);

        testObj.populate(source, target);

        assertEquals(KLARNA_AUTH_TOKEN_VALUE, target.getAuthorizationToken());
        assertEquals(KLARNA_PAYMENT_CONTEXT_VALUE, target.getPaymentContext());
        assertFalse(target.getDeferred());
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
