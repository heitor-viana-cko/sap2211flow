package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.PAYPAL;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComPayPalPaymentRequestStrategyTest {

    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String PAYMENT_REFERENCE_VALUE = "payment-reference";

    @InjectMocks
    private CheckoutComPayPalPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComRedirectAPMPaymentInfoMock;

    @Before
    public void setUp() {
        lenient().when(cartMock.getPaymentInfo()).thenReturn(checkoutComRedirectAPMPaymentInfoMock);
        lenient().when(cartMock.getCheckoutComPaymentReference()).thenReturn(PAYMENT_REFERENCE_VALUE);
        lenient().when(checkoutComRedirectAPMPaymentInfoMock.getType()).thenReturn(PAYPAL.name());
    }

    @Test
    public void getStrategyKey_WhenPayPal_ShouldReturnPayPalType() {
        assertEquals(PAYPAL, testObj.getStrategyKey());
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPayPalPayment_ShouldCreateAlternativePaymentRequestWithType() {
        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(PAYPAL.name().toLowerCase(), result.getSource().getType().name().toLowerCase());

    }

    @Test(expected = IllegalArgumentException.class)
    public void getRequestSourcePaymentRequest_WhenPayPalPaymentButCartIsNull_ShouldThrowException() {
        testObj.getRequestSourcePaymentRequest(null, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);
    }
}
