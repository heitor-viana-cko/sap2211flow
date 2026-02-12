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
public class PaymentDeclinedMagicPostalValueAchCheckoutStrategyTest {

	private static final String MAGIC_VALUE = "PD00001";
	@InjectMocks
	private PaymentDeclinedMagicPostalValueAchCheckoutStrategy testObj;


	@Test
	public void createAchBankInfoDetailsData_shouldReturnAnObjectWithTheAttributesFieldWithTheMagicValues() {
		final AchBankInfoDetailsData achBankInfoDetailsData = testObj.createAchBankInfoDetailsData();

		assertThat(achBankInfoDetailsData).hasFieldOrPropertyWithValue("accountHolderName", "Mike Hammer")
            .hasFieldOrPropertyWithValue("accountType", "CHECKING")
            .hasFieldOrPropertyWithValue("accountNumber", "10@BC99999")
            .hasFieldOrPropertyWithValue("bankRouting", "091000022")
            .hasFieldOrPropertyWithValue("mask", "****9999")
            .hasFieldOrPropertyWithValue("institutionName", "Bank of america");
	}

	@Test
	public void isApplicable_shouldReturnTrueForPostalCodePD00001() {
		final boolean result = testObj.isApplicable(MAGIC_VALUE);

		assertThat(result).isTrue();
	}
}
