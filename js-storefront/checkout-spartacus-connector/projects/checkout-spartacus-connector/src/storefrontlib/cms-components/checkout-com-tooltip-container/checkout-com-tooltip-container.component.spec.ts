import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CheckoutComTooltipContainerComponent } from './checkout-com-tooltip-container.component';

describe('TooltipContainerComponent', () => {
  let component: CheckoutComTooltipContainerComponent;
  let fixture: ComponentFixture<CheckoutComTooltipContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [CheckoutComTooltipContainerComponent],
        imports: [BrowserAnimationsModule]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CheckoutComTooltipContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tooltip text when provided', () => {
    component.tooltipText = 'Test Tooltip';
    fixture.detectChanges();
    const tooltipElement: HTMLElement = fixture.nativeElement.querySelector('.tooltip-inner');
    expect(tooltipElement.textContent).toBe('Test Tooltip');
  });

  it('should not display tooltip text when not provided', () => {
    component.tooltipText = '';
    fixture.detectChanges();
    const tooltipElement: HTMLElement = fixture.nativeElement.querySelector('.tooltip-inner');
    expect(tooltipElement).toBeNull();
  });


});
