# Checkout.com Spartacus Connector for SAP Commerce Cloud
Checkout.com provides an end-to-end platform that helps you move faster, instead of holding you back. With flexible tools, granular data and deep insights, it’s the payments tech that unleashes your potential. So you can innovate, adapt to your markets, create outstanding customer experiences, and make smart decisions faster. The Connector for SAP Commerce Cloud (formerly Hybris) enables customers to implement a global payment strategy through a single integration in a secure, compliant and unified approach.

This [Checkout.com](https://www.checkout.com/) library adds payments capabilities to the Spartacus Storefront for SAP Commerce Cloud.

## Release Compatibility
This library is tailored to the [Spartacus](https://sap.github.io/spartacus-docs/) Storefront:

This release is compatible with:
* Spartacus: version 2211.32.1
* Node module `checkout-spartacus-translations` v2211.32.1
* SAP Commerce Cloud: version 2211
* [Angular CLI](https://angular.dev/): Version 17.0.0 is the minimum required. The most recent 17.x version is strongly recommended.
* [Node.js](https://nodejs.org/en): Version 20.9.0 is the minimum required. The most recent 20.x version is strongly recommended.
* [yarn](https://yarnpkg.com/): Version 1.15 or later. or [npm](https://www.npmjs.com/): Version 10.2.4 or newer.
* Requires Spartacus Feature Modules: `checkout` and `order`

## Development
Install the [Checkout.com SAP Commerce Cloud Connector](https://github.com/checkout/SAP-Cloud-Commerce-2105).
Run `yarn` and then `yarn run start:localtest` and the server will start on [https://localtest.me:4200](https://localtest.me:4200).   
When you make some changes in the code of library, you need to rebuild it (but rebuilding of the "example-storefront" is not required) - `yarn run start` is a shortcut for this.

## Testing
Run `ng test --watch` during development to automatically run the Angular test suite when you change a file

## Publish to NPM
Increase the version number in `package.json`

Make sure you are logged in and your account has access to the Checkout.com organisation

* Remove all files from the node_modules/ and dist/ folders
* Run `yarn install` to install all required dependencies
* Run `yarn run test` to validate that there are no existing blocking errors in the code
* Run `yarn run build-prod` to build the library

If you are satisfied with the results from the tests and the library is built without problems you can publish the package.
* Run `npm publish --access public` in both `dist/checkout-spartacus-connector` and `dist/checkout-spartacus-translations`.

## Extending components
The source code of the connector can be found on
* [GitHub SAP CX 2011](https://github.com/checkout/Checkout-SAP-Cloud-Commerce-2011)
* [GitHub SAP CX 2015](https://github.com/checkout/Checkout-SAP-Cloud-Commerce-2105)
* [GitHub SAP CX 2205](https://github.com/checkout/Checkout-SAP-Cloud-Commerce-2205)
* [GitHub SAP CX 2211](https://github.com/checkout/Checkout-SAP-Cloud-Commerce-2211)

If you need to extend components, you can fork the repository so you are able to upgrade to future releases. In this fork, you can make your changes and import the library in your storefront.

If you don't want to fork, you can `extend` components, copy the template and the Angular Component into your project. This will mean that you have to be vigilant when a new release of the library is integrated.
## Release notes
### Release 2211.32.1-flow
* Update Dependencies:
  * [CheckoutSpartacusTranslations](https://www.npmjs.com/package/@checkout.com/checkout-spartacus-translations) to version 2211.32.1-flow
  *  Included support for Checkout Flow component

### Release 2211.32.1
* Update Dependencies:
  * [CheckoutSpartacusTranslations](https://www.npmjs.com/package/@checkout.com/checkout-spartacus-translations) to version 2211.32.1
  *  "ngx-plaid-link": "^14.0.0",
  
* Removed Dependencies:
  * "ng2-tooltip-directive": "^2.10.3"

| Supported APM’s: | 
|------------------|
| ACH Direct Debit |
| ApplePay         |
| Bancontact       |
| Credit Card      |
| Eps              |
| GooglePay        |
| iDeal            |
| Klarna           |
| Multibanco       |
| Przelewy24       |
| Fawry            |

## Release notes
### Release 4.2.7
* Removed BIC from iDeal APM form

### Release 4.2.6
* Included support for SAP CX 2211
* Fixed dependencies issues.
  *  "ng2-tooltip-directive": "^2.10.3",
  *  "ngx-plaid-link": "1.0.3",
  *  "@techiediaries/ngx-qrcode": "^9.1.0"

### Release 4.2.5
* Included support for SAP CX 2211
* Fixed dependencies issues.
  *  "ng2-tooltip-directive": "^2.10.3",
  *  "ngx-plaid-link": "1.0.3",
  *  "@techiediaries/ngx-qrcode": "^9.1.0"

### Release 4.2.4
* Included support for SAP CX 2205
* Included the following components in the list of components to be imported in the Spartacus configuration module:
  * GuestRegisterFormComponent.
  * AccountPaymentDetailsComponent.
* Included support for the following APMs:
  * Cartes Bancaires
  * Multiple Card Brands
* Update Dependencies:
  * [CheckoutSpartacusTranslations](https://www.npmjs.com/package/@checkout.com/checkout-spartacus-translations) to version 4.2.4

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
