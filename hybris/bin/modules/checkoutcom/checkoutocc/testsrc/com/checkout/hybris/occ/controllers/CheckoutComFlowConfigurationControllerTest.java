package com.checkout.hybris.occ.controllers;

import com.checkout.dto.flow.configuration.FlowEnabledDataResponseDTO;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import com.checkout.hybris.facades.flow.CheckoutComFlowConfigurationFacade;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
class CheckoutComFlowConfigurationControllerTest {

    private static final String BASE_SITE_ID = "baseSiteId";

    @InjectMocks
    private CheckoutComFlowConfigurationController testObj;

    @Mock
    private CheckoutComFlowConfigurationFacade checkoutComFlowConfigurationFacadeMock;
    @Mock
    private CheckoutComFlowUIConfigurationData checkoutComFlowUIConfigurationDataMock;

    @Test
    void getFlowEnabled_shouldReturnFlowEnabledDataResponseDTOWithEnabledTrue_WhenFlowIsEnabled_AndHTTP20OK() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled(BASE_SITE_ID)).thenReturn(true);

        final ResponseEntity<FlowEnabledDataResponseDTO> response = testObj.getFlowEnabled(BASE_SITE_ID);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isEnabled()).isTrue();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getFlowEnabled_shouldReturnFlowEnabledDataResponseDTOWithEnabledFalse_WhenFlowIsDisabled_AndHTTP20OK() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled(BASE_SITE_ID)).thenReturn(false);

        final ResponseEntity<FlowEnabledDataResponseDTO> response = testObj.getFlowEnabled(BASE_SITE_ID);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isEnabled()).isFalse();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getFlowConfiguration_shouldReturnFlowConfigurationData_whenThereIsOne_andHTTP20OK() {
        when(checkoutComFlowConfigurationFacadeMock.getCheckoutComFlowUIConfigurationData(BASE_SITE_ID)).thenReturn(checkoutComFlowUIConfigurationDataMock);

        final ResponseEntity<CheckoutComFlowUIConfigurationData> result = testObj.getFlowConfiguration(BASE_SITE_ID);

        assertThat(result.getBody()).isEqualTo(checkoutComFlowUIConfigurationDataMock);
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getFlowConfiguration_shouldReturn404NotFound_whenThereIsNoConfigurationData() {
        when(checkoutComFlowConfigurationFacadeMock.getCheckoutComFlowUIConfigurationData(BASE_SITE_ID)).thenReturn(null);

        final ResponseEntity<CheckoutComFlowUIConfigurationData> result = testObj.getFlowConfiguration(BASE_SITE_ID);

        assertThat(result.getBody()).isEqualTo(null);
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
