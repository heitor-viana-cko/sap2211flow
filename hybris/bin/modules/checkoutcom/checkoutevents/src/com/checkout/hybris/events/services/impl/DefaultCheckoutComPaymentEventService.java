package com.checkout.hybris.events.services.impl;

import com.checkout.hybris.core.model.CheckoutComMerchantConfigurationModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventDataObject;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventType;
import com.checkout.hybris.events.services.CheckoutComPaymentEventService;
import com.google.common.base.Preconditions;
import de.hybris.platform.cms2.model.site.CMSSiteModel;
import de.hybris.platform.cms2.servicelayer.services.CMSSiteService;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static java.util.stream.Collectors.toList;
import static org.assertj.core.util.Preconditions.*;

/**
 * Default implementation of {@link CheckoutComPaymentEventService}
 */
public class DefaultCheckoutComPaymentEventService implements CheckoutComPaymentEventService {

    protected static final Logger LOG = LogManager.getLogger(DefaultCheckoutComPaymentEventService.class);

    protected final CMSSiteService cmsSiteService;
    protected final CheckoutComPaymentInfoService paymentInfoService;

    public DefaultCheckoutComPaymentEventService(final CMSSiteService cmsSiteService,
                                                 final CheckoutComPaymentInfoService paymentInfoService) {
        this.cmsSiteService = cmsSiteService;
        this.paymentInfoService = paymentInfoService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Set<CheckoutComPaymentEventType> getAllowedPaymentEventTypesForMerchant(final String siteId) {
        Preconditions.checkArgument(StringUtils.isNotBlank(siteId), "Site id is null in the event body.");

        final Collection<CMSSiteModel> sites = cmsSiteService.getSites();

        if (CollectionUtils.isNotEmpty(sites)) {
            final List<CMSSiteModel> matchSites = sites.stream().filter(site -> site.getUid().equalsIgnoreCase(siteId)).collect(toList());
            if (CollectionUtils.isNotEmpty(matchSites)) {
                final CMSSiteModel cmsSiteModel = matchSites.get(0);
                final CheckoutComMerchantConfigurationModel checkoutComMerchantConfiguration = cmsSiteModel.getCheckoutComMerchantConfiguration();
                return checkoutComMerchantConfiguration != null ? checkoutComMerchantConfiguration.getCheckoutComPaymentEventTypes() : Collections.emptySet();
            }
        }

        return Collections.emptySet();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String getSiteIdForTheEvent(final CheckoutComPaymentEventObject eventBody) {
        checkNotNull((eventBody), "Event body cannot be null.");
        checkNotNull((eventBody.getData()), "Data object of the event body cannot be null.");

        final CheckoutComPaymentEventDataObject data = eventBody.getData();
        checkNotNullOrEmpty((data.getId()), "Payment id of the event body cannot be null.");

        if (isSiteIdValid(data)) {
            final String siteId = data.getMetadata().getSite_id();
            LOG.debug("Valid site id [{}] from metadata found.", siteId);
            return siteId;
        } else {
            final String paymentId = data.getId();
            final String siteId = paymentInfoService.getSiteIdFromPaymentId(paymentId);
            LOG.debug("Event missing metadata, found site id [{}] using paymentId [{}].", siteId, paymentId);
            return siteId;
        }
    }

    private boolean isSiteIdValid(final CheckoutComPaymentEventDataObject data) {
        return data != null && data.getMetadata() != null && StringUtils.isNotBlank(data.getMetadata().getSite_id());
    }

}
