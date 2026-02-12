package com.checkout.hybris.facades.cart.validators.impl;

import com.checkout.hybris.facades.accelerator.CheckoutComCheckoutFlowFacade;
import com.checkout.hybris.facades.payment.CheckoutComPaymentInfoFacade;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commercefacades.order.data.CartData;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;

import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComPlaceOrderCartValidatorTest {

    private static final String DELIVERY_ADDRESS_ERROR_MESSAGE = "checkoutcom.occ.deliveryAddress.notSelected";
    private static final String DELIVERY_METHOD_ERROR_MESSAGE = "checkoutcom.occ.deliveryMethod.notSelected";
    private static final String PAYMENT_METHOD_ERROR_MESSAGE = "checkoutcom.occ.paymentMethod.notSelected";
    private static final String MISSING_TAX_ERROR_MESSAGE = "checkoutcom.occ.error.tax.missing";
    private static final String CART_NOT_CALCULATED_ERROR_MESSAGE = "checkoutcom.occ.error.cart.notcalculated";

    @InjectMocks
    private CheckoutComPlaceOrderCartValidator testObj;

    @Mock
    private CheckoutComCheckoutFlowFacade checkoutFlowFacadeMock;
    @Mock
    private CheckoutComPaymentInfoFacade checkoutComPaymentInfoFacadeMock;
    @Mock
    private CartData cartDataMock;

    private Errors errors;

    @Before
    public void setUp() {
        errors = new BeanPropertyBindingResult(cartDataMock, CartData.class.getSimpleName());

        when(checkoutFlowFacadeMock.hasNoPaymentInfo()).thenReturn(false);
        when(checkoutFlowFacadeMock.hasNoDeliveryAddress()).thenReturn(false);
        when(checkoutFlowFacadeMock.hasNoDeliveryMode()).thenReturn(false);
        when(checkoutComPaymentInfoFacadeMock.isTokenMissingOnCardPaymentInfo(cartDataMock)).thenReturn(false);
        when(checkoutFlowFacadeMock.containsTaxValues()).thenReturn(true);
        when(cartDataMock.isCalculated()).thenReturn(true);
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartDoesNotHaveDeliveryAddress_ShouldReturnTrue() {
        when(checkoutFlowFacadeMock.hasNoDeliveryAddress()).thenReturn(true);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(DELIVERY_ADDRESS_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartDoesNotHaveDeliveryMode_ShouldReturnTrue() {
        when(checkoutFlowFacadeMock.hasNoDeliveryMode()).thenReturn(true);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(DELIVERY_METHOD_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartDoesNotHavePaymentInfo_ShouldReturnTrue() {
        when(checkoutFlowFacadeMock.hasNoPaymentInfo()).thenReturn(true);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(PAYMENT_METHOD_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartPaymentInfoDoesNotHavePaymentToken_ShouldReturnTrue() {
        when(checkoutComPaymentInfoFacadeMock.isTokenMissingOnCardPaymentInfo(cartDataMock)).thenReturn(true);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(PAYMENT_METHOD_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartDoesNotHaveCorrectTaxes_ShouldReturnTrue() {
        when(checkoutFlowFacadeMock.containsTaxValues()).thenReturn(false);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(MISSING_TAX_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenCartIsNotCalculated_ShouldReturnTrue() {
        when(cartDataMock.isCalculated()).thenReturn(false);

        testObj.validate(cartDataMock, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertEquals(CART_NOT_CALCULATED_ERROR_MESSAGE, errors.getAllErrors().get(0).getCode());
    }

    @Test
    public void validateCheckoutPlaceOrderStep_WhenPassAllValidations_ShouldReturnFalse() {
        testObj.validate(cartDataMock, errors);

        assertFalse(errors.hasErrors());
    }
}
