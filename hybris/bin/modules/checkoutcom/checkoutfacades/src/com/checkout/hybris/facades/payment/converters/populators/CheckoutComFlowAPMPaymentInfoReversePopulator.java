package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.payments.response.GetPaymentResponse;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;
import org.springframework.util.Assert;

import java.util.Optional;

/**
 * Populates the custom properties of the extended {@link CheckoutComAPMPaymentInfoModel}
 */
public class CheckoutComFlowAPMPaymentInfoReversePopulator implements Populator<GetPaymentResponse, CheckoutComAPMPaymentInfoModel> {


    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final GetPaymentResponse source, final CheckoutComAPMPaymentInfoModel target) throws ConversionException {
        Assert.notNull(source, "Parameter GetPaymentResponse cannot be null.");
        Assert.notNull(target, "Parameter CheckoutComAPMPaymentInfoModel cannot be null.");

        target.setPaymentId(source.getId());
        target.setDeferred(true);

        Optional.ofNullable(source.getSource())
                .ifPresent(sourceInfo -> target.setType(sourceInfo.getType().name()));
    }
}