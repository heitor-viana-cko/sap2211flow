package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.CountryCode;
import com.checkout.hybris.core.address.services.CheckoutComAddressService;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestP24Source;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.P24;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComPTwentyFourPaymentRequestStrategyTest {

    private static final String ACCOUNT_HOLDER_NAME = "Mr. John Snow";
    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String COUNTRY_CODE = "PT";
    private static final String CUSTOMER_EMAIL = "test@test.com";

    @InjectMocks
    private CheckoutComPTwentyFourPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComAPMPaymentInfoMock;
    @Mock
    private CustomerModel customerMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private AddressModel addressMock;
    @Mock
    private CheckoutComAddressService addressServiceMock;

    @BeforeEach
    public void setUp() {
        lenient().when(addressServiceMock.getCustomerFullNameFromAddress(addressMock)).thenReturn(ACCOUNT_HOLDER_NAME);
        lenient().when(addressMock.getCountry().getIsocode()).thenReturn(COUNTRY_CODE);

        lenient().when(cartMock.getPaymentInfo()).thenReturn(checkoutComAPMPaymentInfoMock);
        lenient().when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(addressMock);
        lenient().when(checkoutComAPMPaymentInfoMock.getUser()).thenReturn(customerMock);

        lenient().when(checkoutComAPMPaymentInfoMock.getType()).thenReturn(P24.name());
        lenient().when(customerMock.getContactEmail()).thenReturn(CUSTOMER_EMAIL);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPTwentyFourPaymentButCustomerIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPTwentyFourPaymentButBillingAddressIsNull_ShouldThrowException() {
        when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(null);
        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPTwentyFourPaymentButCountryIsNull_ShouldThrowException() {
        when(addressMock.getCountry().getIsocode()).thenReturn(null);
        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPTwentyFourPaymentButCustomerEmailIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPTwentyFourPayment_ShouldCreateAlternativePaymentRequestWithTypeAndAdditionalInfo() {
        when(cartMock.getUser()).thenReturn(customerMock);
        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(P24.name().toLowerCase(), result.getSource().getType().name().toLowerCase());
        assertEquals(CountryCode.valueOf(COUNTRY_CODE), ((RequestP24Source) result.getSource()).getPaymentCountry());
        assertEquals(ACCOUNT_HOLDER_NAME, ((RequestP24Source) result.getSource()).getAccountHolderName());
        assertEquals(CUSTOMER_EMAIL, ((RequestP24Source) result.getSource()).getAccountHolderEmail());
    }

    @Test
    public void getStrategyKey_WhenPTwentyFour_ShouldReturnPTwentyFourType() {
        assertEquals(P24, testObj.getStrategyKey());
    }
}
