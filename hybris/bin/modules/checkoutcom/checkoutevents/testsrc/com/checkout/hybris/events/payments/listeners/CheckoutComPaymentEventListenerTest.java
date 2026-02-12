package com.checkout.hybris.events.payments.listeners;

import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventType;
import com.checkout.hybris.events.model.CheckoutComPaymentEventModel;
import com.checkout.hybris.events.payments.CheckoutComPaymentEvent;
import com.checkout.hybris.events.services.CheckoutComPaymentEventService;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import de.hybris.platform.servicelayer.model.ModelService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComPaymentEventListenerTest {

    private static final String ELECTRONICS = "electronics";
    private static final String PAYMENT_ID = "pay_6qugd47beltevjzfi37ngm2apy";
    private static final HashSet<CheckoutComPaymentEventType> EVENT_TYPES = new HashSet<>(Arrays.asList(CheckoutComPaymentEventType.PAYMENT_APPROVED, CheckoutComPaymentEventType.PAYMENT_REFUNDED));

    @InjectMocks
    private CheckoutComPaymentEventListener testObj;

    @Mock
    private CheckoutComPaymentEventService checkoutComPaymentEventServiceMock;
    @Mock
    private ModelService modelServiceMock;
    @Mock
    private Converter<CheckoutComPaymentEventObject, CheckoutComPaymentEventModel> checkoutComPaymentEventReverseConverterMock;
    @Mock
    private CheckoutComPaymentEventModel checkoutComPaymentEventModelMock;
    @Mock
    private CheckoutComPaymentEventObject source;

    @Before
    public void setUp() {
        when(checkoutComPaymentEventServiceMock.getAllowedPaymentEventTypesForMerchant(ELECTRONICS)).thenReturn(EVENT_TYPES);
        when(checkoutComPaymentEventReverseConverterMock.convert(source)).thenReturn(checkoutComPaymentEventModelMock);
        when(checkoutComPaymentEventServiceMock.getSiteIdForTheEvent(source)).thenReturn(ELECTRONICS);
    }

    @Test(expected = IllegalArgumentException.class)
    public void onEvent_WhenEventBodyNull_ShouldThrowException() {
        final CheckoutComPaymentEvent event = new CheckoutComPaymentEvent(null);

        testObj.onEvent(event);
    }

    @Test(expected = IllegalArgumentException.class)
    public void onEvent_WhenEventBodyEmpty_ShouldThrowException() {
        final CheckoutComPaymentEvent event = new CheckoutComPaymentEvent(null);

        testObj.onEvent(event);
    }

    @Test(expected = IllegalArgumentException.class)
    public void onEvent_WhenEventTypeNull_ShouldThrowException() {
        when(source.getType()).thenReturn(null);
        final CheckoutComPaymentEvent event = new CheckoutComPaymentEvent(source);

        testObj.onEvent(event);
    }

    @Test
    public void onEvent_WhenEventTypeInvalid_ShouldDoNothing() {
        when(checkoutComPaymentEventServiceMock.getAllowedPaymentEventTypesForMerchant(ELECTRONICS)).thenReturn(Collections.emptySet());
        when(source.getType()).thenReturn(CheckoutComPaymentEventType.PAYMENT_APPROVED.getCode());
        final CheckoutComPaymentEvent event = new CheckoutComPaymentEvent(source);

        testObj.onEvent(event);

        verifyNoInteractions(checkoutComPaymentEventReverseConverterMock);
        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void onEvent_WhenEventBodyIsValid_ShouldSaveTheEvent() {
        final CheckoutComPaymentEvent event = new CheckoutComPaymentEvent(source);
        when(source.getType()).thenReturn(CheckoutComPaymentEventType.PAYMENT_APPROVED.getCode());
        when(source.getId()).thenReturn(PAYMENT_ID);
        testObj.onEvent(event);

        verify(checkoutComPaymentEventServiceMock).getSiteIdForTheEvent(source);
        verify(checkoutComPaymentEventReverseConverterMock).convert(source);
        verify(modelServiceMock).save(checkoutComPaymentEventModelMock);
    }

}
