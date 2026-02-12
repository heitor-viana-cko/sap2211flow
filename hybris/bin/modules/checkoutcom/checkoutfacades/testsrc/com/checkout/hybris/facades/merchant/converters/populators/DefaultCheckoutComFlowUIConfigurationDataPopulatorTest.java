package com.checkout.hybris.facades.merchant.converters.populators;

import com.checkout.hybris.core.model.CheckoutComFlowAroundUIConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComFlowElementUIConfigModel;
import com.checkout.hybris.core.model.CheckoutComFlowUIConfigurationModel;
import com.checkout.hybris.facades.beans.CheckoutComFlowAroundUIConfigurationData;
import com.checkout.hybris.facades.beans.CheckoutComFlowElementUIConfigData;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
class DefaultCheckoutComFlowUIConfigurationDataPopulatorTest {

    private DefaultCheckoutComFlowUIConfigurationDataPopulator testObj;

    @Mock
    private Converter<CheckoutComFlowElementUIConfigModel, CheckoutComFlowElementUIConfigData> checkoutComFlowElementUIConfigConverterMock;

    @Mock
    private Converter<CheckoutComFlowAroundUIConfigurationModel, CheckoutComFlowAroundUIConfigurationData> checkoutComFlowAroundUIConfigurationDataConverterMock;

    @Mock
    private CheckoutComFlowUIConfigurationModel checkoutComFlowUIConfigurationModelMock;

    @Mock
    private CheckoutComFlowElementUIConfigData buttonDataMock, footNoteDataMock, labelDataMock, subheadingDataMock;

    @Mock
    private CheckoutComFlowElementUIConfigModel buttonModelMock, footNoteModelMock, labelModelMock, subheadingModelMock;
    @Mock
    private CheckoutComFlowAroundUIConfigurationModel borderRadiusModelMock;
    @Mock
    private CheckoutComFlowAroundUIConfigurationData borderRadiusDataMock;

    @BeforeEach
    void setUp() {
        testObj = new DefaultCheckoutComFlowUIConfigurationDataPopulator(checkoutComFlowElementUIConfigConverterMock, checkoutComFlowAroundUIConfigurationDataConverterMock);
    }

    @Test
    void populate_shouldSetAllPropertiesForColoursOnTarget() {
        final CheckoutComFlowUIConfigurationData result = new CheckoutComFlowUIConfigurationData();

        when(checkoutComFlowUIConfigurationModelMock.getColorAction()).thenReturn("colorAction");
        when(checkoutComFlowUIConfigurationModelMock.getColorBackground()).thenReturn("colorBackground");
        when(checkoutComFlowUIConfigurationModelMock.getColorBorder()).thenReturn("colorBorder");
        when(checkoutComFlowUIConfigurationModelMock.getColorDisabled()).thenReturn("colorDisabled");
        when(checkoutComFlowUIConfigurationModelMock.getColorError()).thenReturn("colorError");
        when(checkoutComFlowUIConfigurationModelMock.getColorFormBackground()).thenReturn("colorFormBackground");
        when(checkoutComFlowUIConfigurationModelMock.getColorFormBorder()).thenReturn("colorFormBorder");
        when(checkoutComFlowUIConfigurationModelMock.getColorInverse()).thenReturn("colorInverse");
        when(checkoutComFlowUIConfigurationModelMock.getColorOutline()).thenReturn("colorOutline");
        when(checkoutComFlowUIConfigurationModelMock.getColorPrimary()).thenReturn("colorPrimary");

        when(checkoutComFlowUIConfigurationModelMock.getButton()).thenReturn(buttonModelMock);
        when(checkoutComFlowUIConfigurationModelMock.getFootnote()).thenReturn(footNoteModelMock);
        when(checkoutComFlowUIConfigurationModelMock.getLabel()).thenReturn(labelModelMock);
        when(checkoutComFlowUIConfigurationModelMock.getSubheading()).thenReturn(subheadingModelMock);
        when(checkoutComFlowElementUIConfigConverterMock.convert(buttonModelMock)).thenReturn(buttonDataMock);
        when(checkoutComFlowElementUIConfigConverterMock.convert(footNoteModelMock)).thenReturn(footNoteDataMock);
        when(checkoutComFlowElementUIConfigConverterMock.convert(labelModelMock)).thenReturn(labelDataMock);
        when(checkoutComFlowElementUIConfigConverterMock.convert(subheadingModelMock)).thenReturn(subheadingDataMock);

        when(checkoutComFlowUIConfigurationModelMock.getBorderRadius()).thenReturn(borderRadiusModelMock);
        when(checkoutComFlowAroundUIConfigurationDataConverterMock.convert(borderRadiusModelMock)).thenReturn(borderRadiusDataMock);

        testObj.populate(checkoutComFlowUIConfigurationModelMock, result);

        assertThat(result.getColorAction()).isEqualTo("colorAction");
        assertThat(result.getColorBackground()).isEqualTo("colorBackground");
        assertThat(result.getColorBorder()).isEqualTo("colorBorder");
        assertThat(result.getColorDisabled()).isEqualTo("colorDisabled");
        assertThat(result.getColorError()).isEqualTo("colorError");
        assertThat(result.getColorFormBackground()).isEqualTo("colorFormBackground");
        assertThat(result.getColorFormBorder()).isEqualTo("colorFormBorder");
        assertThat(result.getColorInverse()).isEqualTo("colorInverse");
        assertThat(result.getColorOutline()).isEqualTo("colorOutline");
        assertThat(result.getColorPrimary()).isEqualTo("colorPrimary");
        assertThat(result.getBorderRadius()).isEqualTo(borderRadiusDataMock);
        assertThat(result.getButton()).isEqualTo(buttonDataMock);
        assertThat(result.getFootnote()).isEqualTo(footNoteDataMock);
        assertThat(result.getLabel()).isEqualTo(labelDataMock);
        assertThat(result.getSubheading()).isEqualTo(subheadingDataMock);
    }

