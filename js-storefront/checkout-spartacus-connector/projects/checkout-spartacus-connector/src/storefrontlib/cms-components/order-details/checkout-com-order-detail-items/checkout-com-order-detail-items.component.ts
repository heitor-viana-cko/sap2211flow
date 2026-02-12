import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderDetailItemsComponent } from '@spartacus/order/components';

/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

@Component({
  selector: 'cx-order-details-items',
  templateUrl: './checkout-com-order-detail-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComOrderDetailItemsComponent extends OrderDetailItemsComponent {

}
