package com.checkout.hybris.core.payment.services.impl;

import com.checkout.hybris.core.address.services.CheckoutComAddressService;
import com.checkout.hybris.core.enums.EnvironmentType;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.*;
import com.checkout.hybris.core.order.daos.CheckoutComOrderDao;
import com.checkout.hybris.core.payment.daos.CheckoutComPaymentInfoDao;
import com.checkout.payments.response.source.CardResponseSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.commerceservices.service.data.CommerceCheckoutParameter;
import de.hybris.platform.core.model.order.AbstractOrderModel;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.OrderModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.core.model.user.CustomerModel;
import de.hybris.platform.servicelayer.model.ModelService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.apache.commons.lang.StringUtils.isBlank;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@UnitTest
@ExtendWith(MockitoExtension.class)
public class DefaultCheckoutComPaymentInfoServiceTest {

    private static final String SITE_ID = "electronics";
    private static final String CART_CODE = "CART_CODE";
    private static final String QR_CODE_DATA_VALUE = "gesbyhnfuerwfluihltgsbdkljnkwb5tfrcduegw";
    private static final String PAYMENT_1_CODE = "payment1Code";
    private static final String PAYMENT_2_CODE = "payment2Code";
    private static final String SUBSCRIPTION_ID = "subscriptionID";
    private static final String RESPONSE = "response";
    private static final String REQUEST = "request";
    private static final String PAYMENT_REFERENCE = "paymentReference";
    private static final String PAYLOAD = "payload";

    @Spy
    @InjectMocks
    private DefaultCheckoutComPaymentInfoService testObj;

    @Mock
    private ModelService modelServiceMock;
    @Mock
    private CheckoutComAddressService addressServiceMock;
    @Mock
    private CheckoutComPaymentInfoDao checkoutComPaymentInfoDaoMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;
    @Mock
    private CheckoutComOrderDao checkoutComOrderDaoMock;

    @Mock
    private CartModel cartModelMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel checkoutComCreditCardPaymentInfoModelMock;
    @Mock
    private PaymentInfoModel paymentInfoModelMock;
    @Mock
    private CustomerModel userMock;
    @Mock
    private AddressModel paymentAddressMock;
    @Mock
    private AddressModel clonedAddressMock;
    @Mock
    private CheckoutComAPMPaymentInfoModel redirectApmPaymentInfoMock;
    @Mock
    private CheckoutComBenefitPayPaymentInfoModel benefitPayPaymentInfoMock;
    @Mock
    private CheckoutComCreditCardPaymentInfoModel cardPaymentInfoMock, userPaymentInfo1Mock, userPaymentInfo2Mock;
    @Mock
    private PayloadModel payloadModelMock;
    @Mock
    private CardResponseSource requestCardSourceMock;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private OrderModel orderMock;
    @Mock
    private CheckoutComFawryPaymentInfoModel fawryPaymentInfoMock;

    @BeforeEach
    public void setUp() {
        lenient().when(cartModelMock.getUser()).thenReturn(userMock);
        lenient().when(cartModelMock.getCode()).thenReturn(CART_CODE);
        lenient().when(cartModelMock.getPaymentInfo()).thenReturn(paymentInfoModelMock);
        lenient().doReturn(modelServiceMock).when(testObj).callSuperModelService();
        lenient().when(paymentInfoModelMock.getItemtype()).thenReturn(PaymentInfoModel._TYPECODE);
        lenient().when(cartModelMock.getPaymentAddress()).thenReturn(paymentAddressMock);
        lenient().when(orderMock.getPaymentInfo()).thenReturn(cardPaymentInfoMock);
        lenient().when(cardPaymentInfoMock.getCode()).thenReturn(PAYMENT_1_CODE);
        lenient().when(cardPaymentInfoMock.getUser()).thenReturn(userMock);
        lenient().when(cartModelMock.getPaymentInfo()).thenReturn(cardPaymentInfoMock);
        lenient().when(userMock.getPaymentInfos()).thenReturn(List.of(userPaymentInfo1Mock, userPaymentInfo2Mock));
        lenient().when(requestCardSourceMock.getId()).thenReturn(SUBSCRIPTION_ID);
        lenient().when(cartModelMock.getUser()).thenReturn(userMock);
        lenient().when(userMock.getPaymentInfos()).thenReturn(List.of(userPaymentInfo1Mock, userPaymentInfo2Mock));
        lenient().when(userPaymentInfo1Mock.getCode()).thenReturn(PAYMENT_1_CODE);
        lenient().when(userPaymentInfo2Mock.getCode()).thenReturn(PAYMENT_2_CODE);
        lenient().when(checkoutComPaymentInfoDaoMock.findPaymentInfosByPaymentId(PAYMENT_1_CODE)).thenReturn(List.of(paymentInfoModelMock, cardPaymentInfoMock));
        lenient().when(paymentInfoModelMock.getOwner()).thenReturn(orderMock);
        lenient().when(cardPaymentInfoMock.getOwner()).thenReturn(userMock);
        lenient().when(orderMock.getSite().getUid()).thenReturn(SITE_ID);
    }

