/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CheckoutOrderSummaryComponent } from '@spartacus/checkout/base/components';

@Component({
  selector: 'cx-checkout-order-summary',
  templateUrl: './checkout-com-checkout-order-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComCheckoutOrderSummaryComponent extends CheckoutOrderSummaryComponent {

}
