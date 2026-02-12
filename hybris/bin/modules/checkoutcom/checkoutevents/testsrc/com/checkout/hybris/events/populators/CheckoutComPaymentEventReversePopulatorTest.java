package com.checkout.hybris.events.populators;

import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.events.beans.*;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventStatus;
import com.checkout.hybris.events.model.CheckoutComPaymentEventModel;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.c2l.CurrencyModel;
import de.hybris.platform.servicelayer.i18n.CommonI18NService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.math.BigDecimal;

import static com.checkout.hybris.events.constants.CheckouteventsConstants.EVENT_APPROVED_RESPONSE_CODE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComPaymentEventReversePopulatorTest {

    private static final String PAYMENT_ID_VALUE = "pay_6qugd47beltevjzfi37ngm2apy";
    private static final String CURRENCY_CODE = "GBP";
    private static final Long CHECKOUTCOM_AMOUNT = 5695L;
    private static final BigDecimal AUTHORISATION_AMOUNT = BigDecimal.valueOf(56.95d);
    private static final String ID = "evt_dh2zojguo4mebehzbqqltcfuna";
    private static final String PAYMENT_APPROVED = "payment_approved";
    private static final String REFERENCE = "00000003-1576254760720";
    private static final String ACTION_ID = "act_6qugd47beltevjzfi37ngm2apy";
    private static final String RESPONSE_SUMMARY = "Approved";
    private static final String SITE_ID = "electronics";
    private static final String SOURCE_TYPE = "card";

    @InjectMocks
    private CheckoutComPaymentEventReversePopulator testObj;

    @Mock
    private CommonI18NService commonI18NServiceMock;
    @Mock
    private CheckoutComCurrencyService checkoutComCurrencyServiceMock;
    @Mock
    private CurrencyModel currencyModelMock;
    @Mock
    private CheckoutComPaymentEventObject source;
    @Mock
    private CheckoutComPaymentEventDataObject checkoutComPaymentEventDataObjectMock;
    @Mock
    private CheckoutComPaymentEventMetadataObject checkoutComPaymentEventMetadataObjectMock;
    @Mock
    private CheckoutComPaymentEventRiskObject checkoutComPaymentEventRiskObjectMock;
    @Mock
    private CheckoutComPaymentEventSourceObject checkoutComPaymentEventSourceObjectMock;

    private CheckoutComPaymentEventModel target;

    @Before
    public void setUp() {
        when(commonI18NServiceMock.getCurrency(CURRENCY_CODE)).thenReturn(currencyModelMock);
        when(checkoutComCurrencyServiceMock.addDecimalsToAmountForGivenCurrency(CURRENCY_CODE, CHECKOUTCOM_AMOUNT)).thenReturn(AUTHORISATION_AMOUNT);
        when(source.getData()).thenReturn(checkoutComPaymentEventDataObjectMock);
        when(checkoutComPaymentEventDataObjectMock.getMetadata()).thenReturn(checkoutComPaymentEventMetadataObjectMock);
        when(checkoutComPaymentEventDataObjectMock.getRisk()).thenReturn(checkoutComPaymentEventRiskObjectMock);
        when(checkoutComPaymentEventDataObjectMock.getSource()).thenReturn(checkoutComPaymentEventSourceObjectMock);

        target = new CheckoutComPaymentEventModel();
    }

    @Test(expected = NullPointerException.class)
    public void populate_WhenSourceNull_ShouldThrowException() {
        testObj.populate(null, target);
    }

    @Test
    public void populate_WhenSourceValid_ShouldPopulateTargetCorrectly() {
        when(source.getData()).thenReturn(checkoutComPaymentEventDataObjectMock);
        when(source.getId()).thenReturn(ID);
        when(source.getType()).thenReturn(PAYMENT_APPROVED);
        when(checkoutComPaymentEventDataObjectMock.getCurrency()).thenReturn(CURRENCY_CODE);
        when(checkoutComPaymentEventDataObjectMock.getAmount()).thenReturn(Double.valueOf(CHECKOUTCOM_AMOUNT) );
        when(checkoutComPaymentEventDataObjectMock.getId()).thenReturn(PAYMENT_ID_VALUE);
        when(checkoutComPaymentEventDataObjectMock.getReference()).thenReturn(REFERENCE);
        when(checkoutComPaymentEventDataObjectMock.getResponse_code()).thenReturn(EVENT_APPROVED_RESPONSE_CODE);
        when(checkoutComPaymentEventDataObjectMock.getAction_id()).thenReturn(ACTION_ID);
        when(checkoutComPaymentEventDataObjectMock.getResponse_summary()).thenReturn(RESPONSE_SUMMARY);
        when(checkoutComPaymentEventDataObjectMock.getResponse_summary()).thenReturn(RESPONSE_SUMMARY);
        when(checkoutComPaymentEventRiskObjectMock.getFlagged()).thenReturn(false);
        when(checkoutComPaymentEventMetadataObjectMock.getSite_id()).thenReturn(SITE_ID);
        when(checkoutComPaymentEventSourceObjectMock.getType()).thenReturn(SOURCE_TYPE);
        final Gson gson = new GsonBuilder().create();
        when(source.getPayLoad()).thenReturn(gson.toJson(source));

        testObj.populate(source, target);


        assertNotNull(target);
        assertEquals(currencyModelMock, target.getCurrency());
        assertEquals(ID, target.getEventId());
        assertEquals( PAYMENT_APPROVED, target.getEventType());
        assertEquals(PAYMENT_ID_VALUE, target.getPaymentId());
        assertEquals(REFERENCE, target.getPaymentReference());
        assertEquals(EVENT_APPROVED_RESPONSE_CODE, target.getResponseCode());
        assertEquals(ACTION_ID, target.getActionId());
        assertEquals(RESPONSE_SUMMARY, target.getResponseSummary());
        assertEquals(false, target.getRiskFlag());
        assertEquals(SITE_ID, target.getSiteId());
        assertEquals(SOURCE_TYPE, target.getSourceType());
        assertEquals(CheckoutComPaymentEventStatus.PENDING, target.getStatus());
        assertEquals(gson.toJson(source), target.getPayload());
    }

    @Test
    public void populate_WhenActionIdIsNull_ShouldPopulateActionIdWithPaymentId() {
        when(checkoutComPaymentEventDataObjectMock.getAction_id()).thenReturn(null);
        when(checkoutComPaymentEventDataObjectMock.getId()).thenReturn(PAYMENT_ID_VALUE);
        final Gson gson = new GsonBuilder().create();
        when(source.getPayLoad()).thenReturn(gson.toJson(source));
        testObj.populate(source, target);

        assertNotNull(target);

        assertEquals(PAYMENT_ID_VALUE, target.getPaymentId());
        assertEquals(PAYMENT_ID_VALUE, target.getActionId());

        assertEquals(gson.toJson(source), target.getPayload());
    }

    @Test
    public void populate_WhenResponseCodeIsNull_ShouldPopulateResponseCodeWithDefaultValue() {
        when(checkoutComPaymentEventDataObjectMock.getResponse_code()).thenReturn(null);
        final Gson gson = new GsonBuilder().create();
        when(source.getPayLoad()).thenReturn(gson.toJson(source));
        testObj.populate(source, target);

        assertNotNull(target);
        assertEquals(EVENT_APPROVED_RESPONSE_CODE, target.getResponseCode());

        assertEquals(gson.toJson(source), target.getPayload());
    }

}
