package com.checkout.hybris.core.payment.services.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComApplePayPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.hybris.core.payment.response.mappers.CheckoutComPaymentResponseStrategyMapper;
import com.checkout.hybris.core.payment.response.strategies.impl.CheckoutComMultibancoPaymentResponseStrategy;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentReturnedService;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentTransactionService;
import com.checkout.hybris.events.model.CheckoutComPaymentEventModel;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.enums.OrderStatus;
import de.hybris.platform.core.model.c2l.CurrencyModel;
import de.hybris.platform.core.model.order.OrderModel;
import de.hybris.platform.payment.dto.TransactionStatus;
import de.hybris.platform.payment.enums.PaymentTransactionType;
import de.hybris.platform.payment.model.PaymentTransactionEntryModel;
import de.hybris.platform.payment.model.PaymentTransactionModel;
import de.hybris.platform.servicelayer.model.ModelService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.MULTIBANCO;
import static com.checkout.hybris.events.enums.CheckoutComPaymentEventType.PAYMENT_APPROVED;
import static com.checkout.hybris.events.enums.CheckoutComPaymentEventType.PAYMENT_PENDING;
import static de.hybris.platform.payment.dto.TransactionStatus.*;
import static de.hybris.platform.payment.dto.TransactionStatusDetails.*;
import static de.hybris.platform.payment.enums.PaymentTransactionType.*;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;


@UnitTest
@ExtendWith(MockitoExtension.class)
public class DefaultCheckoutComPaymentServiceTest {

    private static final String SITE_ID = "siteId";
    private static final String PAYMENT_ID = "PAYMENT_ID";

    @Spy
    @InjectMocks
    private DefaultCheckoutComPaymentService testObj;

    @Mock
    private ModelService modelServiceMock;
    @Mock
    private CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolverMock;
    @Mock
    private CheckoutComPaymentTransactionService checkoutComPaymentTransactionServiceMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;
    @Mock
    private CheckoutComPaymentResponseStrategyMapper checkoutComPaymentResponseStrategyMapperMock;
    @Mock
    private CheckoutComMultibancoPaymentResponseStrategy checkoutComMultibancoPaymentResponseStrategyMock;
    @Mock
    private CheckoutComPaymentReturnedService checkoutComPaymentReturnedServiceMock;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private OrderModel orderMock;
    @Mock
    private CurrencyModel currencyModelMock;
    @Mock
    private PaymentResponse paymentResponseMock;
    @Mock
    private AuthorizeResponse authorizeResponseMock;
    @Mock
    private CheckoutComPaymentEventModel paymentEventMock;
    @Mock
    private PaymentTransactionModel paymentTransactionMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel apmPaymentInfoMock;
    @Mock
    private CheckoutComApplePayPaymentInfoModel nonCardPaymentInfoMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel cardPaymentInfoMock;
    @Mock
    private PaymentTransactionEntryModel paymentTransactionEntryMock, capturePaymentTransactionEntryMock,
            capturePendingPaymentTransactionEntryMock, rejectedAuthorizationPaymentTransactionEntryMock,
            acceptedAuthorizationPaymentTransactionEntryMock, reviewAuthorizationPaymentTransactionEntryMock,
            refundPaymentTransactionEntry1Mock, cancelPaymentTransactionEntryMock;

    @BeforeEach
    public void setUp() {
        setUpTestObjMocks();
        setUpPaymentEvent();
        setUpPaymentTransactionsAndTransactionEntries();

        lenient().when(orderMock.getCurrency()).thenReturn(currencyModelMock);
        lenient().when(orderMock.getPaymentInfo()).thenReturn(cardPaymentInfoMock);
        lenient().when(orderMock.getPaymentTransactions()).thenReturn(singletonList(paymentTransactionMock));
        lenient().when(paymentTransactionMock.getOrder()).thenReturn(orderMock);
        lenient().when(orderMock.getSite().getUid()).thenReturn(SITE_ID);
    }

    @Test
    public void isAuthorizationApproved_WhenNoPaymentTransactions_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(null);

