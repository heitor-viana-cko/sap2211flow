package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Address;
import com.checkout.common.Currency;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.payments.ThreeDSRequest;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestIdSource;
import com.checkout.payments.request.source.RequestTokenSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static com.checkout.hybris.core.enums.PaymentActionType.AUTHORIZE;
import static com.checkout.hybris.core.enums.PaymentActionType.AUTHORIZE_AND_CAPTURE;
import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.CARD;
import static java.util.Collections.emptyMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComCardPaymentRequestStrategyTest {

    private static final String SUBSCRIPTION_ID = "subscriptionId";
    private static final String CARD_TOKEN = "CARD_TOKEN";
    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;

    @Spy
    @InjectMocks
    private CheckoutComCardPaymentRequestStrategy testObj;
    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;
    @Mock
    private PaymentRequest paymentRequestMock;
    @Mock
    private CartModel cartMock;
    @Mock
    private PaymentInfoModel paymentInfoMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel checkoutComPaymentInfoMock;
    @Mock
    private Address addressMock;
    @Mock
    private AddressModel addressModelMock;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComMerchantConfigurationService", checkoutComMerchantConfigurationServiceMock);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPaymentInfoIsNotCheckoutComCreditCard_ShouldThrowException() {
        when(cartMock.getPaymentInfo()).thenReturn(paymentInfoMock);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage(String.format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]", paymentInfoMock.getClass(), cartMock.getCode()));
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenCardSavedAndSubscriptionIdPopulated_ShouldCreateIdSourcePaymentRequest() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComPaymentInfoMock);
        when(checkoutComPaymentInfoMock.isSaved()).thenReturn(true);
        when(checkoutComPaymentInfoMock.getSubscriptionId()).thenReturn(SUBSCRIPTION_ID);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(SUBSCRIPTION_ID, ((RequestIdSource) result.getSource()).getId());
        assertEquals(Currency.valueOf(CURRENCY_ISO_CODE), result.getCurrency());
        assertEquals(CHECKOUT_COM_TOTAL_PRICE, result.getAmount());
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenNoSavedCard_ShouldCreateTokenSourcePaymentRequest() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComPaymentInfoMock);
        when(cartMock.getPaymentAddress()).thenReturn(addressModelMock);
        when(checkoutComPaymentInfoMock.getCardToken()).thenReturn(CARD_TOKEN);

        when(checkoutComPaymentInfoMock.isSaved()).thenReturn(false);
        doReturn(addressMock).when(testObj).createAddress(addressModelMock);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(CARD_TOKEN, ((RequestTokenSource) result.getSource()).getToken());
        assertEquals(Currency.valueOf(CURRENCY_ISO_CODE), result.getCurrency());
        assertEquals(CHECKOUT_COM_TOTAL_PRICE, result.getAmount());
        assertEquals(addressMock, ((RequestTokenSource) result.getSource()).getBillingAddress());
    }

    @Test
    public void populateRequestMetadata_WhenCardPayment_ThenDefaultMetadataIsSet() {
        doReturn(emptyMap()).when(testObj).createGenericMetadata();

        testObj.populateRequestMetadata(paymentRequestMock);

        verify(testObj).createGenericMetadata();
        verify(paymentRequestMock).setMetadata(emptyMap());
    }

    @Test
    public void isCapture_WhenAuthAndCapture_ShouldReturnTrue() {
        when(checkoutComMerchantConfigurationServiceMock.getPaymentAction()).thenReturn(AUTHORIZE_AND_CAPTURE);

        assertThat(testObj.isCapture()).contains(true);
    }

    @Test
    public void isCapture_WhenNotAuthAndCapture_ShouldReturnFalse() {
        when(checkoutComMerchantConfigurationServiceMock.getPaymentAction()).thenReturn(AUTHORIZE);

        assertThat(testObj.isCapture()).contains(false);
    }

    @Test
    public void createThreeDSRequest_WhenStandard_ShouldCreateThreeDSFromConfiguration() {
        when(checkoutComMerchantConfigurationServiceMock.isThreeDSEnabled()).thenReturn(true);
        when(checkoutComMerchantConfigurationServiceMock.isAttemptNoThreeDSecure()).thenReturn(true);

        final Optional<ThreeDSRequest> result = testObj.createThreeDSRequest();

        assertThat(result.isPresent()).isTrue();
        assertTrue(result.get().getEnabled());
        assertTrue(result.get().getAttemptN3D());
    }

    @Test
    public void getStrategyKey_WhenStandardCard_ShouldReturnCardType() {
        assertEquals(CARD, testObj.getStrategyKey());
    }
}
