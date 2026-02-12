import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FrameElementIdentifier } from '@checkout-components/checkout-com-frames-form/interfaces';

@Component({
  selector: 'lib-checkout-com-frames-input',
  template: ''
})
export class MockLibCheckoutComFramesInputComponent {
  @Input() fieldType: FrameElementIdentifier;
  @Input() form: UntypedFormGroup;
  @Input() fieldName: string;
  @Input() icon: string;
  @Input() showTooltip: boolean;
  @Input() tooltipLabel: string;
  @Input() tooltipText: string;
}