package com.checkout.hybris.occ.controllers;

import com.checkout.hybris.facades.merchant.CheckoutComMerchantConfigurationFacade;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.hybris.platform.webservicescommons.cache.CacheControl;
import de.hybris.platform.webservicescommons.cache.CacheControlDirective;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@RestController
@RequestMapping(value = "/{baseSiteId}/merchantKey")
@CacheControl(directive = CacheControlDirective.NO_CACHE)
@Tag(name = "Merchant Configuration")
public class CheckoutComMerchantController {

    private static final String IS_ABC_FALSE = "false";
    @Resource
    private CheckoutComMerchantConfigurationFacade checkoutComMerchantConfigurationFacade;

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getMerchantKey() throws JsonProcessingException {

        final Map<String, String> map = new HashMap<>();
        map.put("publicKey", checkoutComMerchantConfigurationFacade.getCheckoutComMerchantPublicKey());
        map.put("environment", checkoutComMerchantConfigurationFacade.getCheckoutComMerchantEnvironment());
        ObjectMapper objectMapper = new ObjectMapper();
        final String response = objectMapper.writeValueAsString(map);
        return ResponseEntity.ok().body(response);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_GUEST", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @GetMapping(value = "/isABC", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> isMerchantABC() {
        return ResponseEntity.ok().body(IS_ABC_FALSE);
    }
}
