package com.checkout.hybris.core.payment.request.strategies.impl;


import com.checkout.common.*;
import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.currency.services.CheckoutComCurrencyService;
import com.checkout.hybris.core.enums.AchAccountType;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.payments.PaymentType;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestBankAccountSource;
import com.checkout.payments.request.source.apm.RequestAchSource;
import de.hybris.bootstrap.annotations.UnitTest;
import de.hybris.platform.core.model.c2l.CountryModel;
import de.hybris.platform.core.model.c2l.CurrencyModel;
import de.hybris.platform.core.model.c2l.RegionModel;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComNasAchPayPaymentRequestStrategyTest {

	@InjectMocks
	@Spy
	private CheckoutComNasAchPayPaymentRequestStrategy testObj;

    @Mock
    private CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapperMock;
	@Mock
	private CheckoutComCurrencyService checkoutComCurrencyServiceMock;

	@Mock
	private CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategyMock;


	@Before
	public void setUp() throws Exception {
        ReflectionTestUtils.setField(testObj, "checkoutPaymentRequestServicesWrapper", checkoutPaymentRequestServicesWrapperMock);
        ReflectionTestUtils.setField(checkoutPaymentRequestServicesWrapperMock, "checkoutComCurrencyService", checkoutComCurrencyServiceMock);
		doNothing().when(testObj).populatePaymentRequest(any(CartModel.class),
				any(PaymentRequest.class));
	}

	@Test
	public void getStrategyKey_shouldReturnACH() {
		final CheckoutComPaymentType result = testObj.getStrategyKey();

		assertThat(result).isEqualTo(CheckoutComPaymentType.ACH);
	}

	@Test
	public void createPaymentRequest_shouldPopulateSourceObjectWithBankAccountSourceWithTheDetailsStoredInPaymentInfoAndConvertCheckingToCurrent() {
		final CartModel cart = createCartWithPriceAndCurrency(100D, "USD", "CHECKING",
				"Mike", "Hammer", "US", "United States", "new york plaza",
				"square garden", "NY500", "New York", "New York",
				"mike.hammer@email.com", "0043928821", "00012332", "09123");

		final PaymentRequest paymentRequest = testObj.createPaymentRequest(cart);

		final RequestAchSource source = (RequestAchSource) paymentRequest.getSource();
		assertThat(source.getType()).isEqualTo(PaymentSourceType.ACH);
		assertThat(source.getCountry()).isEqualTo(CountryCode.US);
		assertThat(source.getBankCode()).isEqualTo("09123");
		assertThat(source.getAccountNumber()).isEqualTo("00012332");
		assertThat(source.getAccountType()).isEqualTo(AccountType.CURRENT);
		final AccountHolder accountHolder = source.getAccountHolder();
		assertThat(accountHolder.getFirstName()).isEqualTo("Mike");
		assertThat(accountHolder.getLastName()).isEqualTo("Hammer");
		assertThat(accountHolder.getType()).isEqualTo(AccountHolderType.INDIVIDUAL);
	}

	@Test
	public void createPaymentRequest_shouldPopulateAccountTypeToSavings_WhenPaymentInfoContainsSavingsAsAccountType() {
		final CartModel cart = createCartWithPriceAndCurrency(100D, "USD", "SAVINGS",
				"Mike", "Hammer", "US", "United States", "new york plaza",
				"square garden", "NY500", "New York", "New York",
				"mike.hammer@email.com", "0043928821", "00012332", "09123");

		final PaymentRequest paymentRequest = testObj.createPaymentRequest(cart);

        final RequestAchSource source = (RequestAchSource) paymentRequest.getSource();
        assertThat(source.getType()).isEqualTo(PaymentSourceType.ACH);
        assertThat(source.getCountry()).isEqualTo(CountryCode.US);
		assertThat(source.getBankCode()).isEqualTo("09123");
		assertThat(source.getAccountNumber()).isEqualTo("00012332");
		assertThat(source.getAccountType()).isEqualTo(AccountType.SAVINGS);
		final AccountHolder accountHolder = source.getAccountHolder();
		assertThat(accountHolder.getFirstName()).isEqualTo("Mike");
		assertThat(accountHolder.getLastName()).isEqualTo("Hammer");
		assertThat(accountHolder.getType()).isEqualTo(AccountHolderType.INDIVIDUAL);
	}

	private CartModel createCartWithPriceAndCurrency(final Double price,
													 final String currency,
													 final String accountType,
													 final String firstName,
													 final String lastName,
													 final String countryIsocode,
													 final String countryName,
													 final String addressLine1,
													 final String addressLine2,
													 final String zipCode,
													 final String city,
													 final String state,
													 final String email,
													 final String phone,
													 final String accountNumber,
													 final String bankCode) {

		final CountryModel country = mock(CountryModel.class);
		when(country.getIsocode()).thenReturn(countryIsocode);

		final RegionModel regionModel = mock(RegionModel.class);
		when(regionModel.getName()).thenReturn(state);

		final AddressModel billingAddress = new AddressModel();
		billingAddress.setBillingAddress(true);
		billingAddress.setFirstname(firstName);
		billingAddress.setLastname(lastName);
		billingAddress.setEmail(email);
		billingAddress.setPhone1(phone);
		billingAddress.setCountry(country);
		billingAddress.setLine1(addressLine1);
		billingAddress.setLine2(addressLine2);
		billingAddress.setPostalcode(zipCode);
		billingAddress.setTown(city);
		billingAddress.setRegion(regionModel);

		final CurrencyModel usdCurrency = new CurrencyModel();
		usdCurrency.setIsocode(currency);

		final CheckoutComAchPaymentInfoModel checkoutComAchPaymentInfoModel = new CheckoutComAchPaymentInfoModel();
		checkoutComAchPaymentInfoModel.setAccountType(AchAccountType.valueOf(accountType));
		checkoutComAchPaymentInfoModel.setAccountNumber(accountNumber);
		checkoutComAchPaymentInfoModel.setBankCode(bankCode);
		checkoutComAchPaymentInfoModel.setBillingAddress(billingAddress);

		final CartModel cart = new CartModel();
		cart.setCurrency(usdCurrency);
		cart.setTotalPrice(price);
		cart.setPaymentInfo(checkoutComAchPaymentInfoModel);
		cart.setPaymentAddress(billingAddress);

		final Phone checkoutPhone = new Phone();
		checkoutPhone.setCountryCode(countryIsocode);
		checkoutPhone.setNumber(phone);

		when(checkoutComPhoneNumberStrategyMock.createPhone(billingAddress)).thenReturn(Optional.of(checkoutPhone));
		when(checkoutComCurrencyServiceMock.removeDecimalsFromCurrencyAmount("USD", 100D)).thenReturn(100000L);

		return cart;
	}
}
