import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { ApmData } from '@checkout-model/ApmData';
import { CheckoutComApmService } from '@checkout-services/apm/checkout-com-apm.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-checkout-com-apm-tile',
  templateUrl: './checkout-com-apm-tile.component.html',
  styleUrls: ['./checkout-com-apm-tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmTileComponent {
  @Input() apm: ApmData;
  selectedApm$: Observable<ApmData> = this.checkoutComApmService.getSelectedApmFromState();

  constructor(protected checkoutComApmService: CheckoutComApmService) {
  }

  @HostListener('click')
  select(): void {
    this.checkoutComApmService.selectApm(this.apm);
  }
}
