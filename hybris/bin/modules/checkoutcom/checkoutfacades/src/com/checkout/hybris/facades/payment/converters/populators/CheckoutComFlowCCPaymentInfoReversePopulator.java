package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.CardResponseSource;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.core.enums.CreditCardType;
import de.hybris.platform.enumeration.EnumerationService;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;

import java.util.Optional;

/**
 * Populates the custom properties of the extended {@link CheckoutComCreditCardPaymentInfoModel}
 */
public class CheckoutComFlowCCPaymentInfoReversePopulator implements Populator<GetPaymentResponse, CheckoutComCreditCardPaymentInfoModel> {

    protected final EnumerationService enumerationService;
    protected final CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolver;
    protected final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;

    public CheckoutComFlowCCPaymentInfoReversePopulator(final EnumerationService enumerationService,
                                                        final CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolver,
                                                        final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        this.enumerationService = enumerationService;
        this.checkoutComPaymentTypeResolver = checkoutComPaymentTypeResolver;
        this.checkoutComMerchantConfigurationService = checkoutComMerchantConfigurationService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final GetPaymentResponse source, final CheckoutComCreditCardPaymentInfoModel target) throws ConversionException {
        Assert.notNull(source, "Parameter GetPaymentResponse cannot be null.");
        Assert.notNull(target, "Parameter CheckoutComCreditCardPaymentInfoModel cannot be null.");

        target.setPaymentId(source.getId());

        Optional.ofNullable(source.getSource())
                .ifPresent(responseSource -> {
                    final CardResponseSource ccPaymentInfoData = (CardResponseSource) responseSource;
                    target.setSaved(false);
                    target.setCardBin(ccPaymentInfoData.getBin());
                    target.setScheme(ccPaymentInfoData.getScheme());
                    target.setValidToMonth(ccPaymentInfoData.getExpiryMonth().toString());
                    target.setValidToYear(ccPaymentInfoData.getExpiryYear().toString());
                    target.setNumber("**** **** **** " + ccPaymentInfoData.getLast4());
                    target.setCcOwner(StringUtils.isNotBlank(ccPaymentInfoData.getName()) ?
                            ccPaymentInfoData.getName() :
                            StringUtils.EMPTY);
                    target.setAutoCapture(checkoutComPaymentTypeResolver.isMadaCard(ccPaymentInfoData.getBin()) ||
                            checkoutComMerchantConfigurationService.isAutoCapture());
                    target.setType(enumerationService.getEnumerationValue(
                            CreditCardType.class.getSimpleName(), ccPaymentInfoData.getScheme()));

                });
    }
}