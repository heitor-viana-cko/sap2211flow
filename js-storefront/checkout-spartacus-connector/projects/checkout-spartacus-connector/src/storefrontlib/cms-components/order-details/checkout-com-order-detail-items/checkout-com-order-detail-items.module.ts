import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComOrderDetailItemsComponent } from '@checkout-components/order-details/checkout-com-order-detail-items/checkout-com-order-detail-items.component';
import { AbstractOrderContextModule, CartSharedModule } from '@spartacus/cart/base/components';
import { AddToCartModule } from '@spartacus/cart/base/components/add-to-cart';
import { CheckoutModule } from '@spartacus/checkout/base';
import { FeaturesConfigModule, I18nModule, provideConfig, UrlModule } from '@spartacus/core';
import { OrderDetailsModule } from '@spartacus/order/components';
import { CardModule, OutletModule, PromotionsModule, SpinnerModule, } from '@spartacus/storefront';

//import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  declarations: [
  ],
  imports: [
    CartSharedModule,
    CardModule,
    CommonModule,
    I18nModule,
    FeaturesConfigModule,
    PromotionsModule,
    UrlModule,
    SpinnerModule,
    AbstractOrderContextModule,
    OutletModule,
    AddToCartModule,
    OrderDetailsModule,
    //TODO: update library NgxQRCodeModule,
    CheckoutModule,
  ],
  providers: [
    provideConfig({
      cmsComponents: {
        OrderDetailItemsComponent: {
          component: CheckoutComOrderDetailItemsComponent,
        },
      }
    })
  ]
})
export class CheckoutComOrderDetailItemsModule {
}
