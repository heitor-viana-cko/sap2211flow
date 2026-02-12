package com.checkout.hybris.core.flow.impl;

import com.checkout.CheckoutApi;
import com.checkout.common.CountryCode;
import com.checkout.handlepaymentsandpayouts.flow.FlowClient;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.requests.PaymentSessionRequest;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.payment.services.CheckoutComApiService;
import com.checkout.hybris.core.url.services.CheckoutComUrlService;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.cms2.model.site.CMSSiteModel;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;
import de.hybris.platform.core.model.c2l.CountryModel;
import de.hybris.platform.core.model.c2l.CurrencyModel;
import de.hybris.platform.core.model.c2l.RegionModel;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.order.CartService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
class DefaultCheckoutComFlowPaymentSessionServiceTest {

    public static final String GB = "GB";
    public static final String GBP = "GBP";
    private static final String CITY = "city";
    private static final String LINE_2 = "line2";
    private static final String LINE_1 = "line1";
    private static final String REGION_NAME = "regionName";
    private static final String POSTAL_CODE = "postalCode";
    private static final String SUCCESS_URL = "successURL";
    private static final String FAILURE_URL = "failureURL";
    private static final String SECURE_FAILURE_URL = "secureFailureURL";
    private static final String SECURE_SUCCESS_URL = "secureSuccessURL";

    @InjectMocks
    private DefaultCheckoutComFlowPaymentSessionService testObj;

    @Mock
    private CartService cartServiceMock;
    @Mock
    private CheckoutComCurrencyService checkoutComCurrencyServiceMock;
    @Mock
    private CMSSiteService cmsSiteServiceMock;
    @Mock
    private CheckoutComUrlService checkoutComUrlServiceMock;
    @Mock
    private CheckoutComApiService checkoutComApiServiceMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;

    @Mock
    private CartModel cartModelMock;
    @Mock
    private CurrencyModel currencyModelMock;
    @Mock
    private AddressModel addressModelMock;
    @Mock
    private CMSSiteModel cmsSiteModelMock;
    @Mock
    private CountryModel countryModelMock;
    @Mock
    private RegionModel regionModelMock;
    @Mock
    private CheckoutApi checkoutApiMock;
    @Mock
    private FlowClient flowClientMock;
    @Mock
    private CompletableFuture<PaymentSessionResponse> completableFuturePaymentSessionResponseMock;
    @Mock
    private PaymentSessionResponse paymentSessionResponseMock;

    @Captor
    private ArgumentCaptor<PaymentSessionRequest> paymentSessionResponseArgumentCaptor;

    @Test
    void createPaymentSession_shouldReturnCreatedPaymentSession_whenCartHasSessionCart() throws ExecutionException, InterruptedException {
        when(checkoutComMerchantConfigurationServiceMock.getProcessingChannelId()).thenReturn("processingChannelId");
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(cartModelMock.getCurrency()).thenReturn(currencyModelMock);
        when(currencyModelMock.getIsocode()).thenReturn(GBP);
        when(cartModelMock.getTotalPrice()).thenReturn(100d);
        when(checkoutComCurrencyServiceMock.removeDecimalsFromCurrencyAmount(GBP, 100d)).thenReturn(100L);
        when(cartModelMock.getPaymentAddress()).thenReturn(addressModelMock);
        when(addressModelMock.getLine1()).thenReturn(LINE_1);
        when(addressModelMock.getLine2()).thenReturn(LINE_2);
        when(addressModelMock.getTown()).thenReturn(CITY);
        when(addressModelMock.getCountry()).thenReturn(countryModelMock);
        when(countryModelMock.getIsocode()).thenReturn(GB);
        when(addressModelMock.getRegion()).thenReturn(regionModelMock);
        when(regionModelMock.getName()).thenReturn(REGION_NAME);
        when(addressModelMock.getPostalcode()).thenReturn(POSTAL_CODE);

        when(cmsSiteServiceMock.getCurrentSite()).thenReturn(cmsSiteModelMock);
        when(cmsSiteModelMock.getCheckoutComSuccessRedirectUrl()).thenReturn(SUCCESS_URL);
        when(cmsSiteModelMock.getCheckoutComFailureRedirectUrl()).thenReturn(FAILURE_URL);
        when(checkoutComUrlServiceMock.getFullUrl(SUCCESS_URL, true)).thenReturn(SECURE_SUCCESS_URL);
        when(checkoutComUrlServiceMock.getFullUrl(FAILURE_URL, true)).thenReturn(SECURE_FAILURE_URL);
        when(checkoutComApiServiceMock.createCheckoutApi()).thenReturn(checkoutApiMock);
        when(checkoutApiMock.flowClient()).thenReturn(flowClientMock);
        when(flowClientMock.requestPaymentSession(any(PaymentSessionRequest.class))).thenReturn(completableFuturePaymentSessionResponseMock);
        when(completableFuturePaymentSessionResponseMock.get()).thenReturn(paymentSessionResponseMock);

        final PaymentSessionResponse result = testObj.createPaymentSession();

        assertThat(result).isEqualTo(paymentSessionResponseMock);
        verify(flowClientMock).requestPaymentSession(paymentSessionResponseArgumentCaptor.capture());
        final PaymentSessionRequest paymentSessionRequest = paymentSessionResponseArgumentCaptor.getValue();
        assertThat(paymentSessionRequest.getBilling().getAddress().getAddressLine1()).isEqualTo(LINE_1);
        assertThat(paymentSessionRequest.getBilling().getAddress().getAddressLine2()).isEqualTo(LINE_2);
        assertThat(paymentSessionRequest.getBilling().getAddress().getCity()).isEqualTo(CITY);
        assertThat(paymentSessionRequest.getBilling().getAddress().getZip()).isEqualTo(POSTAL_CODE);
        assertThat(paymentSessionRequest.getBilling().getAddress().getCountry()).isEqualTo(CountryCode.GB);
        assertThat(paymentSessionRequest.getBilling().getAddress().getState()).isEqualTo(REGION_NAME);
        assertThat(paymentSessionRequest.getSuccessUrl()).isEqualTo(SECURE_SUCCESS_URL);
        assertThat(paymentSessionRequest.getFailureUrl()).isEqualTo(SECURE_FAILURE_URL);
    }

    @Test
    void createPaymentSession_shouldReturnNull_whenCartHasNoSessionCart() {
        when(cartServiceMock.hasSessionCart()).thenReturn(false);

        final PaymentSessionResponse result = testObj.createPaymentSession();

        assertThat(result).isNull();
    }
}
