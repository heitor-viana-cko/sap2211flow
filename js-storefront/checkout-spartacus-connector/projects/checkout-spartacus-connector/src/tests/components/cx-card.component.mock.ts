import { Component, Input } from '@angular/core';

@Component({
  selector: 'cx-card',
  template: '{{content | json}}',
})
export class MockCardComponent {
  @Input() content: any;
  @Input() border: boolean;
  @Input() fitToContainer: boolean;
}
