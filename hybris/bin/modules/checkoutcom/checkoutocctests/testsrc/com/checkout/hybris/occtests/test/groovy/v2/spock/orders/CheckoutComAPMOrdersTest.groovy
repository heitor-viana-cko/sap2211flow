package com.checkout.hybris.occtests.test.groovy.v2.spock.orders

import com.checkout.hybris.occtests.test.groovy.v2.spock.paymentdetails.AbstractCheckoutComPaymentsTest
import de.hybris.bootstrap.annotations.ManualTest
import org.apache.commons.lang.StringUtils
import spock.lang.Unroll

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.*
import static de.hybris.platform.commercewebservicestests.test.groovy.webservicetests.http.ContentType.JSON
import static de.hybris.platform.commercewebservicestests.test.groovy.webservicetests.http.ContentType.XML
import static org.apache.http.HttpStatus.SC_CREATED

@ManualTest
@Unroll
class CheckoutComAPMOrdersTest extends AbstractCheckoutComPaymentsTest {

    def "Authorized customer gets redirect url when places an order in NAS Site with #currency currency with a billing address from #billingCountry with #APM: #format"() {
        given: "authorized customer"
        def customerWithCart = createAndAuthorizeCustomerWithCart(restClient, format)
        def customer = customerWithCart[0]
        def cart = customerWithCart[1]
        def address = createAddressWithOptions(restClient, customer)
        setDeliveryAddressForCart(restClient, customer, cart.code, address.id, format)
        addProductToCartOnline(restClient, customer, cart.code, PRODUCT_POWER_SHOT_A480)
        setDeliveryModeForCart(restClient, customer, cart.code, DELIVERY_STANDARD, format)
        createBillingAddress(customer.id, cart.code, billingAddressPostBody)
        createAPMPaymentInfo(restClient, customer, cart.code, paymentInfoPostBody)

        when: "authorized customer places order"
        def response = placeCheckoutComOrder(customer, cart.code, currency, format)

        then: "customer is redirected to #APM"
        with(response) {
            if (isNotEmpty(data) && isNotEmpty(data.errors)) println(data)
            status == SC_CREATED
            isNotEmpty(data.redirectUrl)
            StringUtils.contains((String) data.redirectUrl, getConfigurationProperty(redirectKey))
        }

        where:
        format | APM        | currency          | billingCountry | paymentInfoPostBody                      | billingAddressPostBody       | redirectKey
        JSON   | P24        | EUR_CURRENCY_CODE | 'Poland'       | DEFAULT_CHECKOUT_P24_PAYMENT_JSON        | POLAND_BILLING_ADDRESS_JSON  | 'checkoutocctests.checkout.p24.sandbox'
        XML    | P24        | EUR_CURRENCY_CODE | 'Poland'       | DEFAULT_CHECKOUT_P24_PAYMENT_JSON        | POLAND_BILLING_ADDRESS_JSON  | 'checkoutocctests.checkout.p24.sandbox'
        JSON   | IDEAL      | EUR_CURRENCY_CODE | 'Netherlands'  | DEFAULT_CHECKOUT_IDEAL_PAYMENT_JSON      | NL_BILLING_ADDRESS_JSON      | 'checkoutocctests.checkout.ideal.sandbox'
        XML    | IDEAL      | EUR_CURRENCY_CODE | 'Netherlands'  | DEFAULT_CHECKOUT_IDEAL_PAYMENT_JSON      | NL_BILLING_ADDRESS_JSON      | 'checkoutocctests.checkout.ideal.sandbox '
        JSON   | BANCONTACT | EUR_CURRENCY_CODE | 'Belgium'      | DEFAULT_CHECKOUT_BANCONTACT_PAYMENT_JSON | BELGIUM_BILLING_ADDRESS_JSON | 'checkoutocctests.checkout.bancontact.sandbox'
        XML    | BANCONTACT | EUR_CURRENCY_CODE | 'Belgium'      | DEFAULT_CHECKOUT_BANCONTACT_PAYMENT_JSON | BELGIUM_BILLING_ADDRESS_JSON | 'checkoutocctests.checkout.bancontact.sandbox'
        JSON   | MULTIBANCO | EUR_CURRENCY_CODE | 'Portugal'     | DEFAULT_CHECKOUT_MULTIBANCO_PAYMENT_JSON | PORTUGAL_BILLING_ADDRESS_JSON | 'checkoutocctests.checkout.multibanco.sandbox'
        XML    | MULTIBANCO | EUR_CURRENCY_CODE | 'Portugal'     | DEFAULT_CHECKOUT_MULTIBANCO_PAYMENT_JSON | PORTUGAL_BILLING_ADDRESS_JSON | 'checkoutocctests.checkout.multibanco.sandbox'
    }

    def "Authorized customer places an order in NAS site with #currency currency with a billing address from #billingCountry with #APM: #format"() {
        given: "authorized customer"
        def customerWithCart = createAndAuthorizeCustomerWithCart(restClient, format)
        def customer = customerWithCart[0]
        def cart = customerWithCart[1]
        def address = createAddressWithOptions(restClient, customer)
        setDeliveryAddressForCart(restClient, customer, cart.code, address.id, format)
        addProductToCartOnline(restClient, customer, cart.code, PRODUCT_POWER_SHOT_A480)
        setDeliveryModeForCart(restClient, customer, cart.code, DELIVERY_STANDARD, format)
        createBillingAddress(customer.id, cart.code, billingAddressPostBody)
        createAPMPaymentInfo(restClient, customer, cart.code, paymentInfoPostBody)

        when: "authorized customer places order"
        def response = placeCheckoutComOrder(customer, cart.code, currency, format)

        then: "the order is placed"
        with(response) {
            if (isNotEmpty(data) && isNotEmpty(data.errors)) println(data)
            status == SC_CREATED
            isNotEmpty(data.code)
            data.checkoutComPaymentInfo.type == APM.name()
        }

        where:
        format | APM   | currency          | billingCountry | paymentInfoPostBody                 | billingAddressPostBody
        JSON   | FAWRY | EGP_CURRENCY_CODE | 'Egypt'      | DEFAULT_CHECKOUT_FAWRY_PAYMENT_JSON | DEFAULT_BILLING_ADDRESS_JSON
        XML    | FAWRY | EGP_CURRENCY_CODE | 'Egypt'      | DEFAULT_CHECKOUT_FAWRY_PAYMENT_JSON | DEFAULT_BILLING_ADDRESS_JSON
    }

}
