package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComKlarnaAPMPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.KLARNA;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComKlarnaPaymentResponseStrategyTest {

    private static final String PAYMENT_ID = "paymentId";

    @InjectMocks
    private CheckoutComKlarnaPaymentResponseStrategy testObj;

    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private CheckoutComKlarnaAPMPaymentInfoModel klarnaPaymentInfoMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;

    @Test
    public void getStrategyKey_ShouldReturnAchPaymentType() {
        assertEquals(KLARNA, testObj.getStrategyKey());
    }

    @Test
    public void handlePendingPaymentResponse_WhenKlarna_ShouldReturnAuthorizeResponseSuccess() {
        when(paymentResponseMock.getId()).thenReturn(PAYMENT_ID);
        doNothing().when(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, klarnaPaymentInfoMock);

        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(paymentResponseMock, klarnaPaymentInfoMock);

        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, klarnaPaymentInfoMock);
        assertFalse(result.getIsRedirect());
        assertTrue(result.getIsDataRequired());
        assertTrue(result.getIsSuccess());
        assertNull(result.getRedirectUrl());
    }

}