    @Test
    void populate_shouldSetAllPropertiesForColoursOnTarget_checkingNullValues() {
        final CheckoutComFlowUIConfigurationData result = new CheckoutComFlowUIConfigurationData();

        when(checkoutComFlowUIConfigurationModelMock.getColorAction()).thenReturn("colorAction");
        when(checkoutComFlowUIConfigurationModelMock.getColorBackground()).thenReturn("colorBackground");
        when(checkoutComFlowUIConfigurationModelMock.getColorBorder()).thenReturn("colorBorder");
        when(checkoutComFlowUIConfigurationModelMock.getColorDisabled()).thenReturn("colorDisabled");
        when(checkoutComFlowUIConfigurationModelMock.getColorError()).thenReturn("colorError");
        when(checkoutComFlowUIConfigurationModelMock.getColorFormBackground()).thenReturn("colorFormBackground");
        when(checkoutComFlowUIConfigurationModelMock.getColorFormBorder()).thenReturn("colorFormBorder");
        when(checkoutComFlowUIConfigurationModelMock.getColorInverse()).thenReturn("colorInverse");
        when(checkoutComFlowUIConfigurationModelMock.getColorOutline()).thenReturn("colorOutline");
        when(checkoutComFlowUIConfigurationModelMock.getColorPrimary()).thenReturn("colorPrimary");

        when(checkoutComFlowUIConfigurationModelMock.getButton()).thenReturn(null);
        when(checkoutComFlowUIConfigurationModelMock.getFootnote()).thenReturn(null);
        when(checkoutComFlowUIConfigurationModelMock.getLabel()).thenReturn(null);
        when(checkoutComFlowUIConfigurationModelMock.getSubheading()).thenReturn(null);
        when(checkoutComFlowUIConfigurationModelMock.getBorderRadius()).thenReturn(null);

        testObj.populate(checkoutComFlowUIConfigurationModelMock, result);

        assertThat(result.getColorAction()).isEqualTo("colorAction");
        assertThat(result.getColorBackground()).isEqualTo("colorBackground");
        assertThat(result.getColorBorder()).isEqualTo("colorBorder");
        assertThat(result.getColorDisabled()).isEqualTo("colorDisabled");
        assertThat(result.getColorError()).isEqualTo("colorError");
        assertThat(result.getColorFormBackground()).isEqualTo("colorFormBackground");
        assertThat(result.getColorFormBorder()).isEqualTo("colorFormBorder");
        assertThat(result.getColorInverse()).isEqualTo("colorInverse");
        assertThat(result.getColorOutline()).isEqualTo("colorOutline");
        assertThat(result.getColorPrimary()).isEqualTo("colorPrimary");
        assertThat(result.getBorderRadius()).isNull();
        assertThat(result.getButton()).isNull();
        assertThat(result.getFootnote()).isNull();
        assertThat(result.getLabel()).isNull();
        assertThat(result.getSubheading()).isNull();

        verify(checkoutComFlowElementUIConfigConverterMock, never()).convert(any(CheckoutComFlowElementUIConfigModel.class));
        verify(checkoutComFlowAroundUIConfigurationDataConverterMock, never()).convert(any(CheckoutComFlowAroundUIConfigurationModel.class));
    }
}
