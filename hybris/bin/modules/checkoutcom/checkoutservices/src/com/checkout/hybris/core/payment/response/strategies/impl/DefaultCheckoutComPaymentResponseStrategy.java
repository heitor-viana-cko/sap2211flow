package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.payment.response.strategies.CheckoutComPaymentResponseStrategy;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.payments.response.PaymentResponse;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import org.apache.commons.lang.StringUtils;

import static com.google.common.base.Preconditions.checkArgument;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;

/**
 * Default implementation for {@link CheckoutComPaymentResponseStrategy} used when no specific response strategy
 * has been provided
 */
public class DefaultCheckoutComPaymentResponseStrategy implements CheckoutComPaymentResponseStrategy {

    public static final String REDIRECT = "redirect";
    protected final CheckoutComPaymentInfoService paymentInfoService;

    public DefaultCheckoutComPaymentResponseStrategy(final CheckoutComPaymentInfoService paymentInfoService) {
        this.paymentInfoService = paymentInfoService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AuthorizeResponse handlePendingPaymentResponse(final PaymentResponse paymentResponse, final PaymentInfoModel paymentInfo) {
        validateParameterNotNull(paymentResponse, "Payment pending response cannot be null");
        validateParameterNotNull(paymentInfo, "Payment info null");

        paymentInfoService.addPaymentId(paymentResponse.getId(), paymentInfo);

        checkArgument(paymentResponse.getLink(REDIRECT) != null && StringUtils.isNotBlank(paymentResponse.getLink(REDIRECT).getHref()),
                "Redirect link is missing for payment type " + paymentInfo.getItemtype());
        return populateAuthorizeResponse(paymentResponse, paymentInfo);
    }

    protected AuthorizeResponse populateAuthorizeResponse(final PaymentResponse paymentResponse, final PaymentInfoModel paymentInfo) {
        final AuthorizeResponse response = new AuthorizeResponse();
        response.setIsRedirect(true);
        response.setIsSuccess(true);
        response.setIsDataRequired((paymentInfo instanceof CheckoutComAPMPaymentInfoModel) ? ((CheckoutComAPMPaymentInfoModel) paymentInfo).getUserDataRequired() : Boolean.TRUE);
        response.setRedirectUrl(paymentResponse.getLink(REDIRECT).getHref());
        return response;
    }

}
