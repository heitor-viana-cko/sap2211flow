package com.checkout.hybris.facades.flow.impl;

import com.checkout.hybris.core.model.CheckoutComFlowUIConfigurationModel;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.basecommerce.model.site.BaseSiteModel;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import de.hybris.platform.site.BaseSiteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
class DefaultCheckoutComFlowConfigurationFacadeTest {

    public static final String BASE_SITE_ID = "baseSiteId";
    @Spy
    @InjectMocks
    private DefaultCheckoutComFlowConfigurationFacade testObj;

    @Mock
    private Converter<CheckoutComFlowUIConfigurationModel, CheckoutComFlowUIConfigurationData> checkoutComFlowUIConfigurationConverterMock;

    @Mock
    private BaseSiteService baseSiteServiceMock;
    @Mock
    private BaseSiteModel baseSiteModelMock;
    @Mock
    private CheckoutComFlowUIConfigurationModel flowUiConfigurationModelMock;
    @Mock
    private CheckoutComFlowUIConfigurationData flowUiConfigurationDataMock;

    @Test
    void isFlowEnabled_ShouldReturnFalse_WhenFlowIsNotEnabled() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(false);

        boolean result = testObj.isFlowEnabled(BASE_SITE_ID);

        assertThat(result).isFalse();
    }

    @Test
    void isFlowEnabled_ShouldReturnTrue_WhenFlowIsEnabled() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);

        boolean result = testObj.isFlowEnabled(BASE_SITE_ID);

        assertThat(result).isTrue();
    }

    @Test
    void isFlowEnabled_ShouldReturnFalse_WhenFlowIsNull() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(null);

        boolean result = testObj.isFlowEnabled(BASE_SITE_ID);

        assertThat(result).isFalse();
    }

    @Test
    void isFlowEnabledForCurrentBaseSite_ShouldReturnTrue_WhenBaseSiteHasFlowEnabled() {
        when(baseSiteServiceMock.getCurrentBaseSite()).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);

        boolean result = testObj.isFlowEnabled();

        assertThat(result).isTrue();
    }

    @Test
    void isFlowEnabledForCurrentBaseSite_ShouldReturnFalseWhenBaseSiteHasFlowDisabled() {
        when(baseSiteServiceMock.getCurrentBaseSite()).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(false);

        boolean result = testObj.isFlowEnabled();

        assertThat(result).isFalse();
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnFlowUIConfigurationDataForGivenSite_WhenFlowEnabled_AndConfigurationExists() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);
        when(baseSiteModelMock.getFlowUIConfiguration()).thenReturn(flowUiConfigurationModelMock);
        when(checkoutComFlowUIConfigurationConverterMock.convert(flowUiConfigurationModelMock)).thenReturn(flowUiConfigurationDataMock);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData(BASE_SITE_ID);

        assertThat(result).isEqualTo(flowUiConfigurationDataMock);
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnNull_WhenFlowIsEnabledForGivenSite_ButThereIsNoFlowUIConfiguration() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);
        when(baseSiteModelMock.getFlowUIConfiguration()).thenReturn(null);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData(BASE_SITE_ID);

        assertThat(result).isNull();
        verify(checkoutComFlowUIConfigurationConverterMock, never()).convert(flowUiConfigurationModelMock);
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnNull_WhenNoFlowConfiguration() {
        when(baseSiteServiceMock.getBaseSiteForUID(BASE_SITE_ID)).thenReturn(baseSiteModelMock);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData(BASE_SITE_ID);

        assertThat(result).isNull();
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnFlowUIConfigurationDataForCurrentBaseSite() {
        when(baseSiteServiceMock.getCurrentBaseSite()).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);
        when(baseSiteModelMock.getFlowUIConfiguration()).thenReturn(flowUiConfigurationModelMock);
        when(checkoutComFlowUIConfigurationConverterMock.convert(flowUiConfigurationModelMock)).thenReturn(flowUiConfigurationDataMock);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData();

        assertThat(result).isEqualTo(flowUiConfigurationDataMock);
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnNull_WhenFlowIsNotEnabledForCurrentBaseSite() {
        when(baseSiteServiceMock.getCurrentBaseSite()).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(false);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData();

        assertThat(result).isNull();
        verify(checkoutComFlowUIConfigurationConverterMock, never()).convert(flowUiConfigurationModelMock);
    }

    @Test
    void getCheckoutComFlowUIConfigurationData_shouldReturnNull_WhenFlowIsEnabledForCurrentBaseSite_ButThereIsNoFlowUIConfiguration() {
        when(baseSiteServiceMock.getCurrentBaseSite()).thenReturn(baseSiteModelMock);
        when(baseSiteModelMock.getFlow()).thenReturn(true);
        when(baseSiteModelMock.getFlowUIConfiguration()).thenReturn(null);

        final CheckoutComFlowUIConfigurationData result = testObj.getCheckoutComFlowUIConfigurationData();

        assertThat(result).isNull();
        verify(checkoutComFlowUIConfigurationConverterMock, never()).convert(flowUiConfigurationModelMock);
    }

}
