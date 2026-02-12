package com.checkout.hybris.occ.controllers;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import com.checkout.hybris.facades.flow.CheckoutComFlowPaymentSessionFacade;
import de.hybris.platform.webservicescommons.cache.CacheControl;
import de.hybris.platform.webservicescommons.cache.CacheControlDirective;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/{baseSiteId}/users/{userId}/carts/{cartId}/payment-session")
@CacheControl(directive = CacheControlDirective.NO_CACHE)
@Tag(name = "Flow")
public class CheckoutComPaymentSessionController {

    private final CheckoutComFlowPaymentSessionFacade checkoutComFlowPaymentSessionFacade;

    public CheckoutComPaymentSessionController(CheckoutComFlowPaymentSessionFacade checkoutComFlowPaymentSessionFacade) {
        this.checkoutComFlowPaymentSessionFacade = checkoutComFlowPaymentSessionFacade;
    }

    @GetMapping()
    public ResponseEntity<CheckoutComPaymentSessionResponseDTO> createPaymentSession(@PathVariable("baseSiteId") final String baseSiteId) {

        final CheckoutComPaymentSessionResponseDTO paymentSession = checkoutComFlowPaymentSessionFacade.createPaymentSession(baseSiteId);
        if (paymentSession == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(paymentSession);
    }

}
