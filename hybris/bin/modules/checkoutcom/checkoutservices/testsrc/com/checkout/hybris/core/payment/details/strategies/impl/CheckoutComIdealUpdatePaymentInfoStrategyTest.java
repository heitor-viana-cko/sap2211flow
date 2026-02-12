package com.checkout.hybris.core.payment.details.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComIdealPaymentInfoModel;
import com.checkout.hybris.core.payment.details.mappers.CheckoutComUpdatePaymentInfoStrategyMapper;
import com.checkout.hybris.core.payment.details.strategies.CheckoutComUpdatePaymentInfoStrategy;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.AlternativePaymentSourceResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.model.ModelService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.IDEAL;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComIdealUpdatePaymentInfoStrategyTest {

    private static final String BIC_VALUE = "bic_value";
    private static final String BIC = "bic";
    private static final String CART_SERVICE = "cartService";
    private static final String MODEL_SERVICE = "modelService";

    @InjectMocks
    @Spy
    private CheckoutComIdealUpdatePaymentInfoStrategy testObj;

    @Mock
    private CheckoutComUpdatePaymentInfoStrategyMapper checkoutComUpdatePaymentInfoStrategyMapperMock;
    @Mock
    private GetPaymentResponse paymentResponseMock;
    @Mock
    private CartService cartServiceMock;
    @Mock
    private CheckoutComIdealPaymentInfoModel checkoutComIdealPaymentInfoModelMock;
    @Mock
    private ModelService modelServiceMock;
    @Mock
    private CartModel cartMock;
    @Mock
    private AlternativePaymentSourceResponse paymentSourceMock;

    @Before
    public void setUp() {
        ReflectionTestUtils.setField(testObj, CART_SERVICE, cartServiceMock);
        ReflectionTestUtils.setField(testObj, MODEL_SERVICE, modelServiceMock);
        doNothing().when(testObj).callSuperProcessPayment(any(GetPaymentResponse.class));
        when(paymentResponseMock.getSource()).thenReturn(paymentSourceMock);
        when(cartServiceMock.getSessionCart()).thenReturn(cartMock);
        when(paymentSourceMock.get(BIC)).thenReturn(BIC_VALUE);
    }

    @Test(expected = IllegalArgumentException.class)
    public void processPaymentResponse_WhenSourceIsNull_ShouldThrowException() {
        when(paymentResponseMock.getSource()).thenReturn(null);

        testObj.processPaymentResponse(paymentResponseMock);

        verifyNoMoreInteractions(cartServiceMock);
        verifyNoMoreInteractions(modelServiceMock);
    }

    @Test
    public void processPaymentResponse_WhenSourceIsValid_ShouldUpdatePaymentInfo() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComIdealPaymentInfoModelMock);

        testObj.processPaymentResponse(paymentResponseMock);

        verify(cartServiceMock).getSessionCart();
        verify(checkoutComIdealPaymentInfoModelMock).setBic(BIC_VALUE);
    }

    @Test
    public void getStrategyKey_WhenStandardCard_ShouldReturnCardType() {
        assertEquals(IDEAL, testObj.getStrategyKey());
    }

    @Test
    public void registerStrategy_ShouldRegisterTheStrategy() {
        testObj.registerStrategy();

        verify(checkoutComUpdatePaymentInfoStrategyMapperMock).addStrategy(any(CheckoutComPaymentType.class), any(CheckoutComUpdatePaymentInfoStrategy.class));
    }

}
