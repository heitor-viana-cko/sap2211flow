package com.checkout.hybris.events.populators;

import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventDataObject;
import com.checkout.hybris.events.beans.CheckoutComPaymentEventObject;
import com.checkout.hybris.events.enums.CheckoutComPaymentEventStatus;
import com.checkout.hybris.events.model.CheckoutComPaymentEventModel;
import com.google.common.base.Preconditions;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;
import de.hybris.platform.servicelayer.i18n.CommonI18NService;
import org.apache.commons.lang3.StringUtils;

import static com.checkout.hybris.events.constants.CheckouteventsConstants.EVENT_APPROVED_RESPONSE_CODE;


public class CheckoutComPaymentEventReversePopulator implements Populator<CheckoutComPaymentEventObject, CheckoutComPaymentEventModel> {

    protected final CommonI18NService commonI18NService;
    protected final CheckoutComCurrencyService checkoutComCurrencyService;

    public CheckoutComPaymentEventReversePopulator(final CommonI18NService commonI18NService, final CheckoutComCurrencyService checkoutComCurrencyService) {
        this.commonI18NService = commonI18NService;
        this.checkoutComCurrencyService = checkoutComCurrencyService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final CheckoutComPaymentEventObject source, final CheckoutComPaymentEventModel target) throws ConversionException {
        Preconditions.checkNotNull(source, "CheckoutComPaymentEvent body cannot be null.");

        target.setEventId(source.getId());
        target.setEventType(source.getType());
        target.setStatus(CheckoutComPaymentEventStatus.PENDING);
        target.setPayload(source.getPayLoad());

        populateDataAttributes(source, target);
    }

    protected void populateDataAttributes(final CheckoutComPaymentEventObject source, final CheckoutComPaymentEventModel target) {
        if (source.getData() != null) {
            final CheckoutComPaymentEventDataObject data = source.getData();
            target.setResponseSummary(data.getResponse_summary());
            target.setResponseCode(StringUtils.isNotBlank(data.getResponse_code()) ? data.getResponse_code() : EVENT_APPROVED_RESPONSE_CODE);
            target.setPaymentReference(data.getReference());
            target.setPaymentId(data.getId());
            target.setActionId(StringUtils.isNotBlank(data.getAction_id()) ? data.getAction_id() : data.getId());

            if (data.getMetadata() != null) {
                target.setSiteId(data.getMetadata().getSite_id());
            }

            if (data.getRisk() != null) {
                target.setRiskFlag(data.getRisk().getFlagged());
            }

            if (data.getSource() != null) {
                target.setSourceType(data.getSource().getType());
            }

            if (StringUtils.isNotBlank(data.getCurrency()) && data.getAmount() != null) {
                target.setCurrency(commonI18NService.getCurrency(data.getCurrency()));
                target.setAmount(checkoutComCurrencyService.addDecimalsToAmountForGivenCurrency(data.getCurrency(), data.getAmount().longValue()));
            }
        }
    }

}
