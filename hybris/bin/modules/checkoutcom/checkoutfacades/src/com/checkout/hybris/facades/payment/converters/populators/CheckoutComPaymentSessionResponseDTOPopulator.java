package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

public class CheckoutComPaymentSessionResponseDTOPopulator implements Populator<PaymentSessionResponse, CheckoutComPaymentSessionResponseDTO> {

    @Override
    public void populate(PaymentSessionResponse source, CheckoutComPaymentSessionResponseDTO target) throws ConversionException {
        target.setId(source.getId());
        target.setPayment_session_secret(source.getPaymentSessionSecret());
        target.setPayment_session_token(source.getPaymentSessionToken());
    }
}
