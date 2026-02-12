package com.checkout.hybris.core.payment.commands.impl;

import com.checkout.CheckoutApiException;
import com.checkout.hybris.core.payment.exception.CheckoutComPaymentIntegrationException;
import com.checkout.hybris.core.payment.request.CheckoutComRequestFactory;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentTransactionService;
import com.checkout.payments.VoidResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.payment.commands.request.VoidRequest;
import de.hybris.platform.payment.commands.result.VoidResult;
import de.hybris.platform.payment.dto.TransactionStatus;
import de.hybris.platform.payment.dto.TransactionStatusDetails;
import de.hybris.platform.servicelayer.time.TimeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class CheckoutComVoidCommandTest {

    private static final String PAYMENT_ID = "PAYMENT_ID";
    private static final String AMOUNT = "100";
    private static final String MERCHANT_TRANSACTION_CODE = "ORDER-REFERENCE-1-SOMETHING";
    private static final String PAYMENT_REFERENCE = "ORDER-REFERENCE";
    private static final Date DATE = new Date();
    private static final String ACTION_ID = "Action_id";

    @InjectMocks
    private CheckoutComVoidCommand testObj;

    @Mock
    private CheckoutComRequestFactory checkoutComRequestFactoryMock;
    @Mock
    private CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationServiceMock;
    @Mock
    private TimeService timeServiceMock;
    @Mock
    private VoidRequest voidRequestMock;
    @Mock
    private com.checkout.payments.VoidRequest voidRequest;
    @Mock
    private VoidResponse voidResponseMock;
    @Mock
    private CheckoutComPaymentTransactionService checkoutComPaymentTransactionServiceMock;

    @BeforeEach
    public void setUp() throws ExecutionException, InterruptedException {
        final Currency currency = Currency.getInstance(Locale.UK);
        lenient().when(voidRequestMock.getCurrency()).thenReturn(currency);
        lenient().when(voidRequestMock.getRequestId()).thenReturn(PAYMENT_ID);
        lenient().when(voidRequestMock.getTotalAmount()).thenReturn(new BigDecimal(AMOUNT));
        lenient().when(voidRequestMock.getMerchantTransactionCode()).thenReturn(MERCHANT_TRANSACTION_CODE);
        lenient().when(checkoutComRequestFactoryMock.createVoidPaymentRequest(PAYMENT_REFERENCE)).thenReturn(voidRequest);
        lenient().when(timeServiceMock.getCurrentTime()).thenReturn(DATE);
        lenient().when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenReturn(voidResponseMock);
        lenient().when(voidResponseMock.getActionId()).thenReturn(ACTION_ID);
        lenient().when(checkoutComPaymentTransactionServiceMock.getPaymentReferenceFromTransactionEntryCode(MERCHANT_TRANSACTION_CODE)).thenReturn(PAYMENT_REFERENCE);
    }

    @Test
    public void perform_WhenRequestNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.perform(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void perform_WhenCurrencyNull_ShouldThrowException() {
        when(voidRequestMock.getCurrency()).thenReturn(null);
        assertThatThrownBy(() -> testObj.perform(voidRequestMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void perform_WhenRequestId_ShouldThrowException() {
        when(voidRequestMock.getRequestId()).thenReturn(null);

        assertThatThrownBy(() -> testObj.perform(voidRequestMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void perform_WhenTotalAmountNull_ShouldThrowException() {
        when(voidRequestMock.getTotalAmount()).thenReturn(null);

        assertThatThrownBy(() -> testObj.perform(voidRequestMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void perform_WhenMerchantTransactionCodeNull_ShouldThrowException() {
        when(voidRequestMock.getMerchantTransactionCode()).thenReturn(null);

        assertThatThrownBy(() -> testObj.perform(voidRequestMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void perform_WhenExecutionExceptionWithError500_ShouldThrowPaymentIntegrationException() throws ExecutionException, InterruptedException {
        when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenThrow(new ExecutionException(new CheckoutApiException(503, Map.of(), Map.of())));

        assertThatThrownBy(() -> testObj.perform(voidRequestMock)).isInstanceOf(CheckoutComPaymentIntegrationException.class);
    }

    @Test
    public void perform_WhenExecutionExceptionWithNonError500_ShouldReturnInvalidRequestErrorVoidResult() throws ExecutionException, InterruptedException {

        when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenThrow(new ExecutionException(new CheckoutApiException(404, Map.of(), Map.of())));

        final VoidResult result = testObj.perform(voidRequestMock);

        assertEquals(TransactionStatus.ERROR, result.getTransactionStatus());
        assertEquals(TransactionStatusDetails.INVALID_REQUEST, result.getTransactionStatusDetails());
    }

    @Test
    public void perform_WhenOtherExecutionException_ShouldReturnInvalidRequestErrorVoidResult() throws ExecutionException, InterruptedException {
        when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenThrow(new ExecutionException(new NullPointerException()));

        final VoidResult result = testObj.perform(voidRequestMock);

        assertEquals(TransactionStatus.ERROR, result.getTransactionStatus());
        assertEquals(TransactionStatusDetails.INVALID_REQUEST, result.getTransactionStatusDetails());
    }

    @Test
    public void perform_WhenCancellationException_ShouldReturnCommunicationProblemErrorVoidResult() throws ExecutionException, InterruptedException {
        when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenThrow(new CancellationException());

        final VoidResult result = testObj.perform(voidRequestMock);

        assertEquals(TransactionStatus.ERROR, result.getTransactionStatus());
        assertEquals(TransactionStatusDetails.COMMUNICATION_PROBLEM, result.getTransactionStatusDetails());
    }

    @Test
    public void perform_WhenInterruptedException_ShouldReturnCommunicationProblemErrorVoidResult() throws ExecutionException, InterruptedException {
        when(checkoutComPaymentIntegrationServiceMock.voidPayment(voidRequest, PAYMENT_ID)).thenThrow(new InterruptedException());

        final VoidResult result = testObj.perform(voidRequestMock);

        assertEquals(TransactionStatus.ERROR, result.getTransactionStatus());
        assertEquals(TransactionStatusDetails.COMMUNICATION_PROBLEM, result.getTransactionStatusDetails());
    }

    @Test
    public void perform_When_ShouldReturnErrorVoidResult() {
        final VoidResult result = testObj.perform(voidRequestMock);

        assertEquals(TransactionStatus.PENDING, result.getTransactionStatus());
        assertEquals(TransactionStatusDetails.SUCCESFULL, result.getTransactionStatusDetails());
        assertEquals(Currency.getInstance(Locale.UK), result.getCurrency());
        assertEquals(ACTION_ID, result.getRequestToken());
        assertEquals(PAYMENT_ID, result.getRequestId());
        assertEquals(DATE, result.getRequestTime());
    }
}
