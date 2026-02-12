package com.checkout.hybris.addon.interceptors.beforeview;

import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static org.junit.Assert.assertEquals;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComIsMerchantABCBeforeViewHandlerTest {
    private static final String isABCKey = "isABC";

    ModelAndView modelAndView;
    
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService;
    @Mock
    HttpServletRequest request;
    @Mock
    HttpServletResponse response;
    
    @InjectMocks
    private CheckoutComIsMerchantABCBeforeViewHandler testObj; 

    @Before
    public void setUp() {
        testObj = new CheckoutComIsMerchantABCBeforeViewHandler(checkoutComMerchantConfigurationService);
        modelAndView = new ModelAndView();
    }

    @Test
    public void beforeView_ShouldReturnFalse_IfMerchantIsNAS() throws Exception {
        testObj.beforeView(request, response, modelAndView);

        assertEquals(Boolean.FALSE, modelAndView.getModel().get(isABCKey));
    }

}
