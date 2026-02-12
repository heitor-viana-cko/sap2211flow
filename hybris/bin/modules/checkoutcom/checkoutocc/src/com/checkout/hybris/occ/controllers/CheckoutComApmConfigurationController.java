package com.checkout.hybris.occ.controllers;

import com.checkout.data.apm.CheckoutComAPMConfigurationDataList;
import com.checkout.dto.apm.CheckoutComAPMConfigurationListWsDTO;
import com.checkout.hybris.facades.apm.CheckoutComAPMConfigurationFacade;
import de.hybris.platform.webservicescommons.cache.CacheControl;
import de.hybris.platform.webservicescommons.cache.CacheControlDirective;
import de.hybris.platform.webservicescommons.mapping.DataMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

import static de.hybris.platform.webservicescommons.mapping.FieldSetLevelHelper.DEFAULT_LEVEL;

@RestController
@RequestMapping(value = "/{baseSiteId}/users/{userId}/carts/{cartId}/apm")
@CacheControl(directive = CacheControlDirective.NO_CACHE)
@Tag(name = "Apm Configuration")
public class CheckoutComApmConfigurationController {

    @Resource(name = "dataMapper")
    private DataMapper dataMapper;
    @Resource(name = "checkoutComAPMAvailabilityFacade")
    private CheckoutComAPMConfigurationFacade checkoutComAPMAvailabilityFacade;

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @GetMapping(value = "/available")
    public CheckoutComAPMConfigurationListWsDTO getAvailableApmsForCart(@RequestParam(required = false, defaultValue = DEFAULT_LEVEL) final String fields) {
        final CheckoutComAPMConfigurationDataList apmConfigurationDataList = new CheckoutComAPMConfigurationDataList();
        apmConfigurationDataList.setAvailableApmConfigurations(checkoutComAPMAvailabilityFacade.getAvailableApms());
        return dataMapper.map(apmConfigurationDataList, CheckoutComAPMConfigurationListWsDTO.class, fields);
    }

    @Secured({"ROLE_CUSTOMERGROUP", "ROLE_GUEST", "ROLE_CUSTOMERMANAGERGROUP", "ROLE_TRUSTED_CLIENT", "ROLE_CLIENT"})
    @GetMapping(value = "/available/{countryCode}")
    public CheckoutComAPMConfigurationListWsDTO getAvailableApmsForCartByCountryCode(@RequestParam(required = false, defaultValue = DEFAULT_LEVEL) final String fields,
                                                                                     @PathVariable final String countryCode) {
        final CheckoutComAPMConfigurationDataList apmConfigurationDataList = new CheckoutComAPMConfigurationDataList();
        apmConfigurationDataList.setAvailableApmConfigurations(checkoutComAPMAvailabilityFacade.getAvailableApmsByCountryCode(countryCode));
        return dataMapper.map(apmConfigurationDataList, CheckoutComAPMConfigurationListWsDTO.class, fields);
    }

}
