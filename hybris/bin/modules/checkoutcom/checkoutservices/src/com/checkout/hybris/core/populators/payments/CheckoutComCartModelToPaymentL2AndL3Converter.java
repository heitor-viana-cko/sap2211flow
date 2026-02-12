package com.checkout.hybris.core.populators.payments;

import com.checkout.payments.request.PaymentRequest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

public interface CheckoutComCartModelToPaymentL2AndL3Converter {

    void convert(CartModel cartModel, PaymentRequest requestSourcePaymentRequest) throws ConversionException;
}
