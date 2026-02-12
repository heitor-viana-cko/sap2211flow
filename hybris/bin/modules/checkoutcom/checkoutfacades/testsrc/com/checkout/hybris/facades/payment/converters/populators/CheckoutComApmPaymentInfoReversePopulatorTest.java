package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.hybris.core.apm.services.CheckoutComAPMConfigurationService;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.facades.beans.APMPaymentInfoData;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.PAYPAL;
import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComApmPaymentInfoReversePopulatorTest {

    @InjectMocks
    private CheckoutComApmPaymentInfoReversePopulator testObj;

    @Mock
    private CheckoutComAPMConfigurationService checkoutComAPMConfigurationServiceMock;

    private APMPaymentInfoData source = new APMPaymentInfoData();
    private CheckoutComAPMPaymentInfoModel target = new CheckoutComAPMPaymentInfoModel();

    @Test
    public void populate_ShouldPopulateTargetCorrectly() {
        when(checkoutComAPMConfigurationServiceMock.isApmUserDataRequired(PAYPAL.name())).thenReturn(false);
        source.setType(PAYPAL.name());

        testObj.populate(source, target);

        assertEquals(PAYPAL.name(), target.getType());
        assertFalse(target.getUserDataRequired());
        assertTrue(target.getDeferred());
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
