package com.checkout.hybris.occtests.test.groovy.v2.spock

import com.checkout.hybris.occtests.setup.CheckoutTestSetupUtils
import com.checkout.hybris.occtests.test.groovy.v2.spock.apmConfiguration.CheckoutComApmConfigurationTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.apmConfiguration.CheckoutComApplePayTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.apmConfiguration.CheckoutComGooglePayTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.apmConfiguration.CheckoutComKlarnaTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.merchant.CheckoutComMerchantTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.orders.CheckoutComAPMOrdersTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.orders.CheckoutComCCOrdersTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.paymentdetails.CheckoutComAPMPaymentsTest
import com.checkout.hybris.occtests.test.groovy.v2.spock.paymentdetails.CheckoutComCCPaymentsTest
import de.hybris.bootstrap.annotations.IntegrationTest
import org.junit.AfterClass
import org.junit.BeforeClass
import org.junit.runner.RunWith
import org.junit.runners.Suite

@RunWith(Suite.class)
@Suite.SuiteClasses([CheckoutComMerchantTest, CheckoutComCCPaymentsTest, CheckoutComAPMPaymentsTest,
        CheckoutComApmConfigurationTest, CheckoutComCCOrdersTest, CheckoutComAPMOrdersTest, CheckoutComApplePayTest,
        CheckoutComGooglePayTest, CheckoutComKlarnaTest])
@IntegrationTest
class AllSpockTests {

    @BeforeClass
    static void setUpClass() {
        CheckoutTestSetupUtils.loadData();
        CheckoutTestSetupUtils.loadExtensionDataInJunit();
        CheckoutTestSetupUtils.startServer();
    }

    @AfterClass
    static void tearDown() {
        CheckoutTestSetupUtils.stopServer();
        CheckoutTestSetupUtils.cleanData();
    }
}
