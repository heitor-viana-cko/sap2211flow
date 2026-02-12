import { AbstractControl, UntypedFormGroup } from '@angular/forms';

export function makeFormErrorsVisible(form: UntypedFormGroup): void {
  try {
    if (!form || !form.controls) {
      return;
    }
    for (const ctrlName in form.controls) {
      // eslint-disable-next-line no-prototype-builtins
      if (form.controls.hasOwnProperty(ctrlName)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctrl: AbstractControl<any, any> = form.controls[ctrlName];
        if (ctrl instanceof UntypedFormGroup) {
          makeFormErrorsVisible(ctrl);
        } else {
          ctrl.markAsTouched();
          ctrl.markAsDirty();
          ctrl.updateValueAndValidity();
        }
      }
    }
  } catch (e) {
    console.error('Error in makeFormErrorsVisible', e);
  }
}