    @Test
    public void createPaymentInfo_WhenNullCart_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.createPaymentInfo(checkoutComCreditCardPaymentInfoModelMock, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void createPaymentInfo_WhenNullPaymentInfo_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.createPaymentInfo(null, cartModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void createPaymentInfo_WhenCheckoutComCreditCardInfo_ShouldWorkProperly() {
        doReturn(clonedAddressMock).when(testObj).cloneAndSetBillingAddressFromCart(cartModelMock, checkoutComCreditCardPaymentInfoModelMock);

        testObj.createPaymentInfo(checkoutComCreditCardPaymentInfoModelMock, cartModelMock);

        final InOrder inOrder = inOrder(checkoutComCreditCardPaymentInfoModelMock, modelServiceMock, cartModelMock);
        inOrder.verify(checkoutComCreditCardPaymentInfoModelMock).setUser(userMock);
        inOrder.verify(modelServiceMock).save(checkoutComCreditCardPaymentInfoModelMock);
        inOrder.verify(cartModelMock).setPaymentInfo(checkoutComCreditCardPaymentInfoModelMock);
        inOrder.verify(modelServiceMock).save(cartModelMock);
    }

    @Test
    public void createPaymentInfo_ForApmPaymentInfo_ShouldWorkProperly() {
        doReturn(clonedAddressMock).when(testObj).cloneAndSetBillingAddressFromCart(cartModelMock, redirectApmPaymentInfoMock);

        testObj.createPaymentInfo(redirectApmPaymentInfoMock, cartModelMock);

        final InOrder inOrder = inOrder(redirectApmPaymentInfoMock, modelServiceMock, cartModelMock);
        inOrder.verify(redirectApmPaymentInfoMock).setUser(userMock);
        inOrder.verify(modelServiceMock).save(redirectApmPaymentInfoMock);
        inOrder.verify(cartModelMock).setPaymentInfo(redirectApmPaymentInfoMock);
        inOrder.verify(modelServiceMock).save(cartModelMock);
    }

    @Test
    public void createPaymentInfo_ForBenefitPaymentInfo_ShouldWorkProperly() {
        doReturn(clonedAddressMock).when(testObj).cloneAndSetBillingAddressFromCart(cartModelMock, benefitPayPaymentInfoMock);

        testObj.createPaymentInfo(benefitPayPaymentInfoMock, cartModelMock);

        final InOrder inOrder = inOrder(benefitPayPaymentInfoMock, modelServiceMock, cartModelMock);
        inOrder.verify(benefitPayPaymentInfoMock).setUser(userMock);
        inOrder.verify(modelServiceMock).save(benefitPayPaymentInfoMock);
        inOrder.verify(cartModelMock).setPaymentInfo(benefitPayPaymentInfoMock);
        inOrder.verify(modelServiceMock).save(cartModelMock);
    }

    @Test
    public void createPaymentInfo_ForFawryPaymentInfo_ShouldWorkProperly() {
        doReturn(clonedAddressMock).when(testObj).cloneAndSetBillingAddressFromCart(cartModelMock, fawryPaymentInfoMock);

        testObj.createPaymentInfo(fawryPaymentInfoMock, cartModelMock);

        final InOrder inOrder = inOrder(fawryPaymentInfoMock, modelServiceMock, cartModelMock);
        inOrder.verify(fawryPaymentInfoMock).setUser(userMock);
        inOrder.verify(modelServiceMock).save(fawryPaymentInfoMock);
        inOrder.verify(cartModelMock).setPaymentInfo(fawryPaymentInfoMock);
        inOrder.verify(modelServiceMock).save(cartModelMock);
    }

    @Test
    public void createPaymentInfo_ForGenericPaymentInfo_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.createPaymentInfo(paymentInfoModelMock, cartModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void removePaymentInfo_WhenNullCart_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.removePaymentInfo(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void removePaymentInfo_WhenNullPaymentInfo_ShouldThrowException() {
        when(cartModelMock.getPaymentInfo()).thenReturn(null);
        assertThatThrownBy(() -> testObj.removePaymentInfo(cartModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void removePaymentInfo_ShouldRemovePaymentInfoFromCart() {
        testObj.removePaymentInfo(cartModelMock);

        verify(modelServiceMock).remove(cardPaymentInfoMock);
        verify(modelServiceMock).save(cartModelMock);
    }

    @Test
    public void cloneAndSetBillingAddressFromCart_WhenCartIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.cloneAndSetBillingAddressFromCart(null, paymentInfoModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void cloneAndSetBillingAddressFromCart_WhenPaymentAddressNull_ShouldThrowException() {
        when(cartModelMock.getPaymentAddress()).thenReturn(null);
        assertThatThrownBy(() -> testObj.cloneAndSetBillingAddressFromCart(cartModelMock, paymentInfoModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void cloneAndSetBillingAddressFromCart_WhenEverythingIsCorrect_Should() {
        when(addressServiceMock.cloneAddressForOwner(paymentAddressMock, paymentInfoModelMock)).thenReturn(new AddressModel());

        final AddressModel result = testObj.cloneAndSetBillingAddressFromCart(cartModelMock, paymentInfoModelMock);

        Assertions.assertTrue(result.getBillingAddress());
        Assertions.assertFalse(result.getShippingAddress());
        Assertions.assertEquals(paymentInfoModelMock, result.getOwner());
        verify(paymentInfoModelMock).setBillingAddress(result);
    }

    @Test
    public void isValidCreditCardPaymentInfo_WhenCartPaymentIsInvalid_ShouldReturnFalse() {
        Assertions.assertFalse(testObj.isValidCreditCardPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidCreditCardPaymentInfo_WhenCardTokenIsNull_ShouldReturnFalse() {
        when(cartModelMock.getPaymentInfo()).thenReturn(checkoutComCreditCardPaymentInfoModelMock);

        Assertions.assertFalse(testObj.isValidCreditCardPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidCreditCardPaymentInfo_WhenCardPaymentIsValid_ShouldReturnTrue() {
        when(cartModelMock.getPaymentInfo()).thenReturn(checkoutComCreditCardPaymentInfoModelMock);
        when(checkoutComCreditCardPaymentInfoModelMock.getCardToken()).thenReturn("someToken");

        Assertions.assertTrue(testObj.isValidCreditCardPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidRedirectApmPaymentInfo_WhenApmIsInvalid_ShouldReturnFalse() {
        Assertions.assertFalse(testObj.isValidRedirectApmPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidRedirectApmPaymentInfo_WhenApmTypeIsNull_ShouldReturnFalse() {
        when(cartModelMock.getPaymentInfo()).thenReturn(redirectApmPaymentInfoMock);

        Assertions.assertFalse(testObj.isValidRedirectApmPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidRedirectApmPaymentInfo_WhenApmIsValid_ShouldReturnTrue() {
        when(cartModelMock.getPaymentInfo()).thenReturn(redirectApmPaymentInfoMock);
        when(redirectApmPaymentInfoMock.getType()).thenReturn("APM");

        Assertions.assertTrue(testObj.isValidRedirectApmPaymentInfo(cartModelMock));
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_WhenCartIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.isUserDataRequiredApmPaymentMethod(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_WhenCartDoesNotHavePaymentInfo_ShouldThrowException() {
        when(cartModelMock.getPaymentInfo()).thenReturn(null);
        assertThatThrownBy(() -> testObj.isUserDataRequiredApmPaymentMethod(cartModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_WhenCartHasNotApmPaymentInfo_ShouldReturnFalse() {
        Assertions.assertFalse(testObj.isUserDataRequiredApmPaymentMethod(cartModelMock));
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_WhenSessionCartHasRedirectApmPaymentInfoWithDataRequiredForm_ShouldReturnTrue
            () {
        when(cartModelMock.getPaymentInfo()).thenReturn(redirectApmPaymentInfoMock);
        when(redirectApmPaymentInfoMock.getUserDataRequired()).thenReturn(true);

        Assertions.assertTrue(testObj.isUserDataRequiredApmPaymentMethod(cartModelMock));
    }

    @Test
    public void isUserDataRequiredApmPaymentMethod_WhenSessionCartHasRedirectApmPaymentInfoWithoutDataRequiredForm_ShouldReturnFalse
            () {
        when(cartModelMock.getPaymentInfo()).thenReturn(redirectApmPaymentInfoMock);
        when(redirectApmPaymentInfoMock.getUserDataRequired()).thenReturn(false);

        Assertions.assertFalse(testObj.isUserDataRequiredApmPaymentMethod(cartModelMock));
    }

    @Test
    public void isValidPaymentInfo_WhenPaymentInfoIsValid_ShouldReturnTrue() {
        doReturn(true).when(testObj).isValidCreditCardPaymentInfo(cartModelMock);

        Assertions.assertTrue(testObj.isValidPaymentInfo(cartModelMock));
    }

    @Test
    public void isValidPaymentInfo_WhenPaymentInfoIsNotValid_ShouldReturnFalse() {
        doReturn(false).when(testObj).isValidCreditCardPaymentInfo(cartModelMock);
        doReturn(false).when(testObj).isValidRedirectApmPaymentInfo(cartModelMock);

        Assertions.assertFalse(testObj.isValidPaymentInfo(cartModelMock));
    }

    @Test
    public void addQRCodeDataToBenefitPaymentInfo_WhenPaymentInfoIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.addQRCodeDataToBenefitPaymentInfo(null, QR_CODE_DATA_VALUE)).isInstanceOf(IllegalArgumentException.class);

    }

    @Test
    public void addQRCodeDataToBenefitPaymentInfo_WhenUserDataIsBlank_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.addQRCodeDataToBenefitPaymentInfo(benefitPayPaymentInfoMock, "    ")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void addQRCodeDataToBenefitPaymentInfo_WhenUserDataIsPresent_ShouldUpdatePaymentInfoProperly() {
        testObj.addQRCodeDataToBenefitPaymentInfo(benefitPayPaymentInfoMock, QR_CODE_DATA_VALUE);

        verify(benefitPayPaymentInfoMock).setQrCode(QR_CODE_DATA_VALUE);
        verify(modelServiceMock).save(benefitPayPaymentInfoMock);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenPaymentInfoIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.addSubscriptionIdToUserPayment(null, requestCardSourceMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenMarkedToSaveCard_ShouldSetSubscription() {
        when(cardPaymentInfoMock.getMarkToSave()).thenReturn(true);

        testObj.addSubscriptionIdToUserPayment(cardPaymentInfoMock, requestCardSourceMock);

        final InOrder inOrder = inOrder(userPaymentInfo1Mock, modelServiceMock);
        inOrder.verify(userPaymentInfo1Mock).setSaved(true);
        inOrder.verify(userPaymentInfo1Mock).setSubscriptionId(SUBSCRIPTION_ID);
        inOrder.verify(modelServiceMock).save(userPaymentInfo1Mock);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenNoMatchUserPayment_ShouldNotSetSubscription() {
        when(cardPaymentInfoMock.getMarkToSave()).thenReturn(true);
        when(userMock.getPaymentInfos()).thenReturn(List.of(userPaymentInfo2Mock));

        testObj.addSubscriptionIdToUserPayment(cardPaymentInfoMock, requestCardSourceMock);

        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenNotMarkedToSaveCard_ShouldNotSetSubscription() {
        when(cardPaymentInfoMock.getMarkToSave()).thenReturn(false);

        testObj.addSubscriptionIdToUserPayment(cardPaymentInfoMock, requestCardSourceMock);

        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenNotCardSource_ShouldNotSetSubscription() {
        when(cardPaymentInfoMock.getMarkToSave()).thenReturn(false);

        testObj.addSubscriptionIdToUserPayment(cardPaymentInfoMock, requestCardSourceMock);

        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void addSubscriptionToUserPayment_WhenSourceIdNull_ShouldNotSetSubscription() {
        when(cardPaymentInfoMock.getMarkToSave()).thenReturn(false);

        testObj.addSubscriptionIdToUserPayment(cardPaymentInfoMock, requestCardSourceMock);

        verifyNoInteractions(modelServiceMock);
    }

    @Test
    public void addPaymentId_ShouldAddThePaymentIdIntoTheCartPaymentInfo() {
        testObj.addPaymentId(PAYMENT_1_CODE, cardPaymentInfoMock);

        final InOrder inOrder = inOrder(cardPaymentInfoMock, modelServiceMock);
        inOrder.verify(cardPaymentInfoMock).setPaymentId(PAYMENT_1_CODE);
        inOrder.verify(modelServiceMock).save(cardPaymentInfoMock);
    }

    @Test
    public void addPaymentId_WhenPaymentInfoIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.addPaymentId(PAYMENT_1_CODE, null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void addPaymentId_WhenPaymentIdIsBlank_ShouldThrowException() {
        assertThatThrownBy(() -> testObj.addPaymentId("    ", paymentInfoModelMock)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void createCommerceCheckoutParameter_WhenGivenInputsAreCorrect_ShouldCreateCorrectCommerceCheckoutParameter() {
        final CommerceCheckoutParameter result = testObj.createCommerceCheckoutParameter(cartModelMock);

        Assertions.assertEquals(cartModelMock, result.getCart());
        Assertions.assertTrue(result.isEnableHooks());
    }

    @Test
    public void getSiteIdFromPaymentId_WhenPaymentIdExistsInAbstractOrder_ShouldReturnSiteId() {
        final String result = testObj.getSiteIdFromPaymentId(PAYMENT_1_CODE);

        Assertions.assertEquals(SITE_ID, result);
    }

    @Test
    public void getSiteIdFromPaymentId_WhenPaymentIdDoesNotBelongToAbstractOrder_ShouldReturnEmptyString() {
        when(checkoutComPaymentInfoDaoMock.findPaymentInfosByPaymentId(PAYMENT_1_CODE)).thenReturn(Collections.emptyList());

        final String result = testObj.getSiteIdFromPaymentId(PAYMENT_1_CODE);

        Assertions.assertTrue(isBlank(result));
    }

    @Test
    public void findAbstractOrderByPaymentId_WhenPaymentIdExistsInAbstractOrder_ShouldReturnSiteId() {
        final List<AbstractOrderModel> result = testObj.findAbstractOrderByPaymentId(PAYMENT_1_CODE);

        Assertions.assertEquals(1, result.size());
        Assertions.assertEquals(orderMock, result.get(0));
    }

    @Test
    public void findAbstractOrderByPaymentId_WhenPaymentIdDoesNotBelongToAbstractOrder_ShouldReturnEmptyString() {
        when(checkoutComPaymentInfoDaoMock.findPaymentInfosByPaymentId(PAYMENT_1_CODE)).thenReturn(List.of(cardPaymentInfoMock));

        final List<AbstractOrderModel> result = testObj.findAbstractOrderByPaymentId(PAYMENT_1_CODE);

        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    public void getPaymentInfosByPaymentId_ShouldCallDao() {
        testObj.getPaymentInfosByPaymentId(PAYMENT_1_CODE);

        verify(checkoutComPaymentInfoDaoMock).findPaymentInfosByPaymentId(PAYMENT_1_CODE);
    }

    @Test
    public void saveRequestAndResponseInOrder_shouldCallModelService() {
        when(orderMock.getRequestsPayload()).thenReturn(Collections.emptyList());
        when(orderMock.getResponsesPayload()).thenReturn(Collections.emptyList());
        doReturn(payloadModelMock).when(testObj).createPayloadModel(anyString());

        testObj.saveRequestAndResponseInOrder(orderMock, REQUEST, RESPONSE);

        verify(modelServiceMock).save(orderMock);
    }

    @Test
    public void saveResponseInOrderByPaymentReference_shouldCallModelService_whenOrderIsFound() {
        when(orderMock.getRequestsPayload()).thenReturn(Collections.emptyList());
        when(orderMock.getResponsesPayload()).thenReturn(Collections.emptyList());
        doReturn(payloadModelMock).when(testObj).createPayloadModel(anyString());
        doReturn(Optional.of(orderMock))
                .when(checkoutComOrderDaoMock).findAbstractOrderForPaymentReferenceNumber(PAYMENT_REFERENCE);

        testObj.saveResponseInOrderByPaymentReference(PAYMENT_REFERENCE, RESPONSE);

        verify(modelServiceMock).save(orderMock);
    }

    @Test
    public void logInfoOutput_shouldLogInfo_whenEnvironmentEqualsTest() {
        when(checkoutComMerchantConfigurationServiceMock.getEnvironment()).thenReturn(EnvironmentType.TEST);
        testObj.logInfoOut(PAYLOAD);

        verify(checkoutComMerchantConfigurationServiceMock).getEnvironment();
    }

    @Test
    public void logInfoOutput_shouldLogInfo_whenEnvironmentEqualsPROD() {
        when(checkoutComMerchantConfigurationServiceMock.getEnvironment()).thenReturn(EnvironmentType.PRODUCTION);
        testObj.logInfoOut(PAYLOAD);

        verify(checkoutComMerchantConfigurationServiceMock).getEnvironment();
    }

    @Test
    public void createPayloadModel_shouldCreatePayloadModel() {
        when(modelServiceMock.create(PayloadModel.class)).thenReturn(payloadModelMock);

        testObj.createPayloadModel(PAYLOAD);

        verify(payloadModelMock).setPayload(PAYLOAD);
        verify(modelServiceMock).save(payloadModelMock);
    }
}
