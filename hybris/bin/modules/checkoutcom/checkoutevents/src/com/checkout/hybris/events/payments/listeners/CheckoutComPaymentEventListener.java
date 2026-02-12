package com.checkout.hybris.events.payments.listeners;

import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventType;
import com.checkout.hybris.events.model.CheckoutComPaymentEventModel;
import com.checkout.hybris.events.payments.CheckoutComPaymentEvent;
import com.checkout.hybris.events.services.CheckoutComPaymentEventService;
import com.google.common.base.Preconditions;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import de.hybris.platform.servicelayer.event.impl.AbstractEventListener;
import de.hybris.platform.servicelayer.model.ModelService;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Set;

import static org.apache.commons.collections4.CollectionUtils.isEmpty;

public class CheckoutComPaymentEventListener extends AbstractEventListener<CheckoutComPaymentEvent> {

    protected static final Logger LOG = LogManager.getLogger(CheckoutComPaymentEventListener.class);

    protected final CheckoutComPaymentEventService checkoutComPaymentEventService;
    protected final ModelService modelService;
    protected final Converter<CheckoutComPaymentEventObject, CheckoutComPaymentEventModel> checkoutComPaymentEventReverseConverter;
    protected final CheckoutComPaymentInfoService paymentInfoService;

    public CheckoutComPaymentEventListener(final CheckoutComPaymentEventService checkoutComPaymentEventService,
                                           final ModelService modelService,
                                           final Converter<CheckoutComPaymentEventObject, CheckoutComPaymentEventModel> checkoutComPaymentEventReverseConverter,
                                           final CheckoutComPaymentInfoService paymentInfoService) {
        this.checkoutComPaymentEventService = checkoutComPaymentEventService;
        this.modelService = modelService;
        this.checkoutComPaymentEventReverseConverter = checkoutComPaymentEventReverseConverter;
        this.paymentInfoService = paymentInfoService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected void onEvent(final CheckoutComPaymentEvent checkoutComPaymentEvent) {
        final CheckoutComPaymentEventObject eventBody = checkoutComPaymentEvent.getEventBody();
        Preconditions.checkArgument(eventBody != null, "CheckoutComPaymentEvent cannot be null or empty.");
        Preconditions.checkArgument(StringUtils.isNotBlank(eventBody.getType()), "type element of the CheckoutComPaymentEvent body cannot be null.");

        final String type = eventBody.getType();

        final String siteId = checkoutComPaymentEventService.getSiteIdForTheEvent(eventBody);
        final Set<CheckoutComPaymentEventType> allowedPaymentEventsForMerchant = checkoutComPaymentEventService.getAllowedPaymentEventTypesForMerchant(siteId);

        final String eventId = eventBody.getId();

        if (shouldSaveEvent(type, allowedPaymentEventsForMerchant)) {
            LOG.warn("Payment event of type [{}] with id [{}] not allowed for the site [{}].", type, eventId, siteId);
        } else {
            LOG.debug("Saving event of type [{}] with id [{}].", type, eventId);
            final CheckoutComPaymentEventModel checkoutComPaymentEventModel = checkoutComPaymentEventReverseConverter.convert(eventBody);
            modelService.save(checkoutComPaymentEventModel);
        }
    }

    protected boolean shouldSaveEvent(final String type, final Set<CheckoutComPaymentEventType> allowedPaymentEventsForMerchant) {
        return isEmpty(allowedPaymentEventsForMerchant) || allowedPaymentEventsForMerchant.stream().noneMatch(paymentEventType -> paymentEventType.getCode().equalsIgnoreCase(type));
    }

}
