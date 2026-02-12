import { Component } from '@angular/core';
import { CheckoutComFlowComponent } from '@checkout-components/checkout-com-flow/checkout-com-flow.component';

@Component({
  selector: 'lib-checkout-com-flow',
  template: '<div id="flow-container"></div>',
  standalone: false,
})
export class MockCheckoutComFlowComponent extends CheckoutComFlowComponent {
  override mountFlowComponent() {
    // no-op
  }

  override handleWebComponentsLoaded() {

  }
}