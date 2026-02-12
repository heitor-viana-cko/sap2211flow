package com.checkout.hybris.core.payment.details.strategies.impl;

import com.checkout.hybris.core.model.CheckoutComIdealPaymentInfoModel;
import com.checkout.hybris.core.payment.details.mappers.CheckoutComUpdatePaymentInfoStrategyMapper;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.GetPaymentResponse;
import com.checkout.payments.response.source.AlternativePaymentSourceResponse;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.model.ModelService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.annotation.PostConstruct;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.IDEAL;

/**
 * Strategy to process the checkout.com payment response for Card payment
 */
public class CheckoutComIdealUpdatePaymentInfoStrategy extends CheckoutComAbstractUpdatePaymentInfoStrategy {

    protected static final Logger LOG = LogManager.getLogger(CheckoutComIdealUpdatePaymentInfoStrategy.class);
    protected static final String BIC = "bic";

    protected CheckoutComPaymentInfoService paymentInfoService;
    protected CheckoutComUpdatePaymentInfoStrategyMapper checkoutComUpdatePaymentInfoStrategyMapper;
    protected ModelService modelService;

    public CheckoutComIdealUpdatePaymentInfoStrategy(final CartService cartService,
                                                     final CheckoutComPaymentInfoService paymentInfoService,
                                                     final CheckoutComUpdatePaymentInfoStrategyMapper checkoutComUpdatePaymentInfoStrategyMapper,
                                                     final ModelService modelService) {
        super(cartService);
        this.paymentInfoService = paymentInfoService;
        this.checkoutComUpdatePaymentInfoStrategyMapper = checkoutComUpdatePaymentInfoStrategyMapper;
        this.modelService = modelService;
    }

    /**
     * Add the strategy to the factory map of strategies
     */
    @PostConstruct
    protected void registerStrategy() {
        checkoutComUpdatePaymentInfoStrategyMapper.addStrategy(getStrategyKey(), this);
    }

    /**
     * {@inheritDoc}
     */
    protected CheckoutComPaymentType getStrategyKey() {
        return IDEAL;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void processPaymentResponse(final GetPaymentResponse paymentResponse) {
        callSuperProcessPayment(paymentResponse);
        if (paymentResponse.getSource() != null) {
            final CartModel sessionCart = cartService.getSessionCart();
            final CheckoutComIdealPaymentInfoModel idealPayment = (CheckoutComIdealPaymentInfoModel) sessionCart.getPaymentInfo();
            idealPayment.setBic((String) ((AlternativePaymentSourceResponse) paymentResponse.getSource()).get(BIC));
            modelService.save(idealPayment);
        } else {
            throw new IllegalArgumentException("The current payment details source is null. The current payment method cannot be mark as saved.");
        }
    }

    protected void callSuperProcessPayment(final GetPaymentResponse paymentResponse) {
        super.processPaymentResponse(paymentResponse);
    }
}
