/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, } from '@angular/core';
import { OrderConfirmationShippingComponent } from '@spartacus/order/components';

@Component({
  selector: 'cx-order-confirmation-shipping',
  templateUrl: './checkout-com-order-confirmation-shipping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComOrderConfirmationShippingComponent extends OrderConfirmationShippingComponent {

}
