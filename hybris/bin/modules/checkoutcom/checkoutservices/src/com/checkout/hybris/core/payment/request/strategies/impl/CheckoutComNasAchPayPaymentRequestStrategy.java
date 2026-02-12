package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.common.*;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.merchant.services.CheckoutComMerchantConfigurationService;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.apm.RequestAchSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.apache.commons.lang.StringUtils;

import java.util.Map;
import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.ACH;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for ACH payments
 */
public class CheckoutComNasAchPayPaymentRequestStrategy extends CheckoutComAbstractPaymentRequestStrategy {

    protected Map<String, String> accountTypeMapping = Map.of("CHECKING", "CURRENT",
            "SAVINGS", "SAVINGS");

    protected CheckoutComNasAchPayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy, final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper, final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter, final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper, final CheckoutComMerchantConfigurationService checkoutComMerchantConfigurationService) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper, checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper, checkoutComMerchantConfigurationService);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return ACH;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public PaymentRequest createPaymentRequest(final CartModel cart) {
        validateParameterNotNull(cart, "Cart model cannot be null");

        final String currencyIsoCode = cart.getCurrency().getIsocode();
        final Long amount = checkoutPaymentRequestServicesWrapper
                .checkoutComCurrencyService.removeDecimalsFromCurrencyAmount(currencyIsoCode, cart.getTotalPrice());

        final PaymentRequest paymentRequest = getRequestSourcePaymentRequest(cart, currencyIsoCode,
                amount);
        populatePaymentRequest(cart, paymentRequest);

        return paymentRequest;
    }

    @Override
    protected PaymentRequest getRequestSourcePaymentRequest(final CartModel cart,
                                                            final String currencyIsoCode,
                                                            final Long amount) {
        validateParameterNotNull(cart.getPaymentInfo(), "paymentInfo cannot be null");

        if (cart.getPaymentInfo() instanceof CheckoutComAchPaymentInfoModel) {
            final RequestAchSource bankAccountSource = createBankAccountSource(cart);
            return PaymentRequest.builder()
                    .source(bankAccountSource)
                    .currency(Currency.valueOf(currencyIsoCode))
                    .amount(amount)
                    .build();

        } else {
            throw new IllegalArgumentException(
                    format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]",
                            cart.getPaymentInfo().getClass().toString(), cart.getCode()));
        }
    }

    /**
     * Creates the source request for the set up payment source request to checkout.com
     *
     * @param cart the cart model
     * @return the populated BankAccountSource
     */
    protected RequestAchSource createBankAccountSource(final CartModel cart) {
        final CheckoutComAchPaymentInfoModel paymentInfo = Optional.ofNullable(cart.getPaymentInfo())
                .filter(
                        CheckoutComAchPaymentInfoModel.class::isInstance)
                .map(CheckoutComAchPaymentInfoModel.class::cast)
                .orElseThrow(IllegalArgumentException::new);


        return RequestAchSource.builder()
                .accountType(AccountType.valueOf(mapAccountType(paymentInfo)))
                .country(CountryCode.valueOf(paymentInfo.getBillingAddress().getCountry().getIsocode()))
                .bankCode(paymentInfo.getBankCode())
                .accountNumber(paymentInfo.getAccountNumber())
                .accountHolder(createAccountHolder(cart))
                .build();
    }

    private String mapAccountType(final CheckoutComAchPaymentInfoModel paymentInfo) {
        return accountTypeMapping.get(paymentInfo.getAccountType().getCode().toUpperCase());
    }

    private AccountHolder createAccountHolder(final CartModel cart) {
        final AddressModel billingAddress = Optional.ofNullable(cart.getPaymentAddress())
                .orElseThrow(IllegalArgumentException::new);
        final CheckoutComAchPaymentInfoModel paymentInfo = (CheckoutComAchPaymentInfoModel) cart.getPaymentInfo();

        return AccountHolder.builder()
                .firstName(billingAddress.getFirstname())
                .lastName(billingAddress.getLastname())
                .email(billingAddress.getEmail())
                .phone(checkoutComPhoneNumberStrategy.createPhone(billingAddress).orElse(null))
                .companyName(paymentInfo.getCompanyName())
                .type(StringUtils.isNotEmpty(paymentInfo.getCompanyName()) ? AccountHolderType.CORPORATE : AccountHolderType.INDIVIDUAL)
                .billingAddress(createAddress(billingAddress))
                .build();
    }

}
