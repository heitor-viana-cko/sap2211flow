/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderConfirmationTotalsComponent } from '@spartacus/order/components';

@Component({
  selector: 'cx-order-confirmation-totals',
  templateUrl: './checkout-com-order-confirmation-totals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComOrderConfirmationTotalsComponent extends OrderConfirmationTotalsComponent {

}