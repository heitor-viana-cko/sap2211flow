package com.checkout.hybris.facades.order.converters.populators;

import com.checkout.hybris.core.model.CheckoutComAPMPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComBenefitPayPaymentInfoModel;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.resolvers.CheckoutComPaymentTypeResolver;
import com.checkout.hybris.facades.beans.CheckoutComPaymentInfoData;
import com.checkout.hybris.facades.payment.info.mappers.CheckoutComApmPaymentInfoPopulatorMapper;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commercefacades.order.data.AbstractOrderData;
import de.hybris.platform.converters.Populator;
import de.hybris.platform.core.model.order.AbstractOrderModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import de.hybris.platform.servicelayer.model.ModelService;
import de.hybris.platform.store.BaseStoreModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComAbstractOrderPopulatorTest {

    private static final String QR_CODE_DATA = "qrCodeData";
    private static final String ACCOUNT_MASK = "accountMask";
    private static final String BASE_STORE_NAME = "Base Store Name";

    @InjectMocks
    private CheckoutComAbstractOrderPopulator testObj;

    @Mock
    private CheckoutComPaymentTypeResolver checkoutComPaymentTypeResolverMock;
    @Mock
    private CheckoutComApmPaymentInfoPopulatorMapper checkoutComApmPaymentInfoPopulatorMapperMock;
    @Mock
    private Populator<CheckoutComAPMPaymentInfoModel, CheckoutComPaymentInfoData> checkoutComPaymentInfoPopulatorMock;
    @Mock
    private ModelService modelServiceMock;

    @Mock
    private CustomerModel customerMock;
    @Mock
    private BaseStoreModel baseStoreMock;
    @Mock
    private AbstractOrderData targetMock;
    @Mock
    private AbstractOrderModel sourceMock;
    @Mock
    private CheckoutComAchPaymentInfoModel achPaymentInfoMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel ccPaymentInfoMock;
    @Mock
    private CheckoutComPaymentInfoData checkoutComPaymentInfoDataMock;
    @Mock
    private CheckoutComBenefitPayPaymentInfoModel checkoutComApmPaymentInfoMock;
    @Mock
    private AddressModel addressMock;

    @Captor
    private ArgumentCaptor<CheckoutComPaymentInfoData> paymentInfoDataArgumentCaptor;

    @Before
    public void setUp() {
        when(sourceMock.getPaymentInfo()).thenReturn(checkoutComApmPaymentInfoMock);
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(checkoutComApmPaymentInfoMock)).thenReturn(CheckoutComPaymentType.BENEFITPAY);
        when(checkoutComApmPaymentInfoPopulatorMapperMock.findPopulator(CheckoutComPaymentType.BENEFITPAY)).thenReturn(checkoutComPaymentInfoPopulatorMock);
        when(sourceMock.getStore()).thenReturn(baseStoreMock);
        when(baseStoreMock.getName()).thenReturn(BASE_STORE_NAME);
        when(sourceMock.getUser()).thenReturn(customerMock);
    }

    @Test(expected = IllegalArgumentException.class)
    public void populate_WithNullSource_ShouldThrowException() {
        testObj.populate(null, targetMock);
    }

    @Test(expected = IllegalArgumentException.class)
    public void populate_WithNullTarget_ShouldThrowException() {
        testObj.populate(sourceMock, null);
    }

    @Test
    public void populate_WhenCheckoutComApmPaymentInfo_ShouldPopulateCheckoutComPaymentInfoAndBaseStoreNameDataCorrectly() {
        testObj.populate(sourceMock, targetMock);

        final InOrder inOrder = inOrder(checkoutComPaymentTypeResolverMock, checkoutComApmPaymentInfoPopulatorMapperMock, checkoutComPaymentInfoPopulatorMock, targetMock);
        inOrder.verify(checkoutComPaymentTypeResolverMock).resolvePaymentType(checkoutComApmPaymentInfoMock);
        inOrder.verify(checkoutComApmPaymentInfoPopulatorMapperMock).findPopulator(CheckoutComPaymentType.BENEFITPAY);
        inOrder.verify(checkoutComPaymentInfoPopulatorMock).populate(eq(checkoutComApmPaymentInfoMock), paymentInfoDataArgumentCaptor.capture());
        final CheckoutComPaymentInfoData infoDataValue = paymentInfoDataArgumentCaptor.getValue();
        inOrder.verify(targetMock).setCheckoutComPaymentInfo(infoDataValue);
        inOrder.verify(targetMock).setBaseStoreName(BASE_STORE_NAME);
        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void populate_WhenCCPaymentInfo_ShouldSetPaymentType() {
        when(sourceMock.getPaymentInfo()).thenReturn(ccPaymentInfoMock);
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(ccPaymentInfoMock)).thenReturn(CheckoutComPaymentType.CARD);

        testObj.populate(sourceMock, targetMock);

        verify(targetMock).setCheckoutPaymentType(CheckoutComPaymentType.CARD.name());
        verifyNoInteractions(checkoutComApmPaymentInfoPopulatorMapperMock);
        verifyNoInteractions(checkoutComPaymentInfoPopulatorMock);
        verifyNoInteractions(modelServiceMock);
        verify(targetMock).setBaseStoreName(BASE_STORE_NAME);
        verifyNoMoreInteractions(targetMock);
    }

    @Test
    public void populate_WhenPaymentInfoDoesNotContainBillingAddressNorTheSourceObjectContainsPaymentAddress_ModelServiceShouldNotBeInvoked() {
        when(sourceMock.getPaymentInfo()).thenReturn(ccPaymentInfoMock);
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(ccPaymentInfoMock)).thenReturn(CheckoutComPaymentType.CARD);

        testObj.populate(sourceMock, targetMock);

        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void populate_WhenPaymentInfoDoesNotContainBillingAddressButTheSourceObjectContainsPaymentAddress_ModelServiceShouldBeInvoked() {
        when(sourceMock.getPaymentInfo()).thenReturn(ccPaymentInfoMock);
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(ccPaymentInfoMock)).thenReturn(CheckoutComPaymentType.CARD);
        when(sourceMock.getPaymentAddress()).thenReturn(addressMock);
        when(modelServiceMock.clone(addressMock)).thenReturn(addressMock);

        testObj.populate(sourceMock, targetMock);

        verify(modelServiceMock).clone(addressMock);
    }

    @Test
    public void populate_WhenACHPaymentInfo_ShouldSetAccountNumber() {
        when(checkoutComPaymentTypeResolverMock.resolvePaymentType(achPaymentInfoMock)).thenReturn(CheckoutComPaymentType.ACH);
        when(checkoutComApmPaymentInfoPopulatorMapperMock.findPopulator(CheckoutComPaymentType.ACH)).thenReturn(checkoutComPaymentInfoPopulatorMock);
        when(sourceMock.getPaymentInfo()).thenReturn(achPaymentInfoMock);
        when(achPaymentInfoMock.getMask()).thenReturn(ACCOUNT_MASK);

        testObj.populate(sourceMock, targetMock);

        verify(targetMock).setCheckoutComPaymentInfo(paymentInfoDataArgumentCaptor.capture());
        verifyNoInteractions(modelServiceMock);
        final CheckoutComPaymentInfoData paymentData = paymentInfoDataArgumentCaptor.getValue();
        assertThat(paymentData.getAccountNumber()).isEqualTo(ACCOUNT_MASK);
    }

    @Test
    public void populate_WhenBenefitPayPaymentInfo_ShouldPopulateQRCodeData() {
        when(checkoutComApmPaymentInfoMock.getQrCode()).thenReturn(QR_CODE_DATA);

        testObj.populate(sourceMock, targetMock);

        verifyNoInteractions(modelServiceMock);
        verify(targetMock).setCheckoutPaymentType(CheckoutComPaymentType.BENEFITPAY.name());
        verify(targetMock).setQrCodeData(QR_CODE_DATA);
    }
}
