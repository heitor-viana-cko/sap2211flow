import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckoutComFlowComponentInterface } from '@checkout-core/interfaces';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { CheckoutWebComponents, Options } from '@checkout.com/checkout-web-components';
import { GlobalMessageService, GlobalMessageType, HttpErrorModel, LanguageService, LoggerService, WindowRef } from '@spartacus/core';
import { Observable,timer } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-flow',
  standalone: false,
  templateUrl: './checkout-com-flow.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComFlowComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading$: Observable<boolean>;
  isEnabled$: Observable<boolean>;
  webComponentsError: string;
  params: Partial<Options> = {};
  protected checkoutInstance: CheckoutWebComponents | null = null;
  protected checkoutComFlowFacade: CheckoutComFlowFacade = inject(CheckoutComFlowFacade);
  protected loggerService: LoggerService = inject(LoggerService);
  protected globalMessageService: GlobalMessageService = inject(GlobalMessageService);
  protected windowRef: WindowRef = inject(WindowRef);
  protected cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected languageService: LanguageService = inject(LanguageService);
  private flowComponent: CheckoutComFlowComponentInterface;
  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Lifecycle hook that is called after the component is initialized.
   * This method initializes the necessary observables for the flow
   * and starts listening for the flow-enabled state.
   * @since 2211.32.1
   */
  ngOnInit(): void {
    this.initializeFlowObservables();
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * This method triggers the initialization of the Checkout Flow feature.
   * @since 2211.32.1
   */
  ngAfterViewInit(): void {
    this.waitForDomAndMount();
    this.checkoutComFlowFacade.initializeFlow();
  }

  private waitForDomAndMount(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.listenForFlowEnabled();
      });
    });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * This method ensures that the `checkoutInstance` is cleaned up
   * by setting it to null if it is defined.
   * @since 2211.32.1
   */
  ngOnDestroy(): void {
    if (this.flowComponent?.unmount) {
      this.flowComponent.unmount();
    }
    if (this.checkoutInstance) {
      this.checkoutInstance = null;
    }
  }

  /**
   * Creates payment sessions for the Checkout Flow feature.
   *
   * This method delegates the creation of payment sessions to the CheckoutComFlowFacade
   * and returns an observable that emits the resulting Checkout Web Components.
   *
   * @returns {Observable<CheckoutWebComponents>} An observable that emits the created Checkout Web Components.
   * @since 2211.32.1
   */
  createPaymentSessions(customOptions: Partial<Options>): Observable<CheckoutWebComponents> {
    return this.checkoutComFlowFacade.createPaymentSessions(customOptions);
  }

  /**
   * Initializes the observables for the Checkout Flow feature.
   *
   * This method sets up the `isLoading$` observable to track the processing state
   * and the `isEnabled$` observable to track whether the flow is enabled.
   * @since 2211.32.1
   */
  protected initializeFlowObservables(): void {
    this.languageService.getActive().pipe(
      tap((activeLanguage: string): void => {
        this.checkoutComFlowFacade.setLocale(activeLanguage);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
    this.isLoading$ = this.checkoutComFlowFacade.getIsProcessing();
    this.isEnabled$ = this.checkoutComFlowFacade.getIsFlowEnabled();
  }

  /**
   * Subscribes to the `isEnabled$` observable to listen for when the Checkout Flow feature is enabled.
   *
   * Once the flow is enabled, this method triggers the creation of payment sessions
   * and handles the resulting Checkout Web Components or any errors that occur during the process.
   * The subscription is automatically cleaned up when the component is destroyed.
   *
   * @protected
   * @since 2211.32.1
   */
  protected listenForFlowEnabled(): void {
    this.isEnabled$.pipe(
      filter((isEnabled: boolean): boolean => Boolean(isEnabled)),
      take(1),
      switchMap((): Observable<CheckoutWebComponents> => this.createPaymentSessions(this.params)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (checkout: CheckoutWebComponents): void => this.handleWebComponentsLoaded(checkout),
      error: (error: unknown): void => this.handleWebComponentsError(error)
    });
  }

  /**
   * Handles the successful loading of Checkout Web Components.
   *
   * This method assigns the loaded `CheckoutWebComponents` instance to the `checkoutInstance` property
   * and mounts the flow component to the DOM.
   *
   * @param {CheckoutWebComponents} checkout - The loaded Checkout Web Components instance.
   * @protected
   * @since 2211.32.1
   */
  protected handleWebComponentsLoaded(checkout: CheckoutWebComponents): void {
    this.checkoutInstance = checkout;
    this.mountFlowComponent();
  }

  /**
   * Handles errors that occur while loading Checkout Web Components.
   *
   * This method sets the `webComponentsError` property to the error message
   * or a default message if the error message is unavailable. It also logs
   * the error using the `LoggerService` and displays a global error message
   * using the `GlobalMessageService`.
   *
   * @param {HttpErrorModel} error - The error object containing details about the failure.
   * @protected
   * @since 2211.32.1
   */
  protected handleWebComponentsError(error: HttpErrorModel): void {
    this.webComponentsError = error?.message || 'Unknown error loading payment components';
    this.loggerService.error(error);
    this.globalMessageService.add(this.webComponentsError, GlobalMessageType.MSG_TYPE_ERROR);
  }

  /**
   * Mounts the Checkout Flow component to the DOM.
   *
   * This method checks if the code is running in a browser environment and attempts to find
   * the container element with the ID `flow-container`. If the container is not found, an error
   * is logged and handled. If the container is found, it creates the flow component using the
   * `checkoutInstance` and mounts it to the container. Any errors during the creation or mounting
   * process are caught and handled.
   *
   * @protected
   * @since 2211.32.1
   */
  protected mountFlowComponent(): void {
    if (this.windowRef.isBrowser()) {
      const container: HTMLElement = document.getElementById('flow-container');

      if (!container) {
        this.loggerService.error('Flow container not found in DOM');
        this.handleWebComponentsError({ message: 'Payment container not found' });
        return;
      }
          const check = () => {
            const rect = container.getBoundingClientRect();
            const style = window.getComputedStyle(container);

            console.log("width: " + rect.width)
            console.log("height: " + rect.height)
            console.log("display: " + style.display)
            console.log("visibility: " + style.visibility)
      };
      check();


        this.flowComponent = this.checkoutInstance.create('flow', {
              onReady: () => console.log('✅ Flow ready (onReady)'),
              onError: (_self, error) => console.error('❌ Flow Error:', error),
              onChange: (state) => console.log('🔄 Flow change:', state)
            });
        this.flowComponent.mount(container);
        console.log('✅ Flow mount called')
        this.cd.detectChanges();

    }
  }
}
