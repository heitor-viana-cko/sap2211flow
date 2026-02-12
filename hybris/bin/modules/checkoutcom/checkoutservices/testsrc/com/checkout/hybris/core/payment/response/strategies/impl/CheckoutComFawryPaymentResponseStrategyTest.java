package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComFawryPaymentInfoModel;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.FAWRY;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.Assert.assertEquals;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComFawryPaymentResponseStrategyTest {

    @InjectMocks
    private CheckoutComFawryPaymentResponseStrategy testObj;

    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private CheckoutComFawryPaymentInfoModel fawryPaymentInfoMock;

    @Test
    public void getStrategyKey_ShouldReturnFawryPaymentType() {
        assertEquals(FAWRY, testObj.getStrategyKey());
    }

    @Test
    public void handlePendingPaymentResponse_WhenFawry_ShouldReturnAuthorizeResponseSuccess() {
        assertThatThrownBy(() -> testObj.handlePendingPaymentResponse(paymentResponseMock, fawryPaymentInfoMock)).
            isInstanceOf(UnsupportedOperationException.class);

    }
}
