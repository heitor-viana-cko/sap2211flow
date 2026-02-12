package com.checkout.hybris.facades.order.converters.populators;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComBenefitPayPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.hybris.facades.beans.CheckoutComPaymentInfoData;
import com.checkout.hybris.facades.payment.info.mappers.CheckoutComApmPaymentInfoPopulatorMapper;
import de.hybris.platform.commercefacades.order.data.AbstractOrderData;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.core.model.order.AbstractOrderModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;
import de.hybris.platform.servicelayer.model.ModelService;

import java.util.Optional;

import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * Populates the checkout.com payment info data
 */
public class CheckoutComAbstractOrderPopulator implements Populator<AbstractOrderModel, AbstractOrderData> {

    protected final CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolver;
    protected final CheckoutComApmPaymentInfoPopulatorMapper checkoutComApmPaymentInfoPopulatorMapper;
    protected final ModelService modelService;

    public CheckoutComAbstractOrderPopulator(final CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolver,
                                             final CheckoutComApmPaymentInfoPopulatorMapper checkoutComApmPaymentInfoPopulatorMapper,
                                             final ModelService modelService) {
        this.checkoutComPaymentTypeResolver = checkoutComPaymentTypeResolver;
        this.checkoutComApmPaymentInfoPopulatorMapper = checkoutComApmPaymentInfoPopulatorMapper;
        this.modelService = modelService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void populate(final AbstractOrderModel source, final AbstractOrderData target) throws ConversionException {
        validateParameterNotNull(source, "Parameter source cannot be null.");
        validateParameterNotNull(target, "Parameter target cannot be null.");

        if (source.getPaymentInfo() != null) {
            final PaymentInfoModel paymentInfo = source.getPaymentInfo();
            final CheckoutComPaymentType checkoutComPaymentType = checkoutComPaymentTypeResolver.resolvePaymentType(paymentInfo);

            paymentInfo.setBillingAddress(getBillingAddress(source, paymentInfo));

            setPaymentTypeAndQrCodeOnOrderData(target, paymentInfo, checkoutComPaymentType);

            if (paymentInfo instanceof CheckoutComAPMPaymentInfoModel checkoutPaymentInfo) {
                final Populator<CheckoutComAPMPaymentInfoModel, CheckoutComPaymentInfoData> checkoutComPaymentInfoPopulator = checkoutComApmPaymentInfoPopulatorMapper.findPopulator(checkoutComPaymentType);

                final CheckoutComPaymentInfoData checkoutComPaymentInfoData = new CheckoutComPaymentInfoData();
                checkoutComPaymentInfoPopulator.populate(checkoutPaymentInfo, checkoutComPaymentInfoData);

                if (source.getUser() instanceof CustomerModel customer && checkoutComPaymentInfoData.getBillingAddress() != null) {
                    checkoutComPaymentInfoData.getBillingAddress().setEmail(customer.getContactEmail());
                }

                if (checkoutPaymentInfo instanceof CheckoutComAchPaymentInfoModel checkoutAchPaymentInfo) {
                    checkoutComPaymentInfoData.setAccountNumber(checkoutAchPaymentInfo.getMask());
                }

                target.setCheckoutComPaymentInfo(checkoutComPaymentInfoData);
            }
        }

        target.setBaseStoreName(source.getStore() != null ? source.getStore().getName() : null);
    }

    /**
     * Sets the payment type and the QR code data on the order data
     *
     * @param target                 order data
     * @param paymentInfo            the payment info
     * @param checkoutComPaymentType payment type
     */
    protected void setPaymentTypeAndQrCodeOnOrderData(final AbstractOrderData target, final PaymentInfoModel paymentInfo, final CheckoutComPaymentType checkoutComPaymentType) {
        target.setCheckoutPaymentType(checkoutComPaymentType.name());
        if (paymentInfo instanceof CheckoutComBenefitPayPaymentInfoModel checkoutComBenefitPayPaymentInfo) {
            target.setQrCodeData(checkoutComBenefitPayPaymentInfo.getQrCode());
        }
    }

    protected AddressModel getBillingAddress(final AbstractOrderModel source, final PaymentInfoModel paymentInfo) {
        return Optional.ofNullable(paymentInfo.getBillingAddress())
            .orElse(Optional.ofNullable(source.getPaymentAddress())
                .map(modelService::clone)
                .orElse(null));
    }
}
