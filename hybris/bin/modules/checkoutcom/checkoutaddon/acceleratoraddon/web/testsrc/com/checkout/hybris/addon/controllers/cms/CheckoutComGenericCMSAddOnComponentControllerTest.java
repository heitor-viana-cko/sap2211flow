package com.checkout.hybris.addon.controllers.cms;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.cms2.model.contents.components.AbstractCMSComponentModel;
import de.hybris.platform.cms2.servicelayer.services.impl.DefaultCMSComponentService;
import de.hybris.platform.core.model.type.ComposedTypeModel;
import de.hybris.platform.servicelayer.model.ModelService;
import de.hybris.platform.servicelayer.type.TypeService;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.ui.Model;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComGenericCMSAddOnComponentControllerTest{

    private static final String COMPONENT = "component";
    private static final String PROPERTY_NAME = "property_name";
    private static final String PROPERTY_VALUE = "property_value";
    private static final String EXTENSION_NAME = "extension_name";
    private static final String COMPONENT_TYPE = "MockAbstractCMSComponentModel";
    private static final String VIEW_NAME = "addon:/extension_name/cms/mockabstractcmscomponentmodel";
    private static final String COMPONENT_UID = "componentUid";
    private static final String COMPONENT_UID_VALUE = "componentUidValue";
    @Mock
    private Model mockModel;
    @Mock
    private HttpServletRequest mockRequest;
    @Mock
    private HttpServletResponse mockResponse;
    @Mock
    private DefaultCMSComponentService mockCmsComponentService;
    @Mock
    private AbstractCMSComponentModel mockAbstractCMSComponentModel;
    @Mock
    private ModelService mockModelService;

    @Mock(name = "typeService")
    private TypeService mockTypeService;

    @Mock
    private ComposedTypeModel mockComposedType;

    @Spy
    @InjectMocks
    private CheckoutComGenericCMSAddOnComponentController testObj;

    @Before
    public void setUp()
    {
        given(mockCmsComponentService.getReadableEditorProperties(mockAbstractCMSComponentModel))
            .willReturn(Collections.singletonList(PROPERTY_NAME));
        given(mockTypeService.getComposedTypeForCode(any())).willReturn(mockComposedType);
        given(mockComposedType.getExtensionName()).willReturn(EXTENSION_NAME);
    }

    @Test
    public void testRenderView() throws Exception {
        given(mockRequest.getAttribute(COMPONENT)).willReturn(mockAbstractCMSComponentModel);
        given(mockAbstractCMSComponentModel.getItemtype()).willReturn(COMPONENT_TYPE);
        given(mockModelService.getAttributeValue(mockAbstractCMSComponentModel, PROPERTY_NAME))
            .willReturn(Collections.singletonList(PROPERTY_VALUE));

        final String viewName = testObj.handleGet(mockRequest, mockResponse, mockModel);
        verify(mockModel, Mockito.times(1)).
            addAttribute(COMPONENT, mockAbstractCMSComponentModel);
        verify(mockModel, Mockito.times(1)).
            addAttribute(PROPERTY_NAME, Collections.singletonList(PROPERTY_VALUE));
        Assert.assertEquals(VIEW_NAME, viewName);
    }

    @Test
    public void testRenderViewComponentNull() throws Exception {
        given(mockRequest.getAttribute(COMPONENT)).willReturn(null);
        given(mockRequest.getAttribute(COMPONENT_UID)).willReturn(COMPONENT_UID_VALUE);
        given(mockCmsComponentService.getAbstractCMSComponent(COMPONENT_UID_VALUE)).willReturn(mockAbstractCMSComponentModel);
        given(mockAbstractCMSComponentModel.getItemtype()).willReturn(COMPONENT_TYPE);
        given(mockModelService.getAttributeValue(mockAbstractCMSComponentModel, PROPERTY_NAME))
            .willReturn(Collections.singletonList(PROPERTY_VALUE));


        final String viewName = testObj.handleGet(mockRequest, mockResponse, mockModel);
        verify(mockModel, Mockito.times(1)).addAttribute(COMPONENT, mockAbstractCMSComponentModel);
        verify(mockModel, Mockito.times(1)).addAttribute(PROPERTY_NAME, Collections.singletonList(PROPERTY_VALUE));
        Assert.assertEquals(VIEW_NAME, viewName);
    }
}
