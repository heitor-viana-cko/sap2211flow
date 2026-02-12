/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, } from '@angular/core';
import { CartItemListComponent } from '@spartacus/cart/base/components';

@Component({
  selector: 'cx-cart-item-list',
  templateUrl: './checkout-com-cart-item-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComCartItemListComponent extends CartItemListComponent {

}
