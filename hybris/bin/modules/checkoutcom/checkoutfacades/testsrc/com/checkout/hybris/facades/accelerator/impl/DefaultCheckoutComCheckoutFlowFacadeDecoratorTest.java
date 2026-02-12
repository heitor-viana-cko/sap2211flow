package com.checkout.hybris.facades.accelerator.impl;

import com.checkout.hybris.core.address.services.CheckoutComAddressService;
import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.exception.CheckoutComPaymentIntegrationException;
import com.checkout.hybris.core.payment.request.CheckoutComRequestFactory;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentService;
import com.checkout.hybris.facades.beans.AuthorizeResponseData;
import com.checkout.hybris.facades.beans.CheckoutComPaymentInfoData;
import com.checkout.hybris.facades.constants.CheckoutFacadesConstants;
import com.checkout.payments.PaymentStatus;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.response.PaymentResponse;
import com.checkout.payments.response.source.ResponseSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commercefacades.order.CartFacade;
import de.hybris.platform.commercefacades.order.data.CCPaymentInfoData;
import de.hybris.platform.commercefacades.order.data.CartData;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class DefaultCheckoutComCheckoutFlowFacadeDecoratorTest {

    private static final String PAYMENT_ID = "paymentId";
    private static final String APPROVED_RESPONSE_CODE = "10000";
    private static final String DECLINED_RESPONSE_CODE = "20005";
    private static final String CART_CODE = "cart-code";
    private static final String APM_TYPE_VALUE = "APM";

    @Spy
    @InjectMocks
    private DefaultCheckoutComCheckoutFlowFacadeDecorator testObj;

    @Mock
    private CartData cartDataMock;
    @Mock
    private CCPaymentInfoData ccPaymentInfoDataMock;
    @Mock
    private CheckoutComPaymentInfoData apmPaymentInfoDataMock;
    @Mock
    private Converter<AuthorizeResponse, AuthorizeResponseData> authorizeResponseConverterMock;
    @Mock
    private AddressModel addressModelMock, clonedAddressMock;
    @Mock
    private CartModel cartModelMock;
    @Mock
    private CartService cartServiceMock;
    @Mock
    private CartFacade cartFacadeMock;
    @Mock
    private CheckoutComAddressService addressServiceMock;
    @Mock
    private CheckoutComRequestFactory checkoutComRequestFactoryMock;
    @Mock
    private CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationServiceMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel checkoutComCreditCardPaymentInfoMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComAPMPaymentInfoMock;
    @Mock
    private PaymentRequest requestMock;
    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;
    @Mock
    private CheckoutComPaymentService paymentServiceMock;
    @Mock
    private AuthorizeResponse authorizeResponseMock;
    @Mock
    private AuthorizeResponseData authorizeResponseDataMock;
    @Mock
    private ResponseSource responseSourceMock;

    @BeforeEach
    public void setUp() {
        setUpPaymentInfo();
        setUpPaymentResponse();
        setUpTestObj();

        lenient().when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        lenient().when(cartServiceMock.hasSessionCart()).thenReturn(true);
        lenient().when(cartModelMock.getPaymentInfo()).thenReturn(checkoutComCreditCardPaymentInfoMock);
        lenient().when(cartModelMock.getCode()).thenReturn(CART_CODE);

        lenient().when(paymentServiceMock.handlePendingPaymentResponse(paymentResponseMock, checkoutComAPMPaymentInfoMock)).thenReturn(authorizeResponseMock);
        ReflectionTestUtils.setField(testObj, "authorizeResponseConverter", authorizeResponseConverterMock);
        lenient().when(authorizeResponseConverterMock.convert(authorizeResponseMock)).thenReturn(authorizeResponseDataMock);
        lenient().when(paymentInfoServiceMock.isValidPaymentInfo(cartModelMock)).thenReturn(true);
    }

    @Test
    public void authorizePayment_WhenCartIsNull_ShouldThrowException() {
        when(testObj.hasCheckoutCart()).thenReturn(false);

        assertThatThrownBy(() -> testObj.authorizePayment()).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void authorizePayment_WhenPaymentInfoIsNotValid_ShouldReturnFalse() {
        when(paymentInfoServiceMock.isValidPaymentInfo(cartModelMock)).thenReturn(false);

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertFalse(result.getIsSuccess());
    }

    @Test
    public void authorizePayment_WhenThereIsPaymentIntegrationError_ShouldReturnSuccessFalse() {
        when(checkoutComPaymentIntegrationServiceMock.authorizePayment(requestMock)).thenThrow(new CheckoutComPaymentIntegrationException("Error"));

        final AuthorizeResponseData response = testObj.authorizePayment();

        assertFalse(response.getIsSuccess());
    }

    @Test
    public void authorizePayment_WhenPaymentResponseIsNull_ShouldReturnFalse() {
        when(checkoutComPaymentIntegrationServiceMock.authorizePayment(requestMock)).thenReturn(null);

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertFalse(result.getIsSuccess());
    }

    @Test
    public void authorizePayment_WhenPaymentNotApproved_ShouldSavePaymentID_andReturnFalse() {
        when(paymentResponseMock.isApproved()).thenReturn(false);
        when(paymentResponseMock.getStatus()).thenReturn(PaymentStatus.DECLINED);

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertFalse(result.getIsSuccess());
        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, checkoutComCreditCardPaymentInfoMock);
    }

    @Test
    public void authorizePayment_WhenPaymentResponseCodeIsNotApproved_ShouldReturnFalse() {
        when(paymentResponseMock.isApproved()).thenReturn(false);
        when(authorizeResponseConverterMock.convert(authorizeResponseMock)).thenReturn(authorizeResponseDataMock);
        when(authorizeResponseDataMock.getIsSuccess()).thenReturn(false);
        when(paymentServiceMock.handlePendingPaymentResponse(paymentResponseMock, checkoutComCreditCardPaymentInfoMock)).thenReturn(authorizeResponseMock);

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertFalse(result.getIsSuccess());
    }

    @Test
    public void authorizePayment_WhenSessionUserDoNotMatchCartUser_ShouldReturnFalse() {
        doReturn(false).when(testObj).callSuperCheckIfCurrentUserIsTheCartUser();

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertFalse(result.getIsSuccess());
    }

    @Test
    public void authorizePayment_WhenProcessWorkedProperlyNoThreeDS_ShouldReturnSuccessAndRedirectFalse() {
        final AuthorizeResponseData result = testObj.authorizePayment();

        assertTrue(result.getIsSuccess());
        assertFalse(result.getIsRedirect());
        assertTrue(result.getIsDataRequired());
        verify(paymentInfoServiceMock).addSubscriptionIdToUserPayment(checkoutComCreditCardPaymentInfoMock, responseSourceMock);
        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, checkoutComCreditCardPaymentInfoMock);
    }

    @Test
    public void authorizePayment_WhenPaymentResponseStatusIsPENDING_ShouldReturnTheCorrectAuthorizeResponseData() {
        when(cartModelMock.getPaymentInfo()).thenReturn(checkoutComAPMPaymentInfoMock);
        when(paymentResponseMock.getStatus()).thenReturn(PaymentStatus.PENDING);
        when(paymentResponseMock.isApproved()).thenReturn(false);

        final AuthorizeResponseData result = testObj.authorizePayment();

        assertEquals(authorizeResponseDataMock, result);
    }

    @Test
    public void removePaymentInfoFromSessionCart_WhenNoCart_ShouldDoNothing() {
        doReturn(false).when(testObj).hasCheckoutCart();

        testObj.removePaymentInfoFromSessionCart();

        verifyNoInteractions(paymentInfoServiceMock);
    }

    @Test
    public void removePaymentInfoFromSessionCart_ShouldRemoveThePaymentInfo() {
        testObj.removePaymentInfoFromSessionCart();

        verify(paymentInfoServiceMock).removePaymentInfo(cartModelMock);
    }

    @Test
    public void setPaymentInfoBillingAddressOnSessionCart_WhenCartAndPaymentAddressArePresent_ShouldUpdateCart() {
        when(addressServiceMock.cloneAddress(addressModelMock)).thenReturn(clonedAddressMock);
        testObj.setPaymentInfoBillingAddressOnSessionCart();

        verify(cartServiceMock).getSessionCart();
        verify(addressServiceMock).setCartPaymentAddress(cartModelMock, clonedAddressMock);
    }

    @Test
    public void setPaymentInfoBillingAddressOnSessionCart_WhenNoSessionCart_ShouldDoNothing() {
        when(cartServiceMock.hasSessionCart()).thenReturn(false);

        testObj.setPaymentInfoBillingAddressOnSessionCart();

        verify(cartServiceMock, never()).getSessionCart();
        verifyNoInteractions(addressServiceMock);
    }

    @Test
    public void setPaymentInfoBillingAddressOnSessionCart_WhenPaymentInfoNull_ShouldThrowException() {
        when(cartModelMock.getPaymentInfo()).thenReturn(null);

        assertThatThrownBy(() -> testObj.setPaymentInfoBillingAddressOnSessionCart()).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void performExpressCheckout_WhenCalled_ShouldCreateTheExpressCheckoutResultAndSetTheBillingAddressOnCart() {
        testObj.performExpressCheckout();

        verify(testObj).performExpressCheckout();
        verify(testObj).setPaymentInfoBillingAddressOnSessionCart();
    }

    @Test
    public void hasNoPaymentInfo_WhenCartIsNull_shouldReturnTrue() {
        final boolean result = testObj.hasNoPaymentInfo();

        assertTrue(result);
    }

    @Test
    public void hasNoPaymentInfo_WhenCartIsNotNullAndHasNoPaymentInfo_shouldReturnTrue() {
        when(cartDataMock.getPaymentInfo()).thenReturn(null);
        when(cartDataMock.getCheckoutComPaymentInfo()).thenReturn(null);

        final boolean result = testObj.hasNoPaymentInfo();

        assertTrue(result);
    }

    @Test
    public void hasNoPaymentInfo_WhenCartDataIsNotNullAndHasPaymentInfoAndAPMPaymentInfo_ShouldReturnFalse() {
        when(cartDataMock.getPaymentInfo()).thenReturn(ccPaymentInfoDataMock);

        final boolean result = testObj.hasNoPaymentInfo();

        assertFalse(result);
    }

    @Test
    public void hasNoPaymentInfo_WhenCartHasNoCCPaymentInfoAndHasAPMPaymentInfo_ShouldReturnFalse() {
        when(cartDataMock.getPaymentInfo()).thenReturn(null);
        when(cartDataMock.getCheckoutComPaymentInfo()).thenReturn(apmPaymentInfoDataMock);

        final boolean result = testObj.hasNoPaymentInfo();

        assertFalse(result);
    }

    @Test
    public void hasNoPaymentInfo_WhenCartHasNoAPMPaymentInfo_ShouldReturnFalse() {
        when(cartDataMock.getPaymentInfo()).thenReturn(ccPaymentInfoDataMock);

        final boolean result = testObj.hasNoPaymentInfo();

        assertFalse(result);
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_ShouldCallService() {
        testObj.isUserDataRequiredApmPaymentMethod();

        verify(paymentInfoServiceMock).isUserDataRequiredApmPaymentMethod(cartModelMock);
    }

    @Test
    public void getCurrentPaymentMethodType_WhenCheckoutPaymentInfoNull_ShouldReturnCardType() {
        when(cartDataMock.getCheckoutComPaymentInfo()).thenReturn(null);

        final String result = testObj.getCurrentPaymentMethodType();

        assertEquals(CheckoutFacadesConstants.CARD_PAYMENT_METHOD, result);
    }

    @Test
    public void getCurrentPaymentMethodType_WhenCheckoutPaymentInfoNotNull_ShouldReturnThePaymentInfoType() {
        when(cartDataMock.getCheckoutComPaymentInfo()).thenReturn(apmPaymentInfoDataMock);
        when(apmPaymentInfoDataMock.getType()).thenReturn(APM_TYPE_VALUE);

        final String result = testObj.getCurrentPaymentMethodType();

        assertEquals(APM_TYPE_VALUE, result);
    }

    @Test
    public void getCurrentPaymentMethodType_WhenCartIsNull_ShouldThrowException() {
        doReturn(null).when(testObj).getCheckoutCart();

        assertThatThrownBy(() -> testObj.getCurrentPaymentMethodType()).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void authorizePayment_WhenErrorDuringCreatePaymentRequest_ShouldReturnSuccessFalse() {
        doThrow(IllegalArgumentException.class).when(checkoutComRequestFactoryMock).createPaymentRequest(cartModelMock);

        final AuthorizeResponseData response = testObj.authorizePayment();

        assertFalse(response.getIsSuccess());
    }

    private void setUpTestObj() {
        lenient().doReturn(cartDataMock).when(testObj).getCheckoutCart();
        lenient().doReturn(true).when(testObj).hasCheckoutCart();
        lenient().doReturn(true).when(testObj).callSuperCheckIfCurrentUserIsTheCartUser();
        lenient().doReturn(null).when(testObj).callSuperExpressCheckoutResult();

        testObj.setCartFacade(cartFacadeMock);
        testObj.setCartService(cartServiceMock);
    }

    private void setUpPaymentInfo() {
        lenient().when(checkoutComCreditCardPaymentInfoMock.getBillingAddress()).thenReturn(addressModelMock);
        lenient().when(checkoutComRequestFactoryMock.createPaymentRequest(cartModelMock)).thenReturn(requestMock);
        lenient().when(checkoutComPaymentIntegrationServiceMock.authorizePayment(requestMock)).thenReturn(paymentResponseMock);
    }

    private void setUpPaymentResponse() {
        lenient().when(paymentResponseMock.getStatus()).thenReturn(PaymentStatus.PENDING);
        lenient().when(paymentResponseMock.getId()).thenReturn(PAYMENT_ID);
        lenient().when(paymentResponseMock.getSource()).thenReturn(responseSourceMock);
        lenient().when(paymentResponseMock.isApproved()).thenReturn(true);
        lenient().when(paymentResponseMock.getResponseCode()).thenReturn(APPROVED_RESPONSE_CODE);
    }
}
