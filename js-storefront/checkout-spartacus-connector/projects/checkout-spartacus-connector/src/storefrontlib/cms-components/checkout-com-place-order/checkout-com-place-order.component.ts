import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ComponentRef, DestroyRef, ElementRef, inject, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CHECKOUT_COM_LAUNCH_CALLER, CheckoutComOrderResult } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutComOrderFacade } from '@checkout-facades/checkout-com-order.facade';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutReplenishmentFormService, CheckoutScheduledReplenishmentPlaceOrderComponent } from '@spartacus/checkout/scheduled-replenishment/components';
import { GlobalMessageService, GlobalMessageType, HttpErrorModel, LoggerService, RoutingService, Translatable, WindowRef } from '@spartacus/core';
import { ORDER_TYPE, ScheduledReplenishmentOrderFacade } from '@spartacus/order/root';
import { LAUNCH_CALLER, LaunchDialogService } from '@spartacus/storefront';
import { merge } from 'rxjs';

@Component({
  selector: 'lib-checkout-com-place-order',
  templateUrl: './checkout-com-place-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComPlaceOrderComponent extends CheckoutScheduledReplenishmentPlaceOrderComponent implements OnDestroy {
  @ViewChild('element') element: ElementRef;
  protected logger: LoggerService = inject(LoggerService);
  protected checkoutComFlowFacade: CheckoutComFlowFacade = inject(CheckoutComFlowFacade);
  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Constructor for the CheckoutComPlaceOrderComponent.
   * Initializes the component with the provided services and clears any placed orders.
   *
   * @param {CheckoutComOrderFacade} orderFacade - The order facade service.
   * @param {RoutingService} routingService - The routing service.
   * @param {UntypedFormBuilder} fb - The form builder service.
   * @param {LaunchDialogService} launchDialogService - The launch dialog service.
   * @param {ViewContainerRef} vcr - The view container reference.
   * @param {CheckoutReplenishmentFormService} checkoutReplenishmentFormService - The checkout replenishment form service.
   * @param {ScheduledReplenishmentOrderFacade} scheduledReplenishmentOrderFacade - The scheduled replenishment order facade.
   * @param {GlobalMessageService} globalMessageService - The global message service.
   * @param {WindowRef} windowRef - The window reference.
   * @param {CheckoutStepService} stepService - The checkout step service.
   * @param {ActivatedRoute} activatedRoute - The activated route.
   * @since 2211.31.1
   */
  constructor(
    protected override orderFacade: CheckoutComOrderFacade,
    protected override routingService: RoutingService,
    protected override fb: UntypedFormBuilder,
    protected override launchDialogService: LaunchDialogService,
    protected override vcr: ViewContainerRef,
    protected override checkoutReplenishmentFormService: CheckoutReplenishmentFormService,
    protected override scheduledReplenishmentOrderFacade: ScheduledReplenishmentOrderFacade,
    protected globalMessageService: GlobalMessageService,
    protected windowRef: WindowRef,
    protected stepService: CheckoutStepService,
    protected activatedRoute: ActivatedRoute
  ) {
    super(
      orderFacade,
      routingService,
      fb,
      launchDialogService,
      vcr,
      checkoutReplenishmentFormService,
      scheduledReplenishmentOrderFacade
    );

    this.orderFacade.clearPlacedOrder();
  }

  /**
   * Submits the checkout form.
   * If the form is valid, launches a spinner dialog and places the order.
   * Handles the order result, including redirection and error handling.
   * If the form is invalid, marks all fields as touched.
   *
   * @override
   * @returns {void}
   * @since 2211.31.1
   */
  override submitForm(): void {
    this.checkoutComFlowFacade.getIsFlowEnabled().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (isFlowEnabled: boolean): void => {
        if (isFlowEnabled) {
          this.submitFlow();
        } else {
          this.submitNASForm();
        }
      },
      error: (error: unknown): void => {
        this.logger.error('Error checking if flow is enabled', { error });
        this.globalMessageService.add(error, GlobalMessageType.MSG_TYPE_ERROR);
      }
    });
  }

  submitFlow(): void {
    this.launchDialogService.openDialogAndSubscribe(
      CHECKOUT_COM_LAUNCH_CALLER.FLOW_POPUP,
      this.element,
      {}
    );
  }

  submitNASForm(): void {
    if (this.checkoutSubmitForm.valid && !!this.currentOrderType) {
      this.placedOrder = this.launchDialogService.launch(
        LAUNCH_CALLER.PLACE_ORDER_SPINNER,
        this.vcr
      );
      merge(
        this.currentOrderType === ORDER_TYPE.PLACE_ORDER
          ? this.orderFacade.placeOrder(this.checkoutSubmitForm.valid)
          : this.scheduledReplenishmentOrderFacade.scheduleReplenishmentOrder(
            this.scheduleReplenishmentFormData,
            this.checkoutSubmitForm.valid
          )
      ).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (response: unknown): void => {
          const httpErrorModel: HttpErrorModel = response as HttpErrorModel;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorModel: any = httpErrorModel?.details?.[0];
          const message: string = errorModel?.message;
          const type: string = errorModel?.type;
          let text: Translatable = {
            raw: `${message}: ${type}`
          };

          this.clearPlaceOrder();

          try {
            const httpErrorResponse: HttpErrorResponse = response as HttpErrorResponse;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errObj: any = httpErrorResponse?.error?.errors?.[0];
            if (errObj != null && typeof errObj === 'object') {
              text = {};
              if (errObj.type && typeof errObj.type === 'string') {
                // eslint-disable-next-line @typescript-eslint/typedef
                const symbols = errObj.type.split('');
                symbols[0] = symbols[0].toLowerCase();
                text.key = 'checkoutReview.' + symbols.join('');
              }
              if (!text.key) {
                if (errObj.message && typeof errObj.message === 'string') {
                  text.raw = errObj.message;
                }
              }
              if (text.key || text.raw) {
                this.globalMessageService.add(text, GlobalMessageType.MSG_TYPE_ERROR);
              }
            } else {
              this.globalMessageService.add(text, GlobalMessageType.MSG_TYPE_ERROR);
            }
          } catch (e) {
            this.logger.error(e);
            this.globalMessageService.add(text, GlobalMessageType.MSG_TYPE_ERROR);
          }
        },
        next: (): void => {
          this.orderResults();
        }
      });
    } else {
      this.checkoutSubmitForm.markAllAsTouched();
    }
  }

  /**
   * Retrieves the order result from the state and handles redirection or error scenarios.
   * If the order result contains a redirect URL, navigates to that URL.
   * If the order is not successful, navigates to the previous checkout step.
   * Otherwise, calls the onSuccess method.
   *
   * @returns {void}
   * @since 2211.31.1
   */
  orderResults(): void {
    this.orderFacade.getOrderResultFromState().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next:
        (result: CheckoutComOrderResult): void => {
          if (result.redirect?.redirectUrl) {
            this.windowRef.nativeWindow.location.href = result.redirect.redirectUrl;
            return;
          }
          if (result.successful === false) {
            this.routingService.go(this.stepService.getPreviousCheckoutStepUrl(this.activatedRoute));
            return;
          }
          this.onSuccess();
        },
      error: (err: unknown): void => this.logger.error('getOrderResultFromState with error', { err })
    });
  }

  /**
   * Clears the placed order if it exists.
   * Unsubscribes from the placed order observable and destroys the component if it exists.
   *
   * @returns {void}
   * @since 2211.31.1
   */
  clearPlaceOrder(): void {
    if (this.placedOrder) {
      this.placedOrder.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (component: ComponentRef<any>): void => {
          this.launchDialogService.clear(
            LAUNCH_CALLER.PLACE_ORDER_SPINNER
          );
          if (component) {
            component.destroy();
          }
        },
        error: (error: unknown): void => this.logger.error('placedOrder with errors', { error })
      }).unsubscribe();
    }
  }
}
