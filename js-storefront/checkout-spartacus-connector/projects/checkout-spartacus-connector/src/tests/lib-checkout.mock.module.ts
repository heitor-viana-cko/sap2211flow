import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  MockCardComponent,
  MockCxAddToHomeScreenBannerComponent,
  MockCxBillingAddressFormComponent,
  MockCxConsignmentTrackingComponent,
  MockCxGuestRegisterFormComponent,
  MockCxIconComponent,
  MockCxMediaComponent,
  MockCxSpinnerComponent,
  MockLibCheckoutComApmComponent,
  MockLibCheckoutComApmTitle,
  MockLibCheckoutComBillingAddressFormComponent,
  MockLibCheckoutComFramesInputComponent,
  MockNgxQrcodeComponent
} from '@checkout-tests/components';
import { MockCheckoutComFlowComponent } from '@checkout-tests/components/checkout-com-flow.component.mock';
import { MockCheckoutComOrderSummaryComponent } from '@checkout-tests/components/lib-checkout-com-order-summary-component.mock';
import { MockCxOutletContextDirective, MockCxOutletDirective } from '@checkout-tests/directives';
import { MockCxFeatureLevelDirective } from '@checkout-tests/directives/cx-feature-level.directive.mock';
import { MockCxFeatureDirective } from '@checkout-tests/directives/cx-feature.directive.mock';
import { MockUrlPipe } from '@checkout-tests/pipes/cx-url.pipe.mock';
import { MockItemCounterComponent } from '@checkout-tests/services/item-counter';

@NgModule({
  declarations: [
    // Components
    MockCxAddToHomeScreenBannerComponent,
    MockCardComponent,
    MockCxConsignmentTrackingComponent,
    MockCxGuestRegisterFormComponent,
    MockCxIconComponent,
    MockCxMediaComponent,
    MockCxSpinnerComponent,
    MockLibCheckoutComApmComponent,
    MockLibCheckoutComApmTitle,
    MockLibCheckoutComBillingAddressFormComponent,
    MockLibCheckoutComFramesInputComponent,
    MockNgxQrcodeComponent,
    MockCxBillingAddressFormComponent,
    MockItemCounterComponent,
    MockCheckoutComOrderSummaryComponent,
    MockCheckoutComFlowComponent,
    // Directives
    MockCxOutletDirective,
    MockCxOutletContextDirective,
    MockCxFeatureLevelDirective,
    MockCxFeatureDirective,
    // Pipes
    MockUrlPipe
  ],
  imports: [
    CommonModule
  ]
})
export class LibCheckoutMockModule {
}
