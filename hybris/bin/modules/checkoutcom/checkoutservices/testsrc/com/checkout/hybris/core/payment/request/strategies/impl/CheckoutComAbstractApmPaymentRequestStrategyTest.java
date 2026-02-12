package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static java.util.Collections.emptyMap;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComAbstractApmPaymentRequestStrategyTest {

    private CheckoutComAbstractApmPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel checkoutComPaymentInfoMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComRedirectAPMPaymentInfoMock;
    @Mock
    private PaymentRequest paymentRequestMock;

    @BeforeEach
    public void setUp() {
        testObj = Mockito.mock(
                CheckoutComAbstractApmPaymentRequestStrategy.class,
                Mockito.CALLS_REAL_METHODS);
    }

    @Test
    public void isCapture_WhenApmRequest_ThenReturnNull() {
        Assertions.assertTrue(testObj.isCapture().isEmpty());
    }

    @Test
    public void createThreeDSRequest_WhenApmRequest_ThenResultIsEmpty() {
        Assertions.assertTrue(testObj.createThreeDSRequest().isEmpty());
    }

    @Test
    public void populateRequestMetadata_WhenApmPayment_ThenDefaultMetadataIsSet() {
        doReturn(emptyMap()).when(testObj).createGenericMetadata();

        testObj.populateRequestMetadata(paymentRequestMock);

        verify(testObj).createGenericMetadata();
        verify(paymentRequestMock).setMetadata(emptyMap());
    }
}
