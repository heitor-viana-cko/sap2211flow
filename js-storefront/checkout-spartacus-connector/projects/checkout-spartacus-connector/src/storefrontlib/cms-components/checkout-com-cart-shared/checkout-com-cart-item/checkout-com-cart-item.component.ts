import { Component, OnChanges } from '@angular/core';
import { CartItemComponent } from '@spartacus/cart/base/components';
import { CartItemContext, } from '@spartacus/cart/base/root';
import { CartItemContextSource } from './model/cart-item-context-source.model';

@Component({
  selector: 'cx-cart-item',
  templateUrl: './checkout-com-cart-item.component.html',
  providers: [
    CartItemContextSource,
    {
      provide: CartItemContext,
      useExisting: CartItemContextSource
    },
  ],
})
export class CheckoutComCartItemComponent extends CartItemComponent implements OnChanges {

  constructor(
    protected override cartItemContextSource: CartItemContextSource
  ) {
    super(cartItemContextSource);
  }
}
