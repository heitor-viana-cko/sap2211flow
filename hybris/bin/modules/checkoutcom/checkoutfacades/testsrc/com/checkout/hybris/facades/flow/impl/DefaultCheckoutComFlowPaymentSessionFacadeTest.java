package com.checkout.hybris.facades.flow.impl;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.core.flow.impl.DefaultCheckoutComFlowPaymentSessionService;
import com.checkout.hybris.facades.flow.CheckoutComFlowConfigurationFacade;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
class DefaultCheckoutComFlowPaymentSessionFacadeTest {

    public static final String BASE_SITE_ID = "baseSiteId";

    @InjectMocks
    private DefaultCheckoutComFlowPaymentSessionFacade testObj;

    @Mock
    private DefaultCheckoutComFlowPaymentSessionService checkoutComFlowPaymentSessionServiceMock;
    @Mock
    private CheckoutComFlowConfigurationFacade checkoutComFlowConfigurationFacadeMock;
    @Mock
    private Converter<PaymentSessionResponse, CheckoutComPaymentSessionResponseDTO> paymentSessionResponseConverterMock;

    @Mock
    private PaymentSessionResponse paymentSessionMock;

    @Mock
    private CheckoutComPaymentSessionResponseDTO paymentSessionResponseDTOMock;

    @Test
    void createPaymentSessionForGivenBaseSiteId_shouldReturnCreatedPaymentSession() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled(BASE_SITE_ID)).thenReturn(true);
        when(checkoutComFlowPaymentSessionServiceMock.createPaymentSession()).thenReturn(paymentSessionMock);
        when(paymentSessionResponseConverterMock.convert(paymentSessionMock)).thenReturn(paymentSessionResponseDTOMock);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession(BASE_SITE_ID);

        assertThat(result).isEqualTo(paymentSessionResponseDTOMock);
    }

    @Test
    void createPaymentSessionForGivenBaseSiteId_shouldReturnNullWhenPaymentSessionIsNull() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled(BASE_SITE_ID)).thenReturn(true);
        when(checkoutComFlowPaymentSessionServiceMock.createPaymentSession()).thenReturn(null);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession(BASE_SITE_ID);

        assertThat(result).isNull();
        verify(paymentSessionResponseConverterMock, never()).convert(any(PaymentSessionResponse.class));
    }

    @Test
    void createPaymentSessionForGivenBaseSiteId_shouldReturnNullWhenFlowIsNotConfiguredForGivenBaseSiteId() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled(BASE_SITE_ID)).thenReturn(false);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession(BASE_SITE_ID);

        assertThat(result).isNull();
        verify(checkoutComFlowPaymentSessionServiceMock, never()).createPaymentSession();
    }

    @Test
    void createPaymentSession_shouldReturnCreatedPaymentSession() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled()).thenReturn(true);
        when(checkoutComFlowPaymentSessionServiceMock.createPaymentSession()).thenReturn(paymentSessionMock);
        when(paymentSessionResponseConverterMock.convert(paymentSessionMock)).thenReturn(paymentSessionResponseDTOMock);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession();

        assertThat(result).isEqualTo(paymentSessionResponseDTOMock);
    }

    @Test
    void createPaymentSession_shouldReturnNullWhenPaymentSessionIsNull() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled()).thenReturn(true);
        when(checkoutComFlowPaymentSessionServiceMock.createPaymentSession()).thenReturn(null);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession();

        assertThat(result).isNull();
        verify(paymentSessionResponseConverterMock, never()).convert(any(PaymentSessionResponse.class));
    }

    @Test
    void createPaymentSession_shouldReturnNullWhenFloIsNotEnabledOnCurrentBaseSite() {
        when(checkoutComFlowConfigurationFacadeMock.isFlowEnabled()).thenReturn(false);

        final CheckoutComPaymentSessionResponseDTO result = testObj.createPaymentSession();

        assertThat(result).isNull();
        verify(checkoutComFlowPaymentSessionServiceMock, never()).createPaymentSession();
    }
}
