import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-qrcode',
  template: '',
})
export class MockNgxQrcodeComponent {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  @Input() elementType: any;
  @Input() errorCorrectionLevel: string;
  @Input() value: string;
}