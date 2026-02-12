package com.checkout.hybris.addon.controllers.cms;

import de.hybris.platform.addonsupport.controllers.cms.GenericCMSAddOnComponentController;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CheckoutComGenericCMSAddOnComponentController extends GenericCMSAddOnComponentController {

    @RequestMapping
    @Override
    public String handleGet(HttpServletRequest request, HttpServletResponse response, Model model) throws Exception {
        return super.handleGet(request, response, model);
    }
}
