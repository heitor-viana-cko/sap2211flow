package com.checkout.hybris.occ.controllers;

import com.checkout.dto.flow.configuration.FlowEnabledDataResponseDTO;
import com.checkout.hybris.facades.beans.CheckoutComFlowUIConfigurationData;
import com.checkout.hybris.facades.flow.CheckoutComFlowConfigurationFacade;
import de.hybris.platform.webservicescommons.cache.CacheControl;
import de.hybris.platform.webservicescommons.cache.CacheControlDirective;
import de.hybris.platform.webservicescommons.swagger.ApiBaseSiteIdParam;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping(value = "/{baseSiteId}/flow")
@CacheControl(directive = CacheControlDirective.NO_CACHE)
@Tag(name = "Flow")
public class CheckoutComFlowConfigurationController {

    @Resource(name = "checkoutComFlowConfigurationFacade")
    protected CheckoutComFlowConfigurationFacade checkoutComFlowConfigurationFacade;

    @GetMapping(value = "/enabled")
    @ApiBaseSiteIdParam
    public ResponseEntity<FlowEnabledDataResponseDTO> getFlowEnabled(@Parameter(description = "Base site identifier.", required = true) @PathVariable final String baseSiteId) {
        final FlowEnabledDataResponseDTO response = new FlowEnabledDataResponseDTO();
        response.setEnabled(checkoutComFlowConfigurationFacade.isFlowEnabled(baseSiteId));
        return ResponseEntity.ok().body(response);
    }

    @GetMapping(value = "/configuration")
    @ApiBaseSiteIdParam
    public ResponseEntity<CheckoutComFlowUIConfigurationData> getFlowConfiguration(@Parameter(description = "Base site identifier.", required = true) @PathVariable final String baseSiteId) {
        final CheckoutComFlowUIConfigurationData response = checkoutComFlowConfigurationFacade.getCheckoutComFlowUIConfigurationData(baseSiteId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(response);
    }
}
