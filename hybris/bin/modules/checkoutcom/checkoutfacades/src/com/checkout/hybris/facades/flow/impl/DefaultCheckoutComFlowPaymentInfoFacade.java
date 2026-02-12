package com.checkout.hybris.facades.flow.impl;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.hybris.facades.flow.CheckoutComFlowPaymentInfoFacade;
import com.checkout.hybris.facades.payment.CheckoutComPaymentInfoFacade;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.AlternativePaymentSourceResponse;
import com.checkout.payments.response.source.CardResponseSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.dto.converter.Converter;

/**
 * Default implementation of the {@link CheckoutComPaymentInfoFacade}
 */
public class DefaultCheckoutComFlowPaymentInfoFacade implements CheckoutComFlowPaymentInfoFacade {

    protected final CartService cartService;
    protected final CheckoutComPaymentInfoService paymentInfoService;
    protected final Converter<GetPaymentResponse, CheckoutComCreditCardPaymentInfoModel> checkoutComFlowCCPaymentInfoReverseConverter;
    protected final Converter<GetPaymentResponse, CheckoutComAPMPaymentInfoModel> checkoutComFlowAPMPaymentInfoReverseConverter;

    public DefaultCheckoutComFlowPaymentInfoFacade(final CartService cartService,
                                                   final CheckoutComPaymentInfoService paymentInfoService,
                                                   Converter<GetPaymentResponse, CheckoutComCreditCardPaymentInfoModel> checkoutComFlowCCPaymentInfoReverseConverter,
                                                   Converter<GetPaymentResponse, CheckoutComAPMPaymentInfoModel> checkoutComFlowAPMPaymentInfoReverseConverter) {

        this.cartService = cartService;
        this.paymentInfoService = paymentInfoService;
        this.checkoutComFlowCCPaymentInfoReverseConverter = checkoutComFlowCCPaymentInfoReverseConverter;
        this.checkoutComFlowAPMPaymentInfoReverseConverter = checkoutComFlowAPMPaymentInfoReverseConverter;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void addPaymentInfoToCart(final GetPaymentResponse paymentInfo) {
        if (cartService.hasSessionCart()) {
            final CartModel sessionCart = cartService.getSessionCart();
            if (sessionCart.getPaymentInfo() != null) {
                paymentInfoService.removePaymentInfo(sessionCart);
            }
            PaymentInfoModel paymentInfoModel;
            if (paymentInfo.getSource() instanceof CardResponseSource) {
                paymentInfoModel = checkoutComFlowCCPaymentInfoReverseConverter.convert(paymentInfo);
            } else if (paymentInfo.getSource() instanceof AlternativePaymentSourceResponse){
                paymentInfoModel = checkoutComFlowAPMPaymentInfoReverseConverter.convert(paymentInfo);
            } else {
                throw new IllegalArgumentException("Payment source type not supported");
            }

            paymentInfoService.createPaymentInfo(paymentInfoModel, sessionCart);
        }
    }
}
