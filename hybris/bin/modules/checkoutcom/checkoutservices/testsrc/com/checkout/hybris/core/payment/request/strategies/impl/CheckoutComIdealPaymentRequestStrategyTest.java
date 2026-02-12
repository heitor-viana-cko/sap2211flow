package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComIdealPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestIdealSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.IDEAL;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComIdealPaymentRequestStrategyTest {

    private static final String PAYMENT_REFERENCE = "payment-refer-.,;[enc[]e";
    private static final String CURRENCY_ISO_CODE = "BRL";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;

    @InjectMocks
    private CheckoutComIdealPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComIdealPaymentInfoModel idealPaymentInfoMock;

    @Test
    public void getRequestSourcePaymentRequest_WhenIdealPayment_ShouldCreateAlternativePaymentRequestWithTypeAndAdditionalInfo() {
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(PAYMENT_REFERENCE);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(IDEAL.name().toLowerCase(), result.getSource().getType().name().toLowerCase());
        assertEquals(PAYMENT_REFERENCE, ((RequestIdealSource) result.getSource()).getDescription());
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPaymentReferenceMoreThan35CharWhenFormatted_shouldThrowException() {
        when(cartMock.getCheckoutComPaymentReference()).thenReturn("");

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getStrategyKey_WhenIdeal_ShouldReturnIdealType() {
        assertEquals(IDEAL, testObj.getStrategyKey());
    }
}
