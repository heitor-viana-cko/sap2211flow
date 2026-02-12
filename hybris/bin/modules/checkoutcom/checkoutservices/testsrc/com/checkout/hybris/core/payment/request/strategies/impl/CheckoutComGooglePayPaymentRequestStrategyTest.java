package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Address;
import com.checkout.common.Currency;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComGooglePayPaymentInfoModel;
import com.checkout.payments.ThreeDSRequest;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestTokenSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.GOOGLEPAY;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComGooglePayPaymentRequestStrategyTest {

    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String PAYMENT_TOKEN_VALUE = "payment_token_value";

    @Spy
    @InjectMocks
    private CheckoutComGooglePayPaymentRequestStrategy testObj;

    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
    @Mock
    private CartModel cartMock;
    @Mock
    private PaymentInfoModel paymentInfoMock;
    @Mock
    private CheckoutComGooglePayPaymentInfoModel googlePayPaymentInfoMock;
    @Mock
    private Address addressMock;
    @Mock
    private AddressModel addressModelMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComMerchantConfigurationService", checkoutComMerchantConfigurationServiceMock);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPaymentInfoIsNotCheckoutComGooglePayPaymentInfo_ShouldThrowException() {
        when(cartMock.getPaymentInfo()).thenReturn(paymentInfoMock);

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenCheckoutComGooglePayPaymentInfo_ShouldReturnPaymentRequest() {
        when(cartMock.getPaymentInfo()).thenReturn(googlePayPaymentInfoMock);
        when(googlePayPaymentInfoMock.getToken()).thenReturn(PAYMENT_TOKEN_VALUE);
        when(cartMock.getPaymentAddress()).thenReturn(addressModelMock);
        doReturn(addressMock).when(testObj).createAddress(addressModelMock);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(PAYMENT_TOKEN_VALUE, ((RequestTokenSource) result.getSource()).getToken());
        assertEquals(Currency.valueOf(CURRENCY_ISO_CODE), result.getCurrency());
        assertEquals(CHECKOUT_COM_TOTAL_PRICE, result.getAmount());
        assertEquals(addressMock, ((RequestTokenSource) result.getSource()).getBillingAddress());
    }

    @Test
    public void getStrategyKey_WhenGooglePay_ShouldReturnGooglePayType() {
        assertEquals(GOOGLEPAY, testObj.getStrategyKey());
    }

    @Test
    public void isCapture_ShouldReturnConfiguredValue() {
        when(checkoutPaymentRequestServicesWrapperMock.checkoutComMerchantConfigurationService.isAutoCapture()).thenReturn(Boolean.TRUE);

        final Optional<Boolean> result = testObj.isCapture();

        assertTrue(result.get());
    }

    @Test
    public void createThreeDSRequest_WhenThreeDSEnabled_ShouldCreateThreeDSFromConfiguration() {
        when(checkoutComMerchantConfigurationServiceMock.getGooglePayConfiguration().getThreeDSEnabled()).thenReturn(Boolean.TRUE);

        final Optional<ThreeDSRequest> result = testObj.createThreeDSRequest();

        assertTrue(result.isPresent());
        assertTrue(result.get().getEnabled());
    }
}
