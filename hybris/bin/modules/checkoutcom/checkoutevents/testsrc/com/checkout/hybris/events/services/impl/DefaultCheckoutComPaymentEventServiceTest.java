package com.checkout.hybris.events.services.impl;

import com.checkout.hybris.core.model.CheckoutComMerchantConfigurationModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventDataObject;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventMetadataObject;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventType;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.cms2.model.site.CMSSiteModel;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;
import org.apache.commons.collections4.CollectionUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.HashSet;
import java.util.Set;

import static com.checkout.hybris.events.enums.CheckoutComPaymentEventType.PAYMENT_APPROVED;
import static com.checkout.hybris.events.enums.CheckoutComPaymentEventType.PAYMENT_REFUNDED;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class DefaultCheckoutComPaymentEventServiceTest {

    private static final String SITE_ID = "electronics";
    private static final String PAYMENT_ID = "pay_6qugd47beltevjzfi37ngm2apy";

    private static final HashSet<CheckoutComPaymentEventType> EVENT_TYPES = new HashSet<>(asList(PAYMENT_APPROVED, PAYMENT_REFUNDED));

    @InjectMocks
    private DefaultCheckoutComPaymentEventService testObj;

    @Mock
    private CMSSiteService cmsSiteServiceMock;
    @Mock
    private CMSSiteModel cmsSiteMock;
    @Mock
    private CheckoutComMerchantConfigurationModel merchantConfigMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;

    private CheckoutComPaymentEventObject checkoutComPaymentEventObjectStub;

    @Before
    public void setUp() {
        checkoutComPaymentEventObjectStub = new CheckoutComPaymentEventObject();
        when(cmsSiteServiceMock.getSites()).thenReturn(singletonList(cmsSiteMock));
        when(cmsSiteMock.getUid()).thenReturn(SITE_ID);
        when(cmsSiteMock.getCheckoutComMerchantConfiguration()).thenReturn(merchantConfigMock);
        when(merchantConfigMock.getCheckoutComPaymentEventTypes()).thenReturn(EVENT_TYPES);
    }

    @Test(expected = IllegalArgumentException.class)
    public void getAllowedPaymentEventTypesForMerchant_WhenSiteIdNull_ShouldThrowException() {
        testObj.getAllowedPaymentEventTypesForMerchant(null);
    }

    @Test
    public void getAllowedPaymentEventTypesForMerchant_WhenNoSites_ShouldReturnEmptySet() {
        when(cmsSiteServiceMock.getSites()).thenReturn(emptyList());

        final Set<CheckoutComPaymentEventType> result = testObj.getAllowedPaymentEventTypesForMerchant(SITE_ID);

        assertTrue(CollectionUtils.isEmpty(result));
    }

    @Test
    public void getAllowedPaymentEventTypesForMerchant_WhenSiteIsValid_ShouldReturnTheEventTypeList() {
        when(cmsSiteServiceMock.getSites()).thenReturn(singletonList(cmsSiteMock));
        when(merchantConfigMock.getCheckoutComPaymentEventTypes()).thenReturn(EVENT_TYPES);

        final Set<CheckoutComPaymentEventType> result = testObj.getAllowedPaymentEventTypesForMerchant(SITE_ID);

        assertEquals(EVENT_TYPES, result);
        assertTrue(result.contains(PAYMENT_APPROVED));
    }

    @Test(expected = NullPointerException.class)
    public void getSiteIdForTheEvent_WhenBodyNull_ShouldReturnFalse() {
        testObj.getSiteIdForTheEvent(null);
    }

    @Test(expected = NullPointerException.class)
    public void getSiteIdForTheEvent_WhenBodyEmpty_ShouldThrowException() {
        testObj.getSiteIdForTheEvent(checkoutComPaymentEventObjectStub);
    }

    @Test(expected = NullPointerException.class)
    public void getSiteIdForTheEvent_WhenDataBodyEmpty_ShouldThrowException() {
        testObj.getSiteIdForTheEvent(null);
    }

    @Test
    public void getSiteIdForTheEvent_WhenMetadataBodyEmpty_ShouldGetSitIdFromRelatedAbstractOrder() {
        final CheckoutComPaymentEventDataObject data = new CheckoutComPaymentEventDataObject();
        data.setId(PAYMENT_ID);
        checkoutComPaymentEventObjectStub.setData(data);
        when(paymentInfoServiceMock.getSiteIdFromPaymentId(PAYMENT_ID)).thenReturn(SITE_ID);

        final String result = testObj.getSiteIdForTheEvent(checkoutComPaymentEventObjectStub);

        assertEquals(SITE_ID, result);
    }

    @Test
    public void getSiteIdForTheEvent_WhenSiteIdPresentOnEvent_ShouldReturnSiteId() {
        final CheckoutComPaymentEventDataObject data = new CheckoutComPaymentEventDataObject();
        final CheckoutComPaymentEventMetadataObject metadata = new CheckoutComPaymentEventMetadataObject();
        metadata.setSite_id(SITE_ID);
        data.setId(PAYMENT_ID);
        data.setMetadata(metadata);
        checkoutComPaymentEventObjectStub.setData(data);

        final String result = testObj.getSiteIdForTheEvent(checkoutComPaymentEventObjectStub);

        assertEquals(SITE_ID, result);
        verify(paymentInfoServiceMock, never()).getSiteIdFromPaymentId(anyString());
    }

}
