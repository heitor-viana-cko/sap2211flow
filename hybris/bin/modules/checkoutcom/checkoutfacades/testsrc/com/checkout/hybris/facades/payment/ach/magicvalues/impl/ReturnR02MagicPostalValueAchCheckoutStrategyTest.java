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
public class ReturnR02MagicPostalValueAchCheckoutStrategyTest {

    @InjectMocks
    private ReturnR02MagicPostalValueAchCheckoutStrategy testObj;

    private static final String MAGIC_VALUE = "R00002";

    @Test
    public void createAchBankInfoDetailsData_shouldReturnAnObjectWithTheAttributesFieldWithTheMagicValues() {
        final AchBankInfoDetailsData achBankInfoDetailsData = testObj.createAchBankInfoDetailsData();

        assertThat(achBankInfoDetailsData).hasFieldOrPropertyWithValue("accountHolderName", "Tom Black")
            .hasFieldOrPropertyWithValue("accountType", "CHECKING")
            .hasFieldOrPropertyWithValue("accountNumber", "9999999999")
            .hasFieldOrPropertyWithValue("bankRouting", "011075150")
            .hasFieldOrPropertyWithValue("mask", "0000009999")
            .hasFieldOrPropertyWithValue("institutionName", "Bank of america")
            .hasFieldOrPropertyWithValue("companyName", "Widget Inc");
    }

    @Test
    public void isApplicable_shouldReturnTrueForPostalCodeR00002() {
        final boolean result = testObj.isApplicable(MAGIC_VALUE);

        assertThat(result).isTrue();
    }

}
