/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderConfirmationItemsComponent } from '@spartacus/order/components';

@Component({
  selector: 'cx-order-confirmation-items',
  templateUrl: './checkout-com-order-confirmation-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComOrderConfirmationItemsComponent extends OrderConfirmationItemsComponent {

}
