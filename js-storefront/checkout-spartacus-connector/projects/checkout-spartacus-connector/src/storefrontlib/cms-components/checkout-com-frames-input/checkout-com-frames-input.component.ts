import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CSS_CLASS_CARD_NUMBER, CSS_CLASS_EXPIRY_DATE, CSS_CLASS_CVV } from './interfaces';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { FrameElementIdentifier } from '../checkout-com-frames-form/interfaces';
import { ICON_TYPE } from '@spartacus/storefront';

@Component({
  selector: 'lib-checkout-com-frames-input',
  templateUrl: './checkout-com-frames-input.component.html',
  styleUrls: ['./checkout-com-frames-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComFramesInputComponent implements OnInit {
  @Input() fieldType: FrameElementIdentifier = null;
  @Input() form: UntypedFormGroup = null;
  @Input() fieldName: string = null;
  @Input() icon: string;
  @Input() showTooltip: boolean;
  @Input() tooltipLabel: string = '';
  @Input() tooltipText: string = '';

  iconTypes: typeof ICON_TYPE = ICON_TYPE;
  public fieldCtrl: UntypedFormControl = null;

  constructor() { }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Initializes the form control by setting it based on the field name.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.setCtrlByName(this.fieldName);
  }

  /**
   * Sets the form control by the given field name.
   * If the form does not exist, it creates a new form group with the control.
   * Otherwise, it sets the control in the existing form group.
   *
   * @param {string} name - The name of the form control to be set.
   * @private
   * @since 4.2.7
   */
  private setCtrlByName(name: string): void {
    if (name) {
      this.fieldCtrl = new UntypedFormControl();
      if (!this.form) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const controls: any = {};
        controls[name] = this.fieldCtrl;
        this.form = new UntypedFormGroup(controls);
      } else {
        this.form.setControl(name, this.fieldCtrl);
      }
    }
  }

  /**
   * Returns the CSS class based on the field type.
   *
   * @returns {string} - The CSS class corresponding to the field type.
   * @since 4.2.7
   */
  get cssClassByFieldType(): string {
    switch (this.fieldType) {
    case FrameElementIdentifier.CardNumber:
      return CSS_CLASS_CARD_NUMBER;
    case FrameElementIdentifier.ExpiryDate:
      return CSS_CLASS_EXPIRY_DATE;
    case FrameElementIdentifier.Cvv:
      return CSS_CLASS_CVV;
    default:
      return null;
    }
  }
}
