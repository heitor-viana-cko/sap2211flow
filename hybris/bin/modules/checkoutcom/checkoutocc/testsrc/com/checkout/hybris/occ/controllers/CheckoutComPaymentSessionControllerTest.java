package com.checkout.hybris.occ.controllers;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.facades.flow.CheckoutComFlowPaymentSessionFacade;
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
class CheckoutComPaymentSessionControllerTest {

    private static final String BASE_SITE_ID = "baseSiteId";

    @InjectMocks
    private CheckoutComPaymentSessionController testObj;

    @Mock
    private CheckoutComFlowPaymentSessionFacade checkoutComFlowPaymentSessionFacadeMock;
    @Mock
    private CheckoutComPaymentSessionResponseDTO checkoutComPaymentSessionResponseDTOMock;

    @Test
    void createPaymentSession_shouldReturnPaymentSessionAsResponseBody_WhenPaymentSessionIsCreated() {
        when(checkoutComFlowPaymentSessionFacadeMock.createPaymentSession(BASE_SITE_ID)).thenReturn(checkoutComPaymentSessionResponseDTOMock);

        final ResponseEntity<CheckoutComPaymentSessionResponseDTO> result = testObj.createPaymentSession(BASE_SITE_ID);

        assertThat(result).isNotNull();
        assertThat(result.getBody()).isEqualTo(checkoutComPaymentSessionResponseDTOMock);
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void createPaymentSession_shouldReturnNullAsResponseBody_WhenItIsNotPossibleToCreatePaymentSession() {
        when(checkoutComFlowPaymentSessionFacadeMock.createPaymentSession(BASE_SITE_ID)).thenReturn(null);

        final ResponseEntity<CheckoutComPaymentSessionResponseDTO> result = testObj.createPaymentSession(BASE_SITE_ID);

        assertThat(result).isNotNull();
        assertThat(result.getBody()).isEqualTo(null);
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
