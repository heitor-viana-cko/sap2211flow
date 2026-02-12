package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.model.CheckoutComKlarnaAPMPaymentInfoModel;

import com.checkout.payments.request.PaymentRequest;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.KLARNA;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComKlarnaPaymentRequestStrategyTest {

    private static final String CURRENCY_ISO_CODE = "EUR";
    private static final String KLARNA_PAYMENT_CONTEXT_VALUE = "klarna_context";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;

    @InjectMocks
    private CheckoutComKlarnaPaymentRequestStrategy testObj;

    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
    @Mock
    private CheckoutComCurrencyService checkoutComCurrencyServiceMock;
    @Mock
    private CartModel cartModelMock;

    @Mock
    private CheckoutComKlarnaAPMPaymentInfoModel klarnaPaymentInfoMock;

    @Before
    public void setUp() {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComCurrencyService", checkoutComCurrencyServiceMock);
        when(cartModelMock.getPaymentInfo()).thenReturn(klarnaPaymentInfoMock);
        when(klarnaPaymentInfoMock.getPaymentContext()).thenReturn(KLARNA_PAYMENT_CONTEXT_VALUE);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenEverythingIsCorrect_ShouldPopulateTheRequest() {
        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartModelMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(KLARNA_PAYMENT_CONTEXT_VALUE, result.getPaymentContextId());
    }

    @Test
    public void isCapture_WhenKlarna_ShouldReturnFalse() {
        assertFalse(testObj.isCapture().get());
    }

    @Test
    public void getStrategyKey_WhenKlarna_ShouldReturnKlarnaType() {
        assertEquals(KLARNA, testObj.getStrategyKey());
    }
}
