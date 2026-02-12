package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.response.mappers.CheckoutComPaymentResponseStrategyMapper;
import com.checkout.hybris.core.payment.response.strategies.CheckoutComPaymentResponseStrategy;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComAbstractPaymentResponseStrategyTest {

    @Spy
    private CheckoutComAbstractPaymentResponseStrategy testObj;

    @Mock
    private CheckoutComPaymentResponseStrategyMapper checkoutComPaymentResponseStrategyMapperMock;

    @Before
    public void setUp() {
        testObj = Mockito.mock(
                CheckoutComAbstractPaymentResponseStrategy.class,
                Mockito.CALLS_REAL_METHODS);

        ReflectionTestUtils.setField(testObj, "checkoutComPaymentResponseStrategyMapper",checkoutComPaymentResponseStrategyMapperMock);
    }

    @Test
    public void registerStrategy_ShouldRegisterTheStrategy() {
        when(testObj.getStrategyKey()).thenReturn(CheckoutComPaymentType.CARD);

        testObj.registerStrategy();

        verify(checkoutComPaymentResponseStrategyMapperMock).addStrategy(any(CheckoutComPaymentType.class), any(CheckoutComPaymentResponseStrategy.class));
    }
}
