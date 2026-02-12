package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.CardResponseSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.enums.CreditCardType;
import de.hybris.platform.enumeration.EnumerationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
class CheckoutComFlowCCPaymentInfoReversePopulatorTest {

    private static final String PAYMENT_ID = "paymentId";
    private static final String NUMBER = "123456";
    private static final String VISA = "VISA";
    private static final String JOHN_DOE = "John Doe";

    @InjectMocks
    private CheckoutComFlowCCPaymentInfoReversePopulator testObj;

    @Mock
    private EnumerationService enumerationServiceMock;
    @Mock
    private CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolverMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;

    @Mock
    private GetPaymentResponse sourceMock;
    @Mock
    private CardResponseSource cardSourceMock;

    @Test
    void populate_shouldThrowException_whenSourceIsNull() {
        CheckoutComCreditCardPaymentInfoModel target = new CheckoutComCreditCardPaymentInfoModel();
        assertThrows(IllegalArgumentException.class, () -> testObj.populate(null, target));
    }

    @Test
    void populate_shouldThrowException_whenTargetIsNull() {
        assertThrows(IllegalArgumentException.class, () -> testObj.populate(sourceMock, null));
    }

    @Test
    void populate_shouldSetPaymentId_whenSourceIsValid() {
        CheckoutComCreditCardPaymentInfoModel target = new CheckoutComCreditCardPaymentInfoModel();
        when(sourceMock.getId()).thenReturn(PAYMENT_ID);
        when(sourceMock.getSource()).thenReturn(null);

        testObj.populate(sourceMock, target);

        assertEquals(PAYMENT_ID, target.getPaymentId());
    }

    @Test
    void populate_shouldSetCardDetails_whenSourceInfoPresent() {
        final CheckoutComCreditCardPaymentInfoModel target = new CheckoutComCreditCardPaymentInfoModel();
        when(sourceMock.getId()).thenReturn(PAYMENT_ID);
        when(sourceMock.getSource()).thenReturn(cardSourceMock);
        when(cardSourceMock.getBin()).thenReturn(NUMBER);
        when(cardSourceMock.getScheme()).thenReturn(VISA);
        when(cardSourceMock.getExpiryMonth()).thenReturn(3);
        when(cardSourceMock.getExpiryYear()).thenReturn(2030);
        when(cardSourceMock.getLast4()).thenReturn("4242");
        when(cardSourceMock.getName()).thenReturn(JOHN_DOE);

        when(checkoutComPaymentTypeResolverMock.isMadaCard(NUMBER)).thenReturn(false);
        when(checkoutComMerchantConfigurationServiceMock.isAutoCapture()).thenReturn(true);
        when(enumerationServiceMock.getEnumerationValue(CreditCardType.class.getSimpleName(), VISA))
                .thenReturn(CreditCardType.VISA);

        testObj.populate(sourceMock, target);

        assertEquals(PAYMENT_ID, target.getPaymentId());
        assertFalse(target.isSaved());
        assertEquals(NUMBER, target.getCardBin());
        assertEquals(VISA, target.getScheme());
        assertEquals("3", target.getValidToMonth());
        assertEquals("2030", target.getValidToYear());
        assertEquals(JOHN_DOE, target.getCcOwner());
        assertEquals("**** **** **** 4242", target.getNumber());
        assertEquals(CreditCardType.VISA, target.getType());
        assertEquals(Boolean.TRUE, target.getAutoCapture());

    }
}