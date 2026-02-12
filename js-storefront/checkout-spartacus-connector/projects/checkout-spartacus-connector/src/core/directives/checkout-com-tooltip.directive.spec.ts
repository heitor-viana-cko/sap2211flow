import { Overlay } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CheckoutComTooltipDirective } from './checkout-com-tooltip.directive';

describe('TooltipDirective', () => {
  let directive: CheckoutComTooltipDirective;
  let overlay: Overlay;
  let elementRef: ElementRef;

  beforeEach(() => {
    overlay = TestBed.inject(Overlay);
    elementRef = jasmine.createSpyObj('ElementRef', ['nativeElement']);
    directive = new CheckoutComTooltipDirective(overlay, elementRef);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should show tooltip on mouse enter when tooltipText is provided', () => {
    directive.tooltipText = 'Test Tooltip';
    // @ts-ignore
    spyOn(directive, 'showTooltip');
    directive.onMouseEnter();
    // @ts-ignore
    expect(directive.showTooltip).toHaveBeenCalled();
  });

  it('should not show tooltip on mouse enter when tooltipText is not provided', () => {
    directive.tooltipText = '';
    // @ts-ignore
    spyOn(directive, 'showTooltip');
    directive.onMouseEnter();
    // @ts-ignore
    expect(directive.showTooltip).not.toHaveBeenCalled();
  });

  it('should destroy tooltip on mouse leave', () => {
    // @ts-ignore
    spyOn(directive, 'destroyTooltip');
    directive.onMouseLeave();
    // @ts-ignore
    expect(directive.destroyTooltip).toHaveBeenCalled();
  });

  it('should reposition tooltip on window resize', () => {
    // @ts-ignore
    spyOn(directive, 'repositionTooltip');
    directive.onWindowResize();
    // @ts-ignore
    expect(directive.repositionTooltip).toHaveBeenCalled();
  });

  it('should create overlay and attach tooltip component when showing tooltip', () => {
    spyOn(overlay, 'create').and.callThrough();
    directive.tooltipText = 'Test Tooltip';
    // @ts-ignore
    directive.showTooltip();
    // @ts-ignore
    expect(overlay.create).toHaveBeenCalled();
    // @ts-ignore
    expect(directive.tooltipComponentRef.instance.tooltipText).toBe('Test Tooltip');
  });

  it('should dispose overlay when destroying tooltip', () => {
    const overlayRef = jasmine.createSpyObj('OverlayRef', ['dispose']);
    directive['overlayRef'] = overlayRef;
    // @ts-ignore
    directive.destroyTooltip();
    expect(overlayRef.dispose).toHaveBeenCalled();
  });

  it('should update overlay position when repositioning tooltip', () => {
    const overlayRef = jasmine.createSpyObj('OverlayRef', ['updatePosition', 'hasAttached']);
    overlayRef.hasAttached.and.returnValue(true);
    directive['overlayRef'] = overlayRef;
    // @ts-ignore
    directive.repositionTooltip();
    expect(overlayRef.updatePosition).toHaveBeenCalled();
  });

  it('should not update overlay position when overlay is not attached', () => {
    const overlayRef = jasmine.createSpyObj('OverlayRef', ['updatePosition', 'hasAttached']);
    overlayRef.hasAttached.and.returnValue(false);
    directive['overlayRef'] = overlayRef;
    // @ts-ignore
    directive.repositionTooltip();
    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should destroy tooltip on component destroy', () => {
    // @ts-ignore
    spyOn(directive, 'destroyTooltip');
    // @ts-ignore
    directive.ngOnDestroy();
    // @ts-ignore
    expect(directive.destroyTooltip).toHaveBeenCalled();
  });

  it('should not throw error if destroyTooltip is called when overlayRef is null', () => {
    directive['overlayRef'] = null!;
    // @ts-ignore
    expect(() => directive.destroyTooltip()).not.toThrow();
  });
});
