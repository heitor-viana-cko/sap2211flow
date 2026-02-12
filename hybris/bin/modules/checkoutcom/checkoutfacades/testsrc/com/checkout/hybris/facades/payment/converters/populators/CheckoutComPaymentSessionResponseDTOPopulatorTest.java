package com.checkout.hybris.facades.payment.converters.populators;

import com.checkout.dto.payment.session.CheckoutComPaymentSessionResponseDTO;
import com.checkout.handlepaymentsandpayouts.flow.paymentsessions.responses.PaymentSessionResponse;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@UnitTest
@ExtendWith(MockitoExtension.class)
class CheckoutComPaymentSessionResponseDTOPopulatorTest {

    private final CheckoutComPaymentSessionResponseDTOPopulator testObj = new CheckoutComPaymentSessionResponseDTOPopulator();

    @Test
    void populate_ShouldPopulatePaymentSessionResponseDTO() {
        final PaymentSessionResponse source = PaymentSessionResponse.builder().paymentSessionSecret("secret").paymentSessionToken("token").id("id").build();
        final CheckoutComPaymentSessionResponseDTO target = new CheckoutComPaymentSessionResponseDTO();

        testObj.populate(source, target);

        assertThat(target.getId()).isEqualTo("id");
        assertThat(target.getPayment_session_secret()).isEqualTo("secret");
        assertThat(target.getPayment_session_token()).isEqualTo("token");
    }

}
