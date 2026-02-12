package com.checkout.hybris.core.order.services.impl;

import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commerceservices.order.CommerceCheckoutService;
import de.hybris.platform.commerceservices.service.data.CommerceCheckoutParameter;
import de.hybris.platform.core.model.order.CartModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class DefaultCheckoutComOrderServiceTest {

    private static final BigDecimal AUTHORISATION_AMOUNT = new BigDecimal(123.12d);
    private static final String PAYMENT_PROVIDER = "paymentProvider";

    @Mock
    private CommerceCheckoutService commerceCheckoutServiceMock;
    @Mock
    private CartModel cartModelMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel paymentInfoModelMock;

    @Spy
    @InjectMocks
    private DefaultCheckoutComOrderService testObj;

    @Before
    public void setUp() {
        when(commerceCheckoutServiceMock.getPaymentProvider()).thenReturn(PAYMENT_PROVIDER);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createCommerceCheckoutParameter_WhenPaymentInfoIsNull_ShouldThrowException() {
        testObj.createCommerceCheckoutParameter(cartModelMock, null, AUTHORISATION_AMOUNT);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createCommerceCheckoutParameter_WhenCartIsNull_ShouldThrowException() {
        testObj.createCommerceCheckoutParameter(null, paymentInfoModelMock, AUTHORISATION_AMOUNT);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createCommerceCheckoutParameter_WhenAuthorizationAmountIsNull_ShouldThrowException() {
        testObj.createCommerceCheckoutParameter(cartModelMock, paymentInfoModelMock, null);
    }

    @Test
    public void createCommerceCheckoutParameter_ShouldReturnTheObjProperlyPopulated() {
        final CommerceCheckoutParameter result = testObj.createCommerceCheckoutParameter(cartModelMock, paymentInfoModelMock, AUTHORISATION_AMOUNT);

        assertEquals(paymentInfoModelMock, result.getPaymentInfo());
        assertTrue(result.isEnableHooks());
        assertEquals(AUTHORISATION_AMOUNT, result.getAuthorizationAmount());
        assertEquals(PAYMENT_PROVIDER, result.getPaymentProvider());
        assertEquals(cartModelMock, result.getCart());
    }
}
