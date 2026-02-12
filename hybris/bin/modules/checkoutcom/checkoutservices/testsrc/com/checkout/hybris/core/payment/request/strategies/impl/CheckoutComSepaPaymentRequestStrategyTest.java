package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.Address;
import com.checkout.common.CountryCode;
import com.checkout.common.CustomerResponse;
import com.checkout.common.InstrumentType;
import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.merchantconfiguration.BillingDescriptor;
import com.checkout.hybris.core.model.CheckoutComSepaPaymentInfoModel;
import com.checkout.hybris.core.payment.exception.CheckoutComPaymentIntegrationException;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.instruments.create.CreateInstrumentSepaRequest;
import com.checkout.instruments.create.CreateInstrumentSepaResponse;
import com.checkout.payments.request.PaymentCustomerRequest;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestIdSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static com.checkout.hybris.core.enums.SepaPaymentType.RECURRING;
import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.SEPA;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComSepaPaymentRequestStrategyTest {

    private static final String PAYMENT_SOURCE_ID_KEY = "ID";
    private static final String CURRENCY_ISO_CODE = "GBP";
    private static final String CART_REFERENCE = "CART_REFERENCE";
    private static final String PAYMENT_ID = "instrumentId";
    private static final String CUSTOMER_ID = "customerId";
    private static final Long CHECKOUT_COM_TOTAL_PRICE = 10000L;

    @Spy
    @InjectMocks
    private CheckoutComSepaPaymentRequestStrategy testObj;

    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
    @Mock
    private CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationServiceMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private CartModel cartMock;
    @Mock
    private CreateInstrumentSepaResponse createInstrumentSepaResponseMock;
    @Mock
    private CheckoutComSepaPaymentInfoModel sepaPaymentInfoModelMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;
    @Mock
    private CheckoutComCurrencyService checkoutComCurrencyServiceMock;
    @Mock
    private CustomerResponse customerSourceResponseMock;
    @Mock
    private Address addressMock;
    @Mock
    private PaymentInfoModel paymentInfoMock;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComMerchantConfigurationService", checkoutComMerchantConfigurationServiceMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComPaymentIntegrationService", checkoutComPaymentIntegrationServiceMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComCurrencyService", checkoutComCurrencyServiceMock);
    }

    @Test
    public void createPaymentRequest_WhenCartIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.createPaymentRequest(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getRequestSourcePaymentRequest_WhenPaymentInfoIsNotSepa_ShouldThrowException() {
        when(cartMock.getPaymentInfo()).thenReturn(paymentInfoMock);

        assertThatThrownBy(() -> testObj.getRequestSourcePaymentRequest(cartMock, CURRENCY_ISO_CODE, CHECKOUT_COM_TOTAL_PRICE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void createPaymentRequest_WhenThereIsAnErrorInSetupPaymentSource_ShouldThrowException() {
        when(cartMock.getCurrency().getIsocode()).thenReturn(CURRENCY_ISO_CODE);
        when(cartMock.getPaymentInfo()).thenReturn(sepaPaymentInfoModelMock);
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(CART_REFERENCE);
        when(sepaPaymentInfoModelMock.getAccountIban()).thenReturn("iban code");
        when(sepaPaymentInfoModelMock.getPaymentType()).thenReturn(RECURRING);
        when(sepaPaymentInfoModelMock.getAddressLine1()).thenReturn("line1");
        when(sepaPaymentInfoModelMock.getCity()).thenReturn("city");
        when(sepaPaymentInfoModelMock.getPostalCode()).thenReturn("20020");
        when(sepaPaymentInfoModelMock.getCountry()).thenReturn("GB");
        when(sepaPaymentInfoModelMock.getFirstName()).thenReturn("first name");
        when(sepaPaymentInfoModelMock.getLastName()).thenReturn("last name");
        when(checkoutComPaymentIntegrationServiceMock.setUpSepaPaymentSource(any(CreateInstrumentSepaRequest.class))).thenThrow(new CheckoutComPaymentIntegrationException("Exception"));

        assertThatThrownBy(() -> testObj.createPaymentRequest(cartMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void createPaymentRequest_WhenEverythingIsCorrect_ShouldReturnThePopulatedRequest() {
        doNothing().when(testObj).populatePaymentRequest(any(), any());
        when(cartMock.getCurrency().getIsocode()).thenReturn(CURRENCY_ISO_CODE);
        when(cartMock.getPaymentInfo()).thenReturn(sepaPaymentInfoModelMock);
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(CART_REFERENCE);
        when(checkoutComPaymentIntegrationServiceMock.setUpSepaPaymentSource(any(CreateInstrumentSepaRequest.class))).thenReturn(createInstrumentSepaResponseMock);
        when(createInstrumentSepaResponseMock.getId()).thenReturn("instrumentId");
        when(createInstrumentSepaResponseMock.getCustomer()).thenReturn(customerSourceResponseMock);
        when(customerSourceResponseMock.getId()).thenReturn(CUSTOMER_ID);
        when(sepaPaymentInfoModelMock.getAccountIban()).thenReturn("iban code");
        when(sepaPaymentInfoModelMock.getPaymentType()).thenReturn(RECURRING);
        when(sepaPaymentInfoModelMock.getAddressLine1()).thenReturn("line1");
        when(sepaPaymentInfoModelMock.getCity()).thenReturn("city");
        when(sepaPaymentInfoModelMock.getPostalCode()).thenReturn("20020");
        when(sepaPaymentInfoModelMock.getCountry()).thenReturn("GB");
        when(sepaPaymentInfoModelMock.getFirstName()).thenReturn("first name");
        when(sepaPaymentInfoModelMock.getLastName()).thenReturn("last name");

        final PaymentRequest result = testObj.createPaymentRequest(cartMock);

        assertEquals(PAYMENT_SOURCE_ID_KEY, result.getSource().getType().name());
        assertEquals(PAYMENT_ID, ((RequestIdSource) result.getSource()).getId());
        assertEquals(CUSTOMER_ID, ((PaymentCustomerRequest) result.getCustomer()).getId());
    }

    @Test
    public void createPaymentRequest_WhenEverythingIsCorrectButCustomerNotPopulated_ShouldReturnThePopulatedRequestWithoutCustomer() {
        doNothing().when(testObj).populatePaymentRequest(any(), any());
        when(cartMock.getCurrency().getIsocode()).thenReturn(CURRENCY_ISO_CODE);
        when(cartMock.getPaymentInfo()).thenReturn(sepaPaymentInfoModelMock);
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(CART_REFERENCE);
        when(checkoutComPaymentIntegrationServiceMock.setUpSepaPaymentSource(any(CreateInstrumentSepaRequest.class))).thenReturn(createInstrumentSepaResponseMock);
        when(createInstrumentSepaResponseMock.getId()).thenReturn("instrumentId");
        when(createInstrumentSepaResponseMock.getCustomer()).thenReturn(null);
        when(sepaPaymentInfoModelMock.getAccountIban()).thenReturn("iban code");
        when(sepaPaymentInfoModelMock.getPaymentType()).thenReturn(RECURRING);
        when(sepaPaymentInfoModelMock.getAddressLine1()).thenReturn("line1");
        when(sepaPaymentInfoModelMock.getCity()).thenReturn("city");
        when(sepaPaymentInfoModelMock.getPostalCode()).thenReturn("20020");
        when(sepaPaymentInfoModelMock.getCountry()).thenReturn("GB");
        when(sepaPaymentInfoModelMock.getFirstName()).thenReturn("first name");
        when(sepaPaymentInfoModelMock.getLastName()).thenReturn("last name");

        final PaymentRequest result = testObj.createPaymentRequest(cartMock);

        assertEquals(PAYMENT_SOURCE_ID_KEY, result.getSource().getType().name());
        assertEquals(PAYMENT_ID, ((RequestIdSource) result.getSource()).getId());
        assertNull(result.getCustomer());
    }

    @Test
    public void createSourceRequest_WhenSepa_ShouldCreateCorrectSourceRequest() {
        when(cartMock.getCurrency().getIsocode()).thenReturn(CURRENCY_ISO_CODE);
        when(cartMock.getPaymentInfo()).thenReturn(sepaPaymentInfoModelMock);
        when(cartMock.getCheckoutComPaymentReference()).thenReturn(CART_REFERENCE);
        doReturn(addressMock).when(testObj).createAddress(sepaPaymentInfoModelMock);
        when(sepaPaymentInfoModelMock.getAccountIban()).thenReturn("iban code");
        when(sepaPaymentInfoModelMock.getPaymentType()).thenReturn(RECURRING);
        when(sepaPaymentInfoModelMock.getFirstName()).thenReturn("first name");
        when(sepaPaymentInfoModelMock.getLastName()).thenReturn("last name");
        when(sepaPaymentInfoModelMock.getCountry()).thenReturn("GB");

        final CreateInstrumentSepaRequest result = testObj.createSourceRequest(cartMock, sepaPaymentInfoModelMock);

        assertEquals(addressMock, result.getAccountHolder().getBillingAddress());
        assertEquals(CART_REFERENCE, result.getInstrumentData().getMandateId());
        assertEquals(InstrumentType.SEPA, result.getType());
    }

    @Test
    public void createAddress_WhenSepa_ShouldCreateCorrectAddress() {
        when(sepaPaymentInfoModelMock.getAddressLine1()).thenReturn("line1");
        when(sepaPaymentInfoModelMock.getCity()).thenReturn("city");
        when(sepaPaymentInfoModelMock.getPostalCode()).thenReturn("20020");
        when(sepaPaymentInfoModelMock.getCountry()).thenReturn("GB");

        final Address result = testObj.createAddress(sepaPaymentInfoModelMock);

        assertEquals("line1", result.getAddressLine1());
        assertEquals("city", result.getCity());
        assertEquals(CountryCode.GB, CountryCode.valueOf(result.getCountry().name()));
        assertEquals("20020", result.getZip());
    }

    @Test
    public void getStrategyKey_WhenSepa_ShouldReturnSepaType() {
        assertEquals(SEPA, testObj.getStrategyKey());
    }
}
