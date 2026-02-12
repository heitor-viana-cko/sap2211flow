package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.CountryCode;
import com.checkout.hybris.core.address.services.CheckoutComAddressService;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestBancontactSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.BANCONTACT;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComBancontactPaymentRequestStrategyTest {

    private static final String CURRENCY_ISO_CODE = "USD";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String CUSTOMER_NAME = "Mr John Snow";
    private static final String COUNTRY_CODE = "PT";

    @InjectMocks
    private CheckoutComBancontactPaymentRequestStrategy testObj;

    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel checkoutComAPMPaymentInfoMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private AddressModel addressMock;
    @Mock
    private CheckoutComAddressService addressServiceMock;

    @Test
    public void getRequestSourcePaymentRequest_WhenBancontactPaymentButBillingAddressIsNull_ShouldThrowException() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComAPMPaymentInfoMock);
        when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(addressMock);

        when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(null);

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenBancontactPaymentButCountryIsNull_ShouldThrowException() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComAPMPaymentInfoMock);
        when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(addressMock);
        when(addressMock.getCountry().getIsocode()).thenReturn(null);

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenBancontactPayment_ShouldCreateAlternativePaymentRequestWithTypeAndAdditionalInfo() {
        when(cartMock.getPaymentInfo()).thenReturn(checkoutComAPMPaymentInfoMock);
        when(checkoutComAPMPaymentInfoMock.getBillingAddress()).thenReturn(addressMock);
        when(addressMock.getCountry().getIsocode()).thenReturn(COUNTRY_CODE);
        when(addressServiceMock.getCustomerFullNameFromAddress(addressMock)).thenReturn(CUSTOMER_NAME);

        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(BANCONTACT.name().toLowerCase(), result.getSource().getType().name().toLowerCase());
        assertEquals(CountryCode.valueOf(COUNTRY_CODE), ((RequestBancontactSource) result.getSource()).getPaymentCountry());
        assertEquals(CUSTOMER_NAME, ((RequestBancontactSource) result.getSource()).getAccountHolderName());
    }

    @Test
    public void getStrategyKey_WhenBancontact_ShouldReturnBancontactType() {
        assertEquals(BANCONTACT, testObj.getStrategyKey());
    }
}
