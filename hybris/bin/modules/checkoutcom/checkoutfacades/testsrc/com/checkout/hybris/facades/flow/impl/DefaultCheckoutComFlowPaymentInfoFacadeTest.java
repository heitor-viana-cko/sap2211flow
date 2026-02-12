package com.checkout.hybris.facades.flow.impl;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.AlternativePaymentSourceResponse;
import com.checkout.payments.response.source.CardResponseSource;
import com.checkout.payments.response.source.CurrencyAccountResponseSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
class DefaultCheckoutComFlowPaymentInfoFacadeTest {

    @Mock
    private CartService cartServiceMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;
    @Mock
    private Converter<GetPaymentResponse, CheckoutComCreditCardPaymentInfoModel> ccConverterMock;
    @Mock
    private Converter<GetPaymentResponse, CheckoutComAPMPaymentInfoModel> apmConverterMock;
    @Mock
    private CartModel cartModelMock;
    @Mock
    private GetPaymentResponse paymentResponseMock;
    @Mock
    private CardResponseSource cardSourceMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel ccPaymentInfoMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel apmPaymentInfoMock;
    @Mock
    private PaymentInfoModel paymentInfoModelMock;
    @Mock
    private AlternativePaymentSourceResponse alternativePaymentSourceResponseMock;
    @Mock
    private CurrencyAccountResponseSource currencyAccountResponseSourceMock;

    @Spy
    @InjectMocks
    private DefaultCheckoutComFlowPaymentInfoFacade testObj;

    @BeforeEach
    void setUp() {
        testObj = new DefaultCheckoutComFlowPaymentInfoFacade(cartServiceMock, paymentInfoServiceMock,
                ccConverterMock, apmConverterMock);
    }

    @Test
    void addPaymentInfoToCart_shouldUseCCConverter_whenSourceIsCard() {
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(paymentResponseMock.getSource()).thenReturn(cardSourceMock);
        when(ccConverterMock.convert(paymentResponseMock)).thenReturn(ccPaymentInfoMock);

        testObj.addPaymentInfoToCart(paymentResponseMock);

        verify(paymentInfoServiceMock).createPaymentInfo(ccPaymentInfoMock, cartModelMock);
        verify(apmConverterMock, never()).convert(any());
    }

    @Test
    void addPaymentInfoToCart_shouldRemoveExistingPaymentInfo() {
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(cartModelMock.getPaymentInfo()).thenReturn(paymentInfoModelMock);
        when(paymentResponseMock.getSource()).thenReturn(alternativePaymentSourceResponseMock);
        when(apmConverterMock.convert(paymentResponseMock)).thenReturn(apmPaymentInfoMock);

        testObj.addPaymentInfoToCart(paymentResponseMock);

        verify(paymentInfoServiceMock).removePaymentInfo(cartModelMock);
        verify(paymentInfoServiceMock).createPaymentInfo(apmPaymentInfoMock, cartModelMock);
    }

    @Test
    void addPaymentInfoToCart_shouldDoNothing_whenNoSessionCart() {
        when(cartServiceMock.hasSessionCart()).thenReturn(false);

        testObj.addPaymentInfoToCart(paymentResponseMock);

        verify(paymentInfoServiceMock, never()).createPaymentInfo(any(), any());
        verify(paymentInfoServiceMock, never()).removePaymentInfo(any());
    }

    @Test
    void addPaymentInfoToCart_shouldUseAPMConverter_whenSourceIsAlternativePaymentSourceResponse() {
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(paymentResponseMock.getSource()).thenReturn(alternativePaymentSourceResponseMock);
        when(apmConverterMock.convert(paymentResponseMock)).thenReturn(apmPaymentInfoMock);

        testObj.addPaymentInfoToCart(paymentResponseMock);

        verify(paymentInfoServiceMock).createPaymentInfo(apmPaymentInfoMock, cartModelMock);
        verify(ccConverterMock, never()).convert(any());
    }

    @Test
    void addPaymentInfoToCart_shouldThrowException_whenSourceTypeIsUnsupported() {
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(paymentResponseMock.getSource()).thenReturn(currencyAccountResponseSourceMock);

        Assertions.assertThrows(IllegalArgumentException.class, () -> testObj.addPaymentInfoToCart(paymentResponseMock));
    }
}