/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, Input } from '@angular/core';
import { OrderSummaryComponent } from '@spartacus/cart/base/components';

@Component({
  selector: 'lib-checkout-com-order-summary',
  templateUrl: './checkout-com-order-summary.component.html',
})
export class CheckoutComOrderSummaryComponent extends OrderSummaryComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() override cart: any;
}