        assertFalse(testObj.isAuthorizationApproved(orderMock));
    }

    @Test
    public void isAuthorizationApproved_WhenNoAuthorisationPaymentTransactionEntries_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));

        assertFalse(testObj.isAuthorizationApproved(orderMock));
    }

    @Test
    public void isAuthorizationApproved_WhenNotAcceptedAuthorisationPaymentTransactionEntry_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(capturePaymentTransactionEntryMock, rejectedAuthorizationPaymentTransactionEntryMock));

        assertFalse(testObj.isAuthorizationApproved(orderMock));
    }

    @Test
    public void isAuthorizationApproved_WhenAcceptedAuthorisationPaymentTransactionEntry_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(capturePaymentTransactionEntryMock, acceptedAuthorizationPaymentTransactionEntryMock));

        assertTrue(testObj.isAuthorizationApproved(orderMock));
    }

    @Test
    public void isAuthorizationApproved_WhenReviewAuthorisationPaymentTransactionEntry_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(capturePaymentTransactionEntryMock, reviewAuthorizationPaymentTransactionEntryMock));

        assertTrue(testObj.isAuthorizationApproved(orderMock));
    }

    @Test
    public void isAuthorizationPending_WhenNoTransaction_ShouldReturnTrue() {
        final boolean result = testObj.isAuthorizationPending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isAuthorizationPending_WhenNoTransactionEntry_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(emptyList());

        final boolean result = testObj.isAuthorizationPending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isAuthorizationPending_WhenNoAuthTransactionEntryAccepted_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(Collections.singletonList(paymentTransactionMock));
        when(paymentTransactionMock.getEntries()).thenReturn(Collections.singletonList(paymentTransactionEntryMock));
        when(paymentTransactionEntryMock.getType()).thenReturn(CAPTURE);

        final boolean result = testObj.isAuthorizationPending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isAuthorizationPending_WhenAcceptedAuthTransactionEntry_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(Collections.singletonList(paymentTransactionMock));
        when(paymentTransactionMock.getEntries()).thenReturn(Collections.singletonList(paymentTransactionEntryMock));
        when(paymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);
        when(paymentTransactionEntryMock.getTransactionStatus()).thenReturn(ACCEPTED.toString());

        final boolean result = testObj.isAuthorizationPending(orderMock);

        assertFalse(result);
    }

    @Test
    public void isAuthorizationPending_WhenPendingAuthTransactionEntry_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(Collections.singletonList(paymentTransactionMock));
        when(paymentTransactionMock.getEntries()).thenReturn(Collections.singletonList(paymentTransactionEntryMock));
        when(paymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);
        when(paymentTransactionEntryMock.getTransactionStatus()).thenReturn(PENDING.toString());

        final boolean result = testObj.isAuthorizationPending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isCapturePending_WhenNoTransaction_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(emptyList());

        final boolean result = testObj.isCapturePending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isCapturePending_WhenNoTransactionEntry_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(emptyList());

        final boolean result = testObj.isCapturePending(orderMock);

        assertTrue(result);
    }

    @Test
    public void isCaptureApproved_WhenNoTransactions_ShouldReturnFalse() {
        final boolean result = testObj.isCaptureApproved(orderMock);

        assertFalse(result);
    }

    @Test
    public void isCaptureApproved_WhenNoTransactionEntry_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(emptyList());

        final boolean result = testObj.isCaptureApproved(orderMock);

        assertFalse(result);
    }

    @Test
    public void isCaptureApproved_WhenNoCaptureTransactionEntryAccepted_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(Collections.singletonList(paymentTransactionMock));
        when(paymentTransactionMock.getEntries()).thenReturn(Collections.singletonList(paymentTransactionEntryMock));
        when(paymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);

        final boolean result = testObj.isCaptureApproved(orderMock);

        assertFalse(result);
    }

    @Test
    public void isCaptureApproved_WhenCaptureTransactionEntryAccepted_ShouldReturnTrue() {
        when(orderMock.getPaymentTransactions()).thenReturn(Collections.singletonList(paymentTransactionMock));
        when(paymentTransactionMock.getEntries()).thenReturn(Collections.singletonList(paymentTransactionEntryMock));
        when(paymentTransactionEntryMock.getType()).thenReturn(CAPTURE);
        when(paymentTransactionEntryMock.getTransactionStatus()).thenReturn(ACCEPTED.toString());

        final boolean result = testObj.isCaptureApproved(orderMock);

        assertTrue(result);
    }

    @Test
    public void isAutoCapture_WhenOrderNull_ShouldReturnFalse() {
        final boolean result = testObj.isAutoCapture(null);

        assertFalse(result);
    }

    @Test
    public void isAutoCapture_WhenPaymentInfoNull_ShouldReturnFalse() {
        final boolean result = testObj.isAutoCapture(orderMock);

        assertFalse(result);
    }

    @Test
    public void isAutoCapture_WhenPaymentInfoIsCardPayment_andDoesNotHaveAutoCapture_ShouldReturnFalse() {
        when(orderMock.getPaymentInfo()).thenReturn(cardPaymentInfoMock);
        when(cardPaymentInfoMock.getAutoCapture()).thenReturn(false);

        final boolean result = testObj.isAutoCapture(orderMock);

        assertFalse(result);
    }

    @Test
    public void isAutoCapture_When_WhenPaymentInfoIsCardPayment_andDoesHaveAutoCapture_ShouldReturnTrue() {
        when(orderMock.getPaymentInfo()).thenReturn(cardPaymentInfoMock);
        when(cardPaymentInfoMock.getAutoCapture()).thenReturn(true);

        final boolean result = testObj.isAutoCapture(orderMock);

        assertTrue(result);
    }

    @Test
    public void isAutoCapture_When_WhenPaymentInfoIsNotCardPayment_ShouldReturnTrue() {
        when(orderMock.getPaymentInfo()).thenReturn(nonCardPaymentInfoMock);

        final boolean result = testObj.isAutoCapture(orderMock);

        assertTrue(result);
    }


    @Test
    public void captureExists_WhenTransactionIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.captureExists(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void captureExists_WhenThereAreNotTransactionEntries_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(emptyList());

        assertFalse(testObj.captureExists(orderMock));
    }

    @Test
    public void captureExists_WhenTransactionEntryCaptureDoesNotExist_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(rejectedAuthorizationPaymentTransactionEntryMock));

        assertFalse(testObj.captureExists(orderMock));
    }

    @Test
    public void captureExists_WhenTransactionEntryCaptureExists_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(capturePaymentTransactionEntryMock, reviewAuthorizationPaymentTransactionEntryMock));

        assertTrue(testObj.captureExists(orderMock));
    }

    @Test
    public void isCapturePending_WhenOrderIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.isCapturePending(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isCapturePending_WhenThereAreNotTransactionEntries_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(emptyList());

        assertTrue(testObj.isCapturePending(orderMock));
    }

    @Test
    public void isCapturePending_WhenTransactionEntryCaptureDoesNotExist_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(rejectedAuthorizationPaymentTransactionEntryMock));

        assertTrue(testObj.isCapturePending(orderMock));
    }

    @Test
    public void isCapturePending_WhenTransactionEntryCaptureExists_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePendingPaymentTransactionEntryMock));

        assertFalse(testObj.isCapturePending(orderMock));
    }

    @Test
    public void isVoidPresent_WhenNullOrder_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.isVoidPresent(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isVoidPresent_WhenNoPaymentTransactions_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(null);

        assertFalse(testObj.isVoidPresent(orderMock));
    }

    @Test
    public void isVoidPresent_WhenNoPaymentTransactionEntries_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(emptyList());

        assertFalse(testObj.isVoidPresent(orderMock));
    }

    @Test
    public void isVoidPresent_WhenNoCancelPaymentTransaction_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));

        assertFalse(testObj.isVoidPresent(orderMock));
    }

    @Test
    public void isVoidPresent_WhenCancelPaymentTransactionPresent_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(acceptedAuthorizationPaymentTransactionEntryMock, capturePaymentTransactionEntryMock, cancelPaymentTransactionEntryMock));

        assertTrue(testObj.isVoidPresent(orderMock));
    }


    @Test
    public void isVoidPending_WhenNullOrder_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.isVoidPending(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isVoidPending_WhenNoPaymentTransactions_ShouldReturnFalse() {
        when(orderMock.getPaymentTransactions()).thenReturn(null);

        assertFalse(testObj.isVoidPending(orderMock));
    }

    @Test
    public void isVoidPending_WhenNoPaymentTransactionEntries_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(emptyList());

        assertFalse(testObj.isVoidPending(orderMock));
    }

    @Test
    public void isVoidPending_WhenNoCancelPaymentTransaction_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));

        assertFalse(testObj.isVoidPending(orderMock));
    }

    @Test
    public void isVoidPending_WhenCancelPaymentNoTransactionPending_ShouldReturnFalse() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(acceptedAuthorizationPaymentTransactionEntryMock, capturePaymentTransactionEntryMock, cancelPaymentTransactionEntryMock));
        when(cancelPaymentTransactionEntryMock.getTransactionStatus()).thenReturn(ACCEPTED.name());

        assertFalse(testObj.isVoidPending(orderMock));
    }

    @Test
    public void isVoidPending_WhenCancelPaymentTransactionPending_ShouldReturnTrue() {
        when(paymentTransactionMock.getEntries()).thenReturn(asList(acceptedAuthorizationPaymentTransactionEntryMock, capturePaymentTransactionEntryMock, cancelPaymentTransactionEntryMock));
        when(cancelPaymentTransactionEntryMock.getTransactionStatus()).thenReturn(PENDING.name());

        assertTrue(testObj.isVoidPending(orderMock));
    }

    @Test
    public void findPendingTransactionEntry_WhenNoTransactionEntryForType_ShouldReturnEmpty() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(refundPaymentTransactionEntry1Mock));

        final Optional<PaymentTransactionEntryModel> result = testObj.findPendingTransactionEntry(PAYMENT_ID, paymentTransactionMock, CAPTURE);

        assertTrue(result.isEmpty());
    }

    @Test
    public void findPendingTransactionEntry_WhenTransactionEntryForTypeWithDifferentPaymentId_ShouldReturnEmpty() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));
        when(capturePaymentTransactionEntryMock.getRequestId()).thenReturn("somePaymentId");

        final Optional<PaymentTransactionEntryModel> result = testObj.findPendingTransactionEntry(PAYMENT_ID, paymentTransactionMock, CAPTURE);

        assertTrue(result.isEmpty());
    }

    @Test
    public void findPendingTransactionEntry_WhenTransactionEntryForTypeWithSamePaymentIdButNotPending_ShouldReturnEmpty() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));
        when(capturePaymentTransactionEntryMock.getRequestId()).thenReturn(PAYMENT_ID);
        when(capturePaymentTransactionEntryMock.getTransactionStatus()).thenReturn(ACCEPTED.toString());

        final Optional<PaymentTransactionEntryModel> result = testObj.findPendingTransactionEntry(PAYMENT_ID, paymentTransactionMock, CAPTURE);

        assertTrue(result.isEmpty());
    }

    @Test
    public void findPendingTransactionEntry_WhenPendingTransactionEntryForTypeWithSamePaymentId_ShouldReturnTransactionEntry() {
        when(paymentTransactionMock.getEntries()).thenReturn(singletonList(capturePaymentTransactionEntryMock));
        when(capturePaymentTransactionEntryMock.getRequestId()).thenReturn(PAYMENT_ID);
        when(capturePaymentTransactionEntryMock.getTransactionStatus()).thenReturn(PENDING.toString());

        final Optional<PaymentTransactionEntryModel> result = testObj.findPendingTransactionEntry(PAYMENT_ID, paymentTransactionMock, CAPTURE);

        assertTrue(result.isPresent());
        Assertions.assertSame(capturePaymentTransactionEntryMock, result.get());
    }

    @Test
    public void acceptPayment_WhenNullEvent_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.acceptPayment(null, paymentTransactionMock, AUTHORIZATION)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void acceptPayment_WhenNullTransaction_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.acceptPayment(paymentEventMock, null, AUTHORIZATION)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void acceptPayment_WhenNullTransactionType_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.acceptPayment(paymentEventMock, paymentTransactionMock, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void rejectPayment_WhenNullPaymentEvent_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.rejectPayment(null, paymentTransactionMock, AUTHORIZATION)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void rejectPayment_WhenNullPaymentTransaction_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.rejectPayment(paymentEventMock, null, AUTHORIZATION)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void rejectPayment_WhenNullTransactionType_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.rejectPayment(paymentEventMock, paymentTransactionMock, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void returnPayment_WhenNullEvent_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.returnPayment(null, paymentTransactionMock, RETURN)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void returnPayment_WhenNullTransaction_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.returnPayment(paymentEventMock, null, RETURN)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void returnPayment_WhenNullTransactionType_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.returnPayment(paymentEventMock, paymentTransactionMock, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void handlePendingPaymentResponse_WhenMultibancoPaymentMethod_ShouldUseMultibancoStrategyAndReturnAuthoriseResponse() {
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(apmPaymentInfoMock)).thenReturn(MULTIBANCO);
        when(checkoutComPaymentResponseStrategyMapperMock.findStrategy(MULTIBANCO)).thenReturn(checkoutComMultibancoPaymentResponseStrategyMock);
        when(checkoutComMultibancoPaymentResponseStrategyMock.handlePendingPaymentResponse(paymentResponseMock, apmPaymentInfoMock)).thenReturn(authorizeResponseMock);

        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(paymentResponseMock, apmPaymentInfoMock);

        assertEquals(authorizeResponseMock, result);
    }

    @Test
    public void handlePendingPaymentResponse_WhenPaymentResponseIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.handlePendingPaymentResponse(null, apmPaymentInfoMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void handlePendingPaymentResponse_WhenPaymentInfoIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.handlePendingPaymentResponse(paymentResponseMock, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isDeferred_WhenApmPaymentInfoIsDeferred_ShouldReturnTrue() {
        when(orderMock.getPaymentInfo()).thenReturn(apmPaymentInfoMock);
        when(apmPaymentInfoMock.getDeferred()).thenReturn(true);

        assertTrue(testObj.isDeferred(orderMock));
    }

    @Test
    public void isDeferred_WhenApmPaymentInfoIsNotDeferred_ShouldReturnFalse() {
        when(orderMock.getPaymentInfo()).thenReturn(apmPaymentInfoMock);
        when(apmPaymentInfoMock.getDeferred()).thenReturn(false);

        assertFalse(testObj.isDeferred(orderMock));
    }

    @Test
    public void isDeferred_WhenCardPaymentInfo_ShouldReturnFalse() {
        assertFalse(testObj.isDeferred(orderMock));
    }

    @Test
    public void isDeferred_WhenPaymentInfoIsNull_ShouldThrowException() {
        when(orderMock.getPaymentInfo()).thenReturn(null);
        assertThatThrownBy(() -> testObj.isDeferred(orderMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isDeferred_WhenOrderIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.isDeferred(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void acceptPayment_WhenPaymentTransactionEntryExists_ShouldUpdateStatusToAccepted_andOrderStatusToPaymentCaptured() {
        when(paymentEventMock.getPaymentId()).thenReturn(PAYMENT_ID);
        doReturn(Optional.of(paymentTransactionEntryMock)).when(testObj).findPendingTransactionEntry(PAYMENT_ID, paymentTransactionMock, AUTHORIZATION);

        testObj.acceptPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        verify(paymentTransactionEntryMock).setTransactionStatus(ACCEPTED.name());
        verify(modelServiceMock).save(paymentTransactionEntryMock);
        verify(checkoutComPaymentTransactionServiceMock, never()).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));
    }

    @Test
    public void acceptPayment_WhenPaymentTransactionEntryDoesNotExistAndEventWithNoRisk_ShouldCreateNewAcceptedEntry() {
        when(paymentEventMock.getRiskFlag()).thenReturn(Boolean.FALSE);
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.acceptPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, ACCEPTED.name(), SUCCESFULL.name(), AUTHORIZATION);
    }

    @Test
    public void acceptPayment_WhenPaymentTransactionEntryDoesNotExistAndEventIsPaymentPending_ShouldCreateNewPendingEntry() {
        when(paymentEventMock.getEventType()).thenReturn(PAYMENT_PENDING.getCode());
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.acceptPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, PENDING.name(), SUCCESFULL.name(), AUTHORIZATION);
    }

    @Test
    public void acceptPayment_WhenPaymentTransactionEntryDoesNotExistAndEventWithRiskWithMerchantIgnoringRisk_ShouldCreateNewAcceptedEntry() {
        when(paymentEventMock.getRiskFlag()).thenReturn(Boolean.TRUE);
        when(checkoutComMerchantConfigurationServiceMock.isReviewTransactionsAtRisk(SITE_ID)).thenReturn(false);
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.acceptPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        final InOrder inOrder = inOrder(orderMock, modelServiceMock, checkoutComPaymentTransactionServiceMock);
        inOrder.verify(orderMock).setStatus(OrderStatus.PAYMENT_CAPTURED);
        inOrder.verify(modelServiceMock).save(orderMock);
        inOrder.verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, ACCEPTED.name(), SUCCESFULL.name(), AUTHORIZATION);
    }

    @Test
    public void acceptPayment_WhenPaymentTransactionEntryDoesNotExistAndEventWithRiskWithMerchantNotIgnoringRisk_ShouldCreateNewReviewEntry() {
        when(paymentEventMock.getRiskFlag()).thenReturn(Boolean.TRUE);
        when(checkoutComMerchantConfigurationServiceMock.isReviewTransactionsAtRisk(SITE_ID)).thenReturn(true);
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.acceptPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, REVIEW.name(), REVIEW_NEEDED.name(), AUTHORIZATION);
    }

    @Test
    public void rejectPayment_ShouldCreateRejectedPaymentTransactionEntryForApprovedEventType() {
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.rejectPayment(paymentEventMock, paymentTransactionMock, AUTHORIZATION);

        verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, REJECTED.name(), PROCESSOR_DECLINE.name(), AUTHORIZATION);
    }

    @Test
    public void returnPayment_ShouldUpdateOrderStatusToPaymentReturned() {
        doNothing().when(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(any(PaymentTransactionModel.class), any(CheckoutComPaymentEventModel.class), anyString(), anyString(), any(PaymentTransactionType.class));

        testObj.returnPayment(paymentEventMock, paymentTransactionMock, RETURN);

        final InOrder inOrder = inOrder(orderMock, modelServiceMock, checkoutComPaymentTransactionServiceMock);
        inOrder.verify(orderMock).setStatus(OrderStatus.PAYMENT_RETURNED);
        inOrder.verify(modelServiceMock).save(orderMock);
        inOrder.verify(checkoutComPaymentTransactionServiceMock).createPaymentTransactionEntry(paymentTransactionMock, paymentEventMock, ACCEPTED.name(), SUCCESFULL.name(), RETURN);
    }

    private void setUpTestObjMocks() {
        ReflectionTestUtils.setField(testObj, "modelService", modelServiceMock);
        ReflectionTestUtils.setField(testObj, "checkoutComMerchantConfigurationService", checkoutComMerchantConfigurationServiceMock);
        ReflectionTestUtils.setField(testObj, "checkoutComPaymentResponseStrategyMapper", checkoutComPaymentResponseStrategyMapperMock);
        ReflectionTestUtils.setField(testObj, "checkoutComPaymentTypeResolver", checkoutComPaymentTypeResolverMock);
        ReflectionTestUtils.setField(testObj, "checkoutComPaymentTransactionService", checkoutComPaymentTransactionServiceMock);
        ReflectionTestUtils.setField(testObj, "checkoutComPaymentReturnedService", checkoutComPaymentReturnedServiceMock);
    }

    private void setUpPaymentEvent() {
        lenient().when(paymentEventMock.getEventType()).thenReturn(PAYMENT_APPROVED.toString());
    }

    private void setUpPaymentTransactionsAndTransactionEntries() {
        lenient().when(capturePaymentTransactionEntryMock.getType()).thenReturn(CAPTURE);
        lenient().when(capturePendingPaymentTransactionEntryMock.getType()).thenReturn(CAPTURE);
        lenient().when(rejectedAuthorizationPaymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);
        lenient().when(rejectedAuthorizationPaymentTransactionEntryMock.getTransactionStatus()).thenReturn(TransactionStatus.REJECTED.toString());
        lenient().when(acceptedAuthorizationPaymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);
        lenient().when(acceptedAuthorizationPaymentTransactionEntryMock.getTransactionStatus()).thenReturn(TransactionStatus.ACCEPTED.toString());
        lenient().when(reviewAuthorizationPaymentTransactionEntryMock.getType()).thenReturn(AUTHORIZATION);
        lenient().when(reviewAuthorizationPaymentTransactionEntryMock.getTransactionStatus()).thenReturn(TransactionStatus.REVIEW.toString());
        lenient().when(cancelPaymentTransactionEntryMock.getType()).thenReturn(CANCEL);
        lenient().when(checkoutComPaymentTransactionServiceMock.getPaymentTransaction(orderMock)).thenReturn(paymentTransactionMock);
    }
}
