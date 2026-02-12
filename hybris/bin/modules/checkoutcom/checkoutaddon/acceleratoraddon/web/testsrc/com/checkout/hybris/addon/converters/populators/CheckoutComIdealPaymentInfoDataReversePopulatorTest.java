package com.checkout.hybris.addon.converters.populators;

import com.checkout.hybris.addon.forms.PaymentDataForm;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.facades.beans.IdealPaymentInfoData;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

@UnitTest
public class CheckoutComIdealPaymentInfoDataReversePopulatorTest {

    private CheckoutComIdealPaymentInfoDataReversePopulator testObj = new CheckoutComIdealPaymentInfoDataReversePopulator();

    private PaymentDataForm source = new PaymentDataForm();
    private IdealPaymentInfoData target = new IdealPaymentInfoData();

    @Test
    public void populate_ShouldPopulateTargetCorrectly() {
        testObj.populate(source, target);

        assertEquals(CheckoutComPaymentType.IDEAL.name(), target.getType());
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