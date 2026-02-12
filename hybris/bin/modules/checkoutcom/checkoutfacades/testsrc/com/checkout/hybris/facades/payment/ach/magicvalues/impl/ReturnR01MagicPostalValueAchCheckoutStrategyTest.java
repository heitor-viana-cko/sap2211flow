package com.checkout.hybris.facades.payment.ach.magicvalues.impl;

import com.checkout.hybris.facades.beans.AchBankInfoDetailsData;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

import static org.assertj.core.api.Assertions.assertThat;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class ReturnR01MagicPostalValueAchCheckoutStrategyTest {
    private static final String MAGIC_VALUE = "R00001";
    @InjectMocks
    private ReturnR01MagicPostalValueAchCheckoutStrategy testObj;


    @Test
    public void createAchBankInfoDetailsData_shouldReturnAnObjectWithTheAttributesFieldWithTheMagicValues() {
        final AchBankInfoDetailsData achBankInfoDetailsData = testObj.createAchBankInfoDetailsData();

        assertThat(achBankInfoDetailsData).hasFieldOrPropertyWithValue("accountHolderName", "Mike Hammer")
            .hasFieldOrPropertyWithValue("accountType", "CHECKING")
            .hasFieldOrPropertyWithValue("accountNumber", "4099999992")
            .hasFieldOrPropertyWithValue("bankRouting", "011075150")
            .hasFieldOrPropertyWithValue("mask", "0000009992")
            .hasFieldOrPropertyWithValue("institutionName", "Bank of america");
    }

    @Test
    public void isApplicable_shouldReturnTrueForPostalCodeR00001() {
        final boolean result = testObj.isApplicable(MAGIC_VALUE);

        assertThat(result).isTrue();
    }
}
