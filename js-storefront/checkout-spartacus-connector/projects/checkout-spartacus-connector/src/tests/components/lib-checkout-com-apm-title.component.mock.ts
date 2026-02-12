import { Component, Input } from '@angular/core';
import { ApmData } from '@checkout-core/model/ApmData';

@Component({
  template: '',
  selector: 'lib-checkout-com-apm-tile',
})
export class MockLibCheckoutComApmTitle {
  @Input() apm: ApmData;
}
