package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.apm.services.CheckoutComAPMConfigurationService;
import com.checkout.hybris.core.model.CheckoutComFawryConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComFawryPaymentInfoModel;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestFawrySource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.CustomerModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.FAWRY;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComFawryPaymentRequestStrategyTest {

    private static final String SITE_NAME = "siteName";
    private static final String CURRENCY_ISO_CODE = "USD";
    private static final String MOBILE_NUMBER_VALUE = "12345678901";
    private static final String CUSTOMER_EMAIL_VALUE = "test@test.com";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;
    private static final String PRODUCT_ID_VALUE = "productId";

    private static final String PRODUCT_DESCRIPTION_VALUE = "product description";

    @InjectMocks
    private CheckoutComFawryPaymentRequestStrategy testObj;

    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
    @Mock
    private CartModel cartMock;
    @Mock
    private CheckoutComFawryPaymentInfoModel fawryPaymentInfoMock;
    @Mock
    private CustomerModel customerMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private CMSSiteService cmsSiteServiceMock;
    @Mock
    private CheckoutComAPMConfigurationService checkoutComAPMConfigurationServiceMock;
    @Mock
    private CheckoutComFawryConfigurationModel fawryApmConfigurationMock;

    @Before
    public void setUp() {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "cmsSiteService", cmsSiteServiceMock);
        when(cartMock.getUser()).thenReturn(customerMock);
        when(customerMock.getContactEmail()).thenReturn(CUSTOMER_EMAIL_VALUE);
        when(cmsSiteServiceMock.getCurrentSite().getName()).thenReturn(SITE_NAME);
        when(cartMock.getPaymentInfo()).thenReturn(fawryPaymentInfoMock);
        lenient().when(fawryPaymentInfoMock.getType()).thenReturn(FAWRY.name());
        when(fawryPaymentInfoMock.getMobileNumber()).thenReturn(MOBILE_NUMBER_VALUE);
        when(checkoutComAPMConfigurationServiceMock.getApmConfigurationByCode(FAWRY.name())).thenReturn(Optional.of(fawryApmConfigurationMock));
        when(fawryApmConfigurationMock.getProductId()).thenReturn(PRODUCT_ID_VALUE);
        when(fawryApmConfigurationMock.getProductDescription()).thenReturn(PRODUCT_DESCRIPTION_VALUE);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenFawryPayment_ShouldCreateAlternativePaymentRequestWithRequiredAttributes() {
        final PaymentRequest result = testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);

        assertEquals(FAWRY.name().toLowerCase(), result.getSource().getType().name().toLowerCase());
        final RequestFawrySource source = (RequestFawrySource) result.getSource();
        assertEquals(MOBILE_NUMBER_VALUE, source.getCustomerMobile());
        assertEquals(CUSTOMER_EMAIL_VALUE, source.getCustomerEmail());
        assertEquals(SITE_NAME, source.getDescription());
        final List<RequestFawrySource.Product> products = source.getProducts();
        assertEquals(1, products.size());
        assertEquals(CHECKOUT_COM_TOTAL_PRICE, products.get(0).getPrice());
        assertEquals(PRODUCT_DESCRIPTION_VALUE, products.get(0).getDescription());
    }

    @Test(expected = IllegalArgumentException.class)
    public void getRequestSourcePaymentRequest_WhenFawryConfigurationIsMissing_ShouldThrowException() {
        when(checkoutComAPMConfigurationServiceMock.getApmConfigurationByCode(FAWRY.name())).thenReturn(Optional.empty());

        testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE);
    }

    @Test
    public void getStrategyKey_WhenFawry_ShouldReturnFawryType() {
        assertEquals(FAWRY, testObj.getStrategyKey());
    }
}
