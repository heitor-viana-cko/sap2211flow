import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CheckoutComTooltipContainerModule } from '@checkout-components/checkout-com-tooltip-container/checkout-com-tooltip-container.module';
import { CheckoutComTooltipDirectiveModule } from '@checkout-core/directives/checkout-com-tooltip-directive.module';
import { CheckoutComTooltipDirective } from '@checkout-core/directives/checkout-com-tooltip.directive';
import { MockCxIconComponent } from '@checkout-tests/components';
import { StoreModule } from '@ngrx/store';
import { I18nTestingModule } from '@spartacus/core';
import { FrameElementIdentifier } from '../checkout-com-frames-form/interfaces';

import { CheckoutComFramesInputComponent } from './checkout-com-frames-input.component';
import { CSS_CLASS_CARD_NUMBER, CSS_CLASS_CVV, CSS_CLASS_EXPIRY_DATE } from './interfaces';

describe('CheckoutComFramesInputComponent', () => {
  let component: CheckoutComFramesInputComponent;
  let fixture: ComponentFixture<CheckoutComFramesInputComponent>;
  let onMouseEnterSpy: jasmine.Spy;
  let onMouseLeaveSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CheckoutComFramesInputComponent,
        MockCxIconComponent,
      ],
      imports: [
        StoreModule.forRoot({}),
        ReactiveFormsModule,
        I18nTestingModule,
        CheckoutComTooltipDirectiveModule,
        CheckoutComTooltipContainerModule
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComFramesInputComponent);
    component = fixture.componentInstance;
    component.fieldName = 'inputName';
    component.fieldType = FrameElementIdentifier.CardNumber;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add ctrl to the existing form', () => {
    component.form = new UntypedFormGroup({});
    fixture.detectChanges();
    expect(component.form.controls[component.fieldName]).toBeTruthy();
  });

  it('should add ctrl to the own form', () => {
    fixture.detectChanges();
    expect(component.form).toBeTruthy();
    expect(component.form.controls[component.fieldName]).toBeTruthy();
  });

  it('should set css class by fieldType', () => {
    fixture.detectChanges();
    const cssClass = component.cssClassByFieldType;
    expect(fixture.nativeElement.getElementsByClassName(cssClass).length).toBeGreaterThanOrEqual(1);
  });

  [
    {
      cssClass: CSS_CLASS_CARD_NUMBER,
      fieldType: FrameElementIdentifier.CardNumber
    },
    {
      cssClass: CSS_CLASS_CVV,
      fieldType: FrameElementIdentifier.Cvv
    },
    {
      cssClass: CSS_CLASS_EXPIRY_DATE,
      fieldType: FrameElementIdentifier.ExpiryDate
    },
    {
      cssClass: null,
      fieldType: null
    },
  ].forEach((parameters) => {
    it(`should map field type ${parameters.fieldType} to css class ${parameters.cssClass}`, () => {
      component.fieldType = parameters.fieldType;
      expect(component.cssClassByFieldType).toEqual(parameters.cssClass);
    });
  });

  it('should show multiple brands tooltip', () => {
    component.showTooltip = true;
    component.tooltipLabel = 'tooltipLabel';
    component.tooltipText = 'tooltipTex';
    fixture.detectChanges();
    const tooltipWrapper = fixture.nativeElement.querySelector('.cobadgedTooltip');
    expect(tooltipWrapper).toBeTruthy();
    expect(tooltipWrapper.innerText.includes('tooltipLabel')).toBeTrue();
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      component.showTooltip = true;
      component.tooltipLabel = 'tooltipLabel';
      component.tooltipText = 'tooltipTex';
      fixture.detectChanges();
      const directive = fixture.debugElement.query(By.directive(CheckoutComTooltipDirective)).injector.get(CheckoutComTooltipDirective);
      onMouseEnterSpy = spyOn(directive, 'onMouseEnter');
      onMouseLeaveSpy = spyOn(directive, 'onMouseLeave');
    });
    it('should trigger mouse enter event for tooltip directive', () => {
      const tooltipWrapper = fixture.nativeElement.querySelector('.cobadgedTooltip');
      expect(tooltipWrapper).toBeTruthy();
      expect(tooltipWrapper.innerText.includes('tooltipLabel')).toBeTrue();

      const event = new Event('mouseenter');
      tooltipWrapper.querySelector('cx-icon').dispatchEvent(event);
      fixture.detectChanges();

      expect(onMouseEnterSpy).toHaveBeenCalled();
    });

    it('should trigger mouse leave event for tooltip directive', () => {
      component.showTooltip = true;
      component.tooltipLabel = 'tooltipLabel';
      component.tooltipText = 'tooltipTex';
      fixture.detectChanges();
      const directive = fixture.debugElement.query(By.directive(CheckoutComTooltipDirective)).injector.get(CheckoutComTooltipDirective);

      const tooltipWrapper = fixture.nativeElement.querySelector('.cobadgedTooltip');
      expect(tooltipWrapper).toBeTruthy();
      expect(tooltipWrapper.innerText.includes('tooltipLabel')).toBeTrue();

      const mouseEnterEvent = new Event('mouseenter');
      tooltipWrapper.querySelector('cx-icon').dispatchEvent(mouseEnterEvent);
      fixture.detectChanges();

      const mouseLeaveEvent = new Event('mouseleave');
      tooltipWrapper.querySelector('cx-icon').dispatchEvent(mouseLeaveEvent);
      fixture.detectChanges();

      expect(onMouseLeaveSpy).toHaveBeenCalled();
    });
  });
});
