package com.checkout.hybris.events.payments;

import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import de.hybris.platform.servicelayer.event.ClusterAwareEvent;
import de.hybris.platform.servicelayer.event.PublishEventContext;
import de.hybris.platform.servicelayer.event.events.AbstractEvent;

import java.util.Map;


public class CheckoutComPaymentEvent extends AbstractEvent implements ClusterAwareEvent {

    private CheckoutComPaymentEventObject eventBody;

    public CheckoutComPaymentEvent(final CheckoutComPaymentEventObject eventBody) {
        this.eventBody = eventBody;
    }

    @Override
    public boolean canPublish(final PublishEventContext publishEventContext) {
        return true;
    }

    @Override
    public boolean publish(final int sourceNodeId, final int targetNodeId) {
        return (sourceNodeId == targetNodeId);
    }

    public CheckoutComPaymentEventObject getEventBody() {
        return eventBody;
    }

    public void setEventBody(final CheckoutComPaymentEventObject eventBody) {
        this.eventBody = eventBody;
    }

    @Override
    public String toString() {
        return "CheckoutComPaymentEvent{" +
                "eventBody=" + eventBody +
                '}';
    }
}
