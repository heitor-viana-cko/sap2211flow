/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from '@angular/core';
import { CartItemContextSource } from '@checkout-components/checkout-com-cart-shared/checkout-com-cart-item/model/cart-item-context-source.model';
import { CartItemListRowComponent } from '@spartacus/cart/base/components';
import { CartItemContext } from '@spartacus/cart/base/root';

@Component({
  selector: '[cx-cart-item-list-row], cx-cart-item-list-row',
  templateUrl: './checkout-com-cart-item-list-row.component.html',
  providers: [
    CartItemContextSource,
    {
      provide: CartItemContext,
      useExisting: CartItemContextSource
    },
  ],
})
export class CheckoutComCartItemListRowComponent extends CartItemListRowComponent {
  constructor(
    protected override cartItemContextSource: CartItemContextSource
  ) {
    super(cartItemContextSource);
  }
}
