package com.checkout.hybris.events.services;

import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventType;

import java.util.Set;


public interface CheckoutComPaymentEventService {

    /**
     * Returns a list of allowed payment event types based ot the site merchant configuration
     *
     * @param siteId the site id
     * @return List<CheckoutComPaymentEventType> the list of allowed payment event types
     */
    Set<CheckoutComPaymentEventType> getAllowedPaymentEventTypesForMerchant(String siteId);

    /**
     * Gets the site id for the Payment event body map
     * If event body contains the site id then will be returned, otherwise will get it from the related AbstractOrder
     *
     * @param eventBodyMap the event
     * @return the site id of the event or the related order
     */
    String getSiteIdForTheEvent(CheckoutComPaymentEventObject eventBody);
}
