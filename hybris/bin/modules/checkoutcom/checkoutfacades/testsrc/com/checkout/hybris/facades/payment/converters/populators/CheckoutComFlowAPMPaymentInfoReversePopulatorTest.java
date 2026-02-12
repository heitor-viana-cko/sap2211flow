package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.common.PaymentSourceType;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.ResponseSource;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
class CheckoutComFlowAPMPaymentInfoReversePopulatorTest {

    @InjectMocks
    private CheckoutComFlowAPMPaymentInfoReversePopulator testObj;

    @Mock
    private GetPaymentResponse sourceMock;
    @Mock
    private ResponseSource sourceInfoMock;
    @Mock
    private PaymentSourceType sourceTypeMock;

    @Test
    void populate_shouldThrowException_whenSourceIsNull() {
        final CheckoutComAPMPaymentInfoModel target = new CheckoutComAPMPaymentInfoModel();
        assertThrows(IllegalArgumentException.class, () -> testObj.populate(null, target));
    }

    @Test
    void populate_shouldThrowException_whenTargetIsNull() {
        final GetPaymentResponse source = mock(GetPaymentResponse.class);
        assertThrows(IllegalArgumentException.class, () -> testObj.populate(source, null));
    }

    @Test
    void populate_shouldSetPaymentIdAndDeferred() {
        when(sourceMock.getId()).thenReturn("paymentId");
        when(sourceMock.getSource()).thenReturn(null);

        final CheckoutComAPMPaymentInfoModel target = new CheckoutComAPMPaymentInfoModel();
        testObj.populate(sourceMock, target);

        assertEquals("paymentId", target.getPaymentId());
        Assertions.assertTrue(target.getDeferred());
    }

    @Test
    void populate_shouldSetType_whenSourceInfoPresent() {

        when(sourceMock.getId()).thenReturn("paymentId");
        when(sourceMock.getSource()).thenReturn(sourceInfoMock);
        when(sourceInfoMock.getType()).thenReturn(sourceTypeMock);
        when(sourceTypeMock.name()).thenReturn(PaymentSourceType.IDEAL.name());

        CheckoutComAPMPaymentInfoModel target = new CheckoutComAPMPaymentInfoModel();
        testObj.populate(sourceMock, target);

        assertEquals("IDEAL", target.getType());
    }
}