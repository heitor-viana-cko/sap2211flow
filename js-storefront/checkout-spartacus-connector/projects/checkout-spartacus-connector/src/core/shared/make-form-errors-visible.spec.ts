import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { makeFormErrorsVisible } from '@checkout-shared/make-form-errors-visible';

describe('makeFormErrorsVisible', () => {
  let mockForm: UntypedFormGroup;

  beforeEach(() => {
    // Setup a mock form group for testing
    mockForm = new UntypedFormGroup({
      control1: new UntypedFormControl(''),
      control2: new UntypedFormControl(''),
      nestedGroup: new UntypedFormGroup({
        nestedControl1: new UntypedFormControl(''),
      }),
    });
  });

  it('should mark all controls as touched and dirty', () => {
    spyOn(mockForm.controls['control1'], 'markAsTouched').and.callThrough();
    spyOn(mockForm.controls['control1'], 'markAsDirty').and.callThrough();
    spyOn(mockForm.controls['control1'], 'updateValueAndValidity').and.callThrough();

    spyOn(mockForm.controls['control2'], 'markAsTouched').and.callThrough();
    spyOn(mockForm.controls['control2'], 'markAsDirty').and.callThrough();
    spyOn(mockForm.controls['control2'], 'updateValueAndValidity').and.callThrough();

    makeFormErrorsVisible(mockForm);

    expect(mockForm.controls['control1'].markAsTouched).toHaveBeenCalled();
    expect(mockForm.controls['control1'].markAsDirty).toHaveBeenCalled();
    expect(mockForm.controls['control1'].updateValueAndValidity).toHaveBeenCalled();

    expect(mockForm.controls['control2'].markAsTouched).toHaveBeenCalled();
    expect(mockForm.controls['control2'].markAsDirty).toHaveBeenCalled();
    expect(mockForm.controls['control2'].updateValueAndValidity).toHaveBeenCalled();
  });

  it('should recursively handle nested form groups', () => {
    const nestedControl = (mockForm.controls['nestedGroup'] as UntypedFormGroup).controls['nestedControl1'];
    spyOn(nestedControl, 'markAsTouched').and.callThrough();
    spyOn(nestedControl, 'markAsDirty').and.callThrough();
    spyOn(nestedControl, 'updateValueAndValidity').and.callThrough();

    makeFormErrorsVisible(mockForm);

    expect(nestedControl.markAsTouched).toHaveBeenCalled();
    expect(nestedControl.markAsDirty).toHaveBeenCalled();
    expect(nestedControl.updateValueAndValidity).toHaveBeenCalled();
  });


  it('should skip non-control properties in the form', () => {
    const invalidForm = new UntypedFormGroup({
      validControl: new UntypedFormControl(''),
    });

    // Add a non-control property to the form
    (invalidForm as any).nonControlProperty = 'not a control';

    spyOn(invalidForm.controls['validControl'], 'markAsTouched').and.callThrough();

    makeFormErrorsVisible(invalidForm);

    expect(invalidForm.controls['validControl'].markAsTouched).toHaveBeenCalled();
    // Ensure no error is thrown due to the non-control property
  });
});