
package com.checkout.hybris.facades.payment.klarna.impl;

import com.checkout.hybris.core.klarna.session.request.KlarnaSessionRequestDto;
import com.checkout.hybris.core.klarna.session.response.KlarnaPartnerMetadataResponseDto;
import com.checkout.hybris.core.klarna.session.response.KlarnaSessionResponseDto;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComKlarnaConfigurationModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentIntegrationService;
import com.checkout.hybris.facades.beans.KlarnaClientTokenData;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.order.CartService;
import de.hybris.platform.servicelayer.dto.converter.Converter;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class DefaultCheckoutComKlarnaFacadeTest {

    private static final String CLIENT_TOKEN = "client_token";
    private static final String INSTANCE_ID = "instance_id";
    private static final String ID = "id";
    private static final String SESSION_ID = "session_id";

    @InjectMocks
    private DefaultCheckoutComKlarnaFacade testObj;

    @Mock
    private CheckoutComPaymentIntegrationService checkoutComPaymentIntegrationServiceMock;
    @Mock
    private Converter<CartModel, KlarnaSessionRequestDto> checkoutComKlarnaSessionRequestDtoConverterMock;
    @Mock
    private CartService cartServiceMock;
    @Mock
    private CartModel cartModelMock;
    @Mock
    private KlarnaSessionRequestDto klarnaRequestSessionMock;
    @Mock
    private KlarnaSessionResponseDto klarnaSessionResponseMock;
    @Mock
    private CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationServiceMock;
    @Mock
    private CheckoutComKlarnaConfigurationModel klarnaConfigurationMock;
    @Mock
    private KlarnaPartnerMetadataResponseDto klarnaPartnerMetadataResponseDtoMock;

    @Before
    public void setUp() throws ExecutionException {
        when(cartServiceMock.getSessionCart()).thenReturn(cartModelMock);
        when(cartServiceMock.hasSessionCart()).thenReturn(true);
        when(checkoutComKlarnaSessionRequestDtoConverterMock.convert(cartModelMock)).thenReturn(klarnaRequestSessionMock);
        when(checkoutComPaymentIntegrationServiceMock.createKlarnaSession(klarnaRequestSessionMock)).thenReturn(klarnaSessionResponseMock);
        when(klarnaSessionResponseMock.getPartnerMetadata()).thenReturn(klarnaPartnerMetadataResponseDtoMock);
        when(klarnaPartnerMetadataResponseDtoMock.getClientToken()).thenReturn(CLIENT_TOKEN);
        when(klarnaPartnerMetadataResponseDtoMock.getSessionId()).thenReturn(SESSION_ID);
        when(klarnaSessionResponseMock.getId()).thenReturn(ID);
        when(checkoutComMerchantConfigurationServiceMock.getKlarnaConfiguration()).thenReturn(klarnaConfigurationMock);
        when(klarnaConfigurationMock.getInstanceId()).thenReturn(INSTANCE_ID);
    }

    @Test
    public void getKlarnaClientToken_WhenIntegrationError_ShouldThrowException() throws ExecutionException {
        when(checkoutComPaymentIntegrationServiceMock.createKlarnaSession(klarnaRequestSessionMock)).thenThrow(new ExecutionException(new Throwable()));

        assertThatThrownBy(() -> testObj.getKlarnaClientToken()).isInstanceOf(ExecutionException.class);
    }

    @Test
    public void getKlarnaClientToken_WhenNoSessionCart_ShouldThrowException() throws ExecutionException {
        when(checkoutComPaymentIntegrationServiceMock.createKlarnaSession(klarnaRequestSessionMock)).thenThrow(new IllegalArgumentException());

        assertThatThrownBy(() -> testObj.getKlarnaClientToken()).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void getKlarnaClientToken_ShouldReturnPopulateClientToken() throws ExecutionException {
        final KlarnaClientTokenData result = testObj.getKlarnaClientToken();

        assertThat(result.getClientToken()).isEqualTo(CLIENT_TOKEN);
        assertThat(result.getInstanceId()).isEqualTo(INSTANCE_ID);
        assertThat(result.getPaymentContext()).isEqualTo(ID);
        assertThat(result.getSessionId()).isEqualTo(SESSION_ID);
        assertThat(result.getSuccess()).isTrue();
    }
}
