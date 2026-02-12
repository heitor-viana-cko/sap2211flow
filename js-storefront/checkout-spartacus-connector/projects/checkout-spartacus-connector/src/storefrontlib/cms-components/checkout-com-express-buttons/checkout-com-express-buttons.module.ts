import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckoutComOccModule } from '@checkout-core/occ/checkout-com-occ.module';
import { CheckoutComApmModule } from '../checkout-com-apm-component/checkout-com-apm.module';
import { CheckoutComExpressApplepayComponent } from './checkout-com-express-applepay/checkout-com-express-applepay.component';
import { CheckoutComExpressGooglepayComponent } from './checkout-com-express-googlepay/checkout-com-express-googlepay.component';

@NgModule({
  declarations: [
    CheckoutComExpressApplepayComponent,
    CheckoutComExpressGooglepayComponent,
  ],
  imports: [
    CommonModule,
    CheckoutComOccModule,
    CheckoutComApmModule
  ],
  exports: [
    CheckoutComExpressApplepayComponent,
    CheckoutComExpressGooglepayComponent,
  ],
})
export class CheckoutComExpressButtonsModule {
}
