package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.OXXO;
import static de.hybris.platform.testframework.Assert.assertEquals;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComOxxoPaymentRequestStrategyTest {

    @InjectMocks
    private CheckoutComOxxoPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartModelMock;

    @Test
    public void getStrategyKey_ShouldReturnOxxo() {
        final CheckoutComPaymentType result = testObj.getStrategyKey();

        assertEquals(result, OXXO);
    }

    @Test
    public void getRequestSourcePaymentRequest_ShouldSetRequiredAttributes() {
        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartModelMock, "GBP", 1000L))
            .isInstanceOf(UnsupportedOperationException.class);
    }
}
