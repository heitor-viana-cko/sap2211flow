package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestEpsSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.EPS;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComEpsPaymentRequestStrategyTest {

    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String PAYMENT_REFERENCE_VALUE = "payment-reference";

    @InjectMocks
    private CheckoutComEpsPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComAPMPaymentInfoMock;

    @Test
    public void getStrategyKey_WhenEps_ShouldReturnEpsType() {
        assertEquals(EPS, testObj.getStrategyKey());
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenEpsPayment_ShouldCreateAlternativePaymentRequestWithTypeAndPurpose() {
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(PAYMENT_REFERENCE_VALUE);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(EPS.name().toLowerCase(), result.getSource().getType().name().toLowerCase());
        assertEquals(PAYMENT_REFERENCE_VALUE, ((RequestEpsSource) result.getSource()).getPurpose());
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenEpsPaymentButCartIsNull_ShouldThrowException() {

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(null, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE))
            .isInstanceOf(IllegalArgumentException.class);

    }

    @Test
    public void getRequestSourcePaymentRequest_WhenEpsPaymentButPaymentReferenceIsBlank_ShouldThrowException() {
        when(cartMock.getCheckoutComPaymentReference()).thenReturn("");

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
