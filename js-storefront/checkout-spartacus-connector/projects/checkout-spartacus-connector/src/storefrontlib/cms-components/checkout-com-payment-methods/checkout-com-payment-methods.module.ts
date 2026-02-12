import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, CmsConfig, I18nModule, provideConfig } from '@spartacus/core';
import { CardModule, SpinnerModule } from '@spartacus/storefront';
import { CheckoutPaymentFormModule } from '@spartacus/checkout/base/components';
import { CheckoutComPaymentMethodsFormModule } from '@checkout-components/checkout-com-payment-methods/checkout-com-payment-methods-form/checkout-com-payment-methods-form.module';
import { CheckoutComPaymentMethodsComponent } from './checkout-com-payment-methods.component';

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    SpinnerModule,
    I18nModule,
    CheckoutPaymentFormModule,
    CheckoutComPaymentMethodsFormModule
  ],
  providers: [
    provideConfig({
      cmsComponents: {
        AccountPaymentDetailsComponent: {
          component: CheckoutComPaymentMethodsComponent,
          guards: [AuthGuard],
        },
      },
    } as CmsConfig),
  ],
  declarations: [CheckoutComPaymentMethodsComponent],
  exports: [CheckoutComPaymentMethodsComponent]
})
export class CheckoutComPaymentMethodsModule { }
