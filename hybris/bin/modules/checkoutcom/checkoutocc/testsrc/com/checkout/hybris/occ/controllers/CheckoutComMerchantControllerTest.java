package com.checkout.hybris.occ.controllers;

import com.checkout.hybris.facades.merchant.CheckoutComMerchantConfigurationFacade;
import com.fasterxml.jackson.core.JsonProcessingException;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static java.awt.geom.Path2D.contains;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComMerchantControllerTest {

    private static final String PUBLIC_KEY = "publicKey";
    private static final String IS_ABC_FALSE = "false";
    private static final String TEST_ENVIRONMENT = "testEnvironment";
    private static final String BODY = "body";

    @InjectMocks
    private CheckoutComMerchantController testObj;

    @Mock
    private CheckoutComMerchantConfigurationFacade checkoutComMerchantConfigurationFacadeMock;

    @Test
    public void getMerchantKey_WhenPublicKeyIsNotEmpty_ShouldReturnMerchantPublicKey() throws JsonProcessingException {
        when(checkoutComMerchantConfigurationFacadeMock.getCheckoutComMerchantPublicKey()).thenReturn(PUBLIC_KEY);
        when(checkoutComMerchantConfigurationFacadeMock.getCheckoutComMerchantEnvironment()).thenReturn(TEST_ENVIRONMENT);

        final ResponseEntity<String> result = testObj.getMerchantKey();

        assertThat(result.getBody()).isEqualTo("{\"environment\":\"testEnvironment\",\"publicKey\":\"publicKey\"}");
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void isMerchantABC_WhenMerchantIsUndefined_ShouldReturnFalse() {
        final ResponseEntity<String> result = testObj.isMerchantABC();

        assertThat(result).hasFieldOrPropertyWithValue(BODY, IS_ABC_FALSE);
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

}
