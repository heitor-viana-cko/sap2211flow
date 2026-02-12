package com.checkout.hybris.core.currency.services.impl;

import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.c2l.CurrencyModel;
import de.hybris.platform.servicelayer.i18n.CommonI18NService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class DefaultCheckoutComCurrencyServiceTest {

    private static final double GBP_AMOUNT = 123.23d;
    private static final double BHD_AMOUNT = 12.323d;
    private static final long CHECKOUTCOM_AMOUNT = 12323;
    private static final String GBP = "GBP";
    private static final String BHD = "BHD";

    @InjectMocks
    private DefaultCheckoutComCurrencyService testObj;

    @Mock
    private CurrencyModel currencyModelMock;
    @Mock
    private CommonI18NService commonI18NServiceMock;

    @Test(expected = IllegalArgumentException.class)
    public void removeDecimalsFromCurrencyAmount_WhenCurrencyIsNull_ShouldThrowException() {
        testObj.removeDecimalsFromCurrencyAmount(null, GBP_AMOUNT);
    }

    @Test(expected = IllegalArgumentException.class)
    public void removeDecimalsFromCurrencyAmountIntoPennies_WhenAmountIsNull_ShouldThrowException() {
        testObj.removeDecimalsFromCurrencyAmount(GBP, null);
    }

    @Test
    public void convertAmountIntoPennies_ShouldRemoveDecimalsFromCurrencyTheValueProperly_WhenCurrencyHasTwoDecimals() {
        when(commonI18NServiceMock.convertAndRoundCurrency(1, Math.pow(10, 2), 0, GBP_AMOUNT)).thenReturn(12323d);

        final Long amount = testObj.removeDecimalsFromCurrencyAmount(GBP, GBP_AMOUNT);

        assertThat(amount).isEqualTo(CHECKOUTCOM_AMOUNT);
    }

    @Test
    public void convertAmountIntoPennies_ShouldRemoveDecimalsFromCurrencyTheValueProperly_WhenCurrencyHas3Decimals() {
        when(commonI18NServiceMock.convertAndRoundCurrency(1, Math.pow(10, 3), 0, BHD_AMOUNT)).thenReturn(12323d);

        final Long amount = testObj.removeDecimalsFromCurrencyAmount(BHD, BHD_AMOUNT);

        assertThat(amount).isEqualTo(CHECKOUTCOM_AMOUNT);
    }

    @Test(expected = IllegalArgumentException.class)
    public void addDecimalsToAmountForGivenCurrency_WhenTheCurrencyCodeNull_ShouldThrowException() {
        testObj.addDecimalsToAmountForGivenCurrency(null, CHECKOUTCOM_AMOUNT);
    }


    @Test(expected = IllegalArgumentException.class)
    public void addDecimalsToAmountFromPennies_WhenTheAmountNull_ShouldThrowException() {
        testObj.addDecimalsToAmountForGivenCurrency(GBP, null);
    }

    @Test
    public void convertAmountFromPennies_WhenThePaymentResponseValud_ShouldAddDecimalsToTheValueProperly() {
        final BigDecimal result = testObj.addDecimalsToAmountForGivenCurrency(GBP, CHECKOUTCOM_AMOUNT);

        assertEquals(result, BigDecimal.valueOf(GBP_AMOUNT));
    }

    @Test
    public void convertAmountFromPennies_WhenThePaymentResponseValueAndCurrancyHasThreeDecimals_ShouldAddDecimalsToTheValueProperly() {
        final BigDecimal result = testObj.addDecimalsToAmountForGivenCurrency(BHD, CHECKOUTCOM_AMOUNT);

        assertEquals(result, BigDecimal.valueOf(BHD_AMOUNT));
    }
}
