# CheckoutSpartacusTranslations
Checkout.com provides an end-to-end platform that helps you move faster, instead of holding you back. With flexible tools, granular data and deep insights, it’s the payments tech that unleashes your potential. So you can innovate, adapt to your markets, create outstanding customer experiences, and make smart decisions faster. The Connector for SAP Commerce Cloud (formerly Hybris) enables customers to implement a global payment strategy through a single integration in a secure, compliant and unified approach.

This [Checkout.com](https://www.checkout.com/) library adds necessary translations to the Spartacus Storefront for SAP Commerce Cloud. 

## Release Compatibility
This library is tailored to the [Spartacus](https://sap.github.io/spartacus-docs/) Storefront:

This release is compatible with:
* Spartacus: version 2211.32.1-flow
* Node module `@checkout.com/checkout-spartacus-connector` v2211.32.1
* SAP Commerce Cloud: version 2211
* [Angular CLI](https://angular.dev/): Version 17.0.0 is the minimum required. The most recent 17.x version is strongly recommended.
* [Node.js](https://nodejs.org/en): Version 20.9.0 is the minimum required. The most recent 20.x version is strongly recommended.
* [yarn](https://yarnpkg.com/): Version 1.15 or later. or [npm](https://www.npmjs.com/): Version 10.2.4 or newer.

### Release 2211.32.1-flow
* Updated readme file dependencies to be compatible with Spartacus 2211.32.1

### Release 2211.32.1
* Updated readme file dependencies to be compatible with Spartacus 2211.32.1

## Release notes
### Release 4.2.8
* Updated readme file dependencies to be compatible with Spartacus 4.2.8

### Release 4.2.7
* Removed translations for iDeal APM form

### Release 4.2.6
* Included support for SAP CX 2211
* Fixed dependencies issues.

### Release 4.2.4
* Included support for SAP CX 2205
* Included the following components in the list of components to be imported in the Spartacus configuration module:
  * GuestRegisterFormComponent.
  * AccountPaymentDetailsComponent.
* Included support for the following APMs:
  * Cartes Bancaires
  * Multiple Card Brands

### Release 4.2.3
Include binaries. Previous 4.2.x releases are missing binaries.

### Release 4.2.2
Update readme

### Release 4.2.0
Use this release if you are using Spartacus 4.2.x
* Upgrade to Spartacus 4.2
* Show first name + last name as the card account holder
* Fix for ApplePay transaction status

### Release 1.0.2
* Source code now publicly available

### Release 1.0.0
* Added support for SSR

### Release 0.0.0
* Lazy loaded feature module
* Translations moved to separate node module
* APM’s
  * AliPay
  * ApplePay
  * Bancontact
  * Benefit Pay
  * EPS
  * Fawry
  * GooglePay
  * iDeal
  * Klarna
  * KNet
  * Mada
  * Multibanco
  * Oxxo
  * PayPal
  * Poli
  * Przelewy24
  * QPay
  * Sepa
* Credit card form placeholder localisation
* Display card payment icon
* Made OCC endpoints configurable
* Added support for 3DS2
