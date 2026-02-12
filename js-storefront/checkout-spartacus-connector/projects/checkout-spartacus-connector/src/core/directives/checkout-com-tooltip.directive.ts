import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { CheckoutComTooltipContainerComponent } from '@checkout-components/checkout-com-tooltip-container/checkout-com-tooltip-container.component';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[libCheckoutComTooltip]',
})
export class CheckoutComTooltipDirective implements OnDestroy {
  @Input() tooltipText: string = '';
  private overlayRef!: OverlayRef;
  private tooltipComponentRef!: ComponentRef<CheckoutComTooltipContainerComponent>;

  /**
   * Constructor for CheckoutComTooltipDirective.
   *
   * @param {Overlay} overlay - The overlay service for creating and managing overlays.
   * @param {ElementRef} elementRef - A reference to the element that the directive is attached to.
   */
  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
  ) {
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  /**
   * HostListener for mouseenter event. Shows the tooltip when the mouse enters the element.
   */
  @HostListener('mouseenter') onMouseEnter(): void {
    if (!this.tooltipText) return;
    this.showTooltip();
  }

  /**
   * HostListener for mouseleave event. Destroys the tooltip when the mouse leaves the element.
   */
  @HostListener('mouseleave') onMouseLeave(): void {
    this.destroyTooltip();
  }

  /**
   * HostListener for window resize event. Repositions the tooltip when the window is resized.
   */
  @HostListener('window:resize') onWindowResize(): void {
    this.repositionTooltip();
  }

  /**
   * Shows the tooltip by creating and attaching the tooltip component to the overlay.
   * If the overlay reference does not exist, it creates a new one with the appropriate position strategy.
   */
  private showTooltip(): void {
    if (!this.overlayRef) {
      const positionStrategy: PositionStrategy = this.getPositionStrategy();
      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
    }
    // eslint-disable-next-line @typescript-eslint/typedef
    const tooltipPortal = new ComponentPortal(CheckoutComTooltipContainerComponent);
    this.tooltipComponentRef = this.overlayRef.attach(tooltipPortal);
    this.tooltipComponentRef.instance.tooltipText = this.tooltipText;
  }

  /**
   * Repositions the tooltip if it is currently attached to the overlay.
   */
  private repositionTooltip(): void {
    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.updatePosition();
    }
  }

  /**
   * Destroys the tooltip by disposing of the overlay reference.
   */
  private destroyTooltip(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null!;
    }
  }

  /**
   * Returns the position strategy for the tooltip overlay.
   * The strategy ensures the tooltip stays within the viewport and does not shrink to fit.
   *
   * @returns {PositionStrategy} The position strategy for the tooltip overlay.
   */
  private getPositionStrategy(): PositionStrategy {
    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef.nativeElement)
      .withFlexibleDimensions(false) // Ensures tooltip won't shrink to fit
      .withPush(true) // Ensures tooltip stays within the viewport
      .withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: 8,
        },
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -8,
        },
      ]);
  }
}
