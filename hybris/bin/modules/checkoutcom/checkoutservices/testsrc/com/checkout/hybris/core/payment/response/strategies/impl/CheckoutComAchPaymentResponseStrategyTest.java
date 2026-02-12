package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.ACH;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComAchPaymentResponseStrategyTest {

    private static final String PAYMENT_ID = "paymentId";

    @InjectMocks
    private CheckoutComAchPaymentResponseStrategy testObj;

    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private CheckoutComAchPaymentInfoModel achPaymentInfoMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;

    @Test
    public void getStrategyKey_ShouldReturnAchPaymentType() {
        assertEquals(ACH, testObj.getStrategyKey());
    }

    @Test
    public void handlePendingPaymentResponse_WhenAch_ShouldReturnAuthorizeResponseSuccess() {
        when(paymentResponseMock.getId()).thenReturn(PAYMENT_ID);
        doNothing().when(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, achPaymentInfoMock);

        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(paymentResponseMock, achPaymentInfoMock);

        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, achPaymentInfoMock);
        assertFalse(result.getIsRedirect());
        assertTrue(result.getIsDataRequired());
        assertTrue(result.getIsSuccess());
        assertNull(result.getRedirectUrl());
    }
}
