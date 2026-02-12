package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.common.Link;
import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@UnitTest
@ExtendWith(MockitoExtension.class)
public class DefaultCheckoutComPaymentResponseStrategyTest {

    private static final String REDIRECT_LINK = "https://test.com";
    private static final String PAYMENT_ID = "paymentId";

    @InjectMocks
    private DefaultCheckoutComPaymentResponseStrategy testObj;

    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private Link linkMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel apmPaymentInfoMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel paymentInfoMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;

    @Test
    public void getRedirectUrl_WheGenericApm_ShouldReturnAuthorizeResponseCorrectlyPopulated() {
        when(apmPaymentInfoMock.getUserDataRequired()).thenReturn(false);
        when(apmPaymentInfoMock.getItemtype()).thenReturn(CheckoutComAPMPaymentInfoModel._TYPECODE);
        when(paymentResponseMock.getLink("redirect")).thenReturn(linkMock);
        when(linkMock.getHref()).thenReturn(REDIRECT_LINK);
        when(paymentResponseMock.getId()).thenReturn(PAYMENT_ID);

        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(paymentResponseMock, apmPaymentInfoMock);

        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, apmPaymentInfoMock);
        assertFalse(result.getIsDataRequired());
        assertTrue(result.getIsRedirect());
        assertTrue(result.getIsSuccess());
        assertEquals(REDIRECT_LINK, result.getRedirectUrl());
    }

    @Test
    public void getRedirectUrl_WheCardPayment_ShouldReturnAuthorizeResponseCorrectlyPopulated() {
        when(paymentInfoMock.getItemtype()).thenReturn(CheckoutComCreditCardPaymentInfoModel._TYPECODE);
        when(paymentResponseMock.getLink("redirect")).thenReturn(linkMock);
        when(linkMock.getHref()).thenReturn(REDIRECT_LINK);
        when(paymentResponseMock.getId()).thenReturn(PAYMENT_ID);

        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(paymentResponseMock, paymentInfoMock);

        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, paymentInfoMock);
        assertTrue(result.getIsDataRequired());
        assertTrue(result.getIsRedirect());
        assertTrue(result.getIsSuccess());
        assertEquals(REDIRECT_LINK, result.getRedirectUrl());
    }

    @Test
    public void getRedirectUrl_WhenPendingResponseNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.handlePendingPaymentResponse(null, apmPaymentInfoMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRedirectUrl_WhenPaymentInfoIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.handlePendingPaymentResponse(paymentResponseMock, null)).isInstanceOf(IllegalArgumentException.class);
    }
}
