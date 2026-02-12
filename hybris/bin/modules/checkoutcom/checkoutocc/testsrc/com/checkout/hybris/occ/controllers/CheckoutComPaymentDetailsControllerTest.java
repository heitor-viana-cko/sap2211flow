package com.checkout.hybris.occ.controllers;

import com.checkout.hybris.commercefacades.user.CheckoutComUserFacade;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commercefacades.order.data.CCPaymentInfoData;
import de.hybris.platform.commercewebservicescommons.dto.order.PaymentDetailsWsDTO;
import de.hybris.platform.commercewebservicescommons.errors.exceptions.RequestParameterException;
import de.hybris.platform.core.PK;
import de.hybris.platform.webservicescommons.mapping.DataMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;

import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComPaymentDetailsControllerTest {

    @Spy
    @InjectMocks
    private CheckoutComPaymentDetailsController testObj;
    private final String paymentDetailId = "paymentDetailId";
    private final PaymentDetailsWsDTO paymentDetails = new PaymentDetailsWsDTO();

    @Mock
    private CheckoutComUserFacade checkoutComUserFacade;

    @Mock
    private DataMapper dataMapperMock;

    private final CCPaymentInfoData ccPaymentInfoData = new CCPaymentInfoData();


    @Test
    public void replacePaymentDetails_shouldCallUpdateCCPaymentInfo() {
        ensureValidationDoesNotFail();
        ensureDataMapperDoesNotFail();
        ensureCheckoutComUserFacadeReturnsCCPaymentInfoDataForId(paymentDetailId, ccPaymentInfoData);
        ensureUpdateCCPaymentInfoDoesNothing();

        testObj.replacePaymentDetails(paymentDetailId, paymentDetails);

        verify(checkoutComUserFacade).updateCCPaymentInfo(ccPaymentInfoData);
    }

    @Test(expected = RequestParameterException.class)
    public void getPaymentInfo_shouldThrowException_whenGetCCPaymentFails() {

		doThrow(new PK.PKException("")).when(checkoutComUserFacade).getCCPaymentInfoForCode(paymentDetailId);

		testObj.getPaymentInfo(paymentDetailId);
    }

	@Test(expected = RequestParameterException.class)
	public void getPaymentInfo_shouldThrowException_whenPaymentIsNull() {

		doReturn(null).when(checkoutComUserFacade).getCCPaymentInfoForCode(paymentDetailId);

		testObj.getPaymentInfo(paymentDetailId);
	}

    private void ensureCheckoutComUserFacadeReturnsCCPaymentInfoDataForId(final String paymentDetailId,
                                                                          final CCPaymentInfoData ccPaymentInfoData) {
        when(checkoutComUserFacade.getCCPaymentInfoForCode(paymentDetailId)).thenReturn(ccPaymentInfoData);
    }

    private void ensureUpdateCCPaymentInfoDoesNothing() {
        doNothing().when(checkoutComUserFacade).updateCCPaymentInfo(ccPaymentInfoData);
    }

    private void ensureDataMapperDoesNotFail() {
        doNothing().when(dataMapperMock).map(any(), any(), any(), anyBoolean());
    }

    private void ensureValidationDoesNotFail() {
        doNothing().when(testObj).validate(any(), any(), any());
    }
}
