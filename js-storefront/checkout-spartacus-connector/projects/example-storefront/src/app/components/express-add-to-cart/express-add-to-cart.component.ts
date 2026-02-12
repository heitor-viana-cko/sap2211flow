import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createApplePaySession } from '@checkout-core/services/applepay/applepay-session';
import { getUserIdCartId } from '@checkout-core/shared/get-user-cart-id';
import { CheckoutComApplepayService } from '@checkout-services/applepay/checkout-com-applepay.service';
import { CheckoutComGooglepayService } from '@checkout-services/googlepay/checkout-com-googlepay.service';
import { AddToCartComponent } from '@spartacus/cart/base/components/add-to-cart';
import { MultiCartService } from '@spartacus/cart/base/core';
import { ActiveCartFacade, OrderEntry } from '@spartacus/cart/base/root';
import {
  CmsAddToCartComponent,
  CmsService,
  EventService,
  FeatureToggles,
  isNotNullable,
  LoggerService,
  Page,
  PageType,
  Product,
  ProductScope,
  UserIdService,
  WindowRef
} from '@spartacus/core';
import { CmsComponentData, CurrentProductService, ProductListItemContext } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-express-add-to-cart-component',
  templateUrl: './express-add-to-cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressAddToCartComponent extends AddToCartComponent implements OnDestroy {
  applePay: boolean = false;
  loadPaymentGoogleConfigurationSuccess: Observable<boolean> = of(false);
  protected logger: LoggerService = inject(LoggerService);
  protected validateShowQuantity: boolean = false;
  private destroyRef: DestroyRef = inject(DestroyRef);
  private featureToggle: FeatureToggles = inject(FeatureToggles);

  /**
   * Constructor for the ExpressAddToCartComponent.
   *
   * @param {CurrentProductService} currentProductService - Service to get the current product.
   * @param {ChangeDetectorRef} cd - Service to detect changes.
   * @param {ActiveCartFacade} activeCartService - Service to manage the active cart.
   * @param {CmsComponentData<CmsAddToCartComponent>} component - CMS component data.
   * @param {EventService} eventService - Service to handle events.
   * @param {ProductListItemContext} productListItemContext - Context for the product list item.
   * @param {CmsService} cmsService - Service to manage CMS data.
   * @param {UserIdService} userIdService - Service to manage user IDs.
   * @param {MultiCartService} multiCartService - Service to manage multiple carts.
   * @param {WindowRef} windowRef - Reference to the window object.
   * @param {CheckoutComApplepayService} checkoutComApplepayService - Service to manage Apple Pay.
   * @param {CheckoutComGooglepayService} checkoutComGooglePayService - Service to manage Google Pay.
   */
  constructor(
    protected override currentProductService: CurrentProductService,
    protected override cd: ChangeDetectorRef,
    protected override activeCartService: ActiveCartFacade,
    protected override component: CmsComponentData<CmsAddToCartComponent>,
    protected override eventService: EventService,
    protected override productListItemContext: ProductListItemContext,
    protected cmsService: CmsService,
    protected userIdService: UserIdService,
    protected multiCartService: MultiCartService,
    protected windowRef: WindowRef,
    protected checkoutComApplepayService: CheckoutComApplepayService,
    protected checkoutComGooglePayService: CheckoutComGooglepayService,
  ) {
    super(
      currentProductService,
      cd,
      activeCartService,
      component,
      eventService,
      productListItemContext
    );
    this.showApplePay();
  }

  override ngOnInit(): void {
    if (this.product) {
      this.productCode = this.product.code ?? '';
      this.setStockInfo(this.product);
      this.cd.markForCheck();
    } else if (this.productCode) {
      this.quantity = 1;
      this.hasStock = true;
      this.cd.markForCheck();
    } else {
      let product$: Observable<Product | null>;
      this.validateShowQuantity = false;
      this.isPDP().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (isPDP: boolean): void => {
          if (isPDP) {
            this.validateShowQuantity = true;
            if (this.featureToggle.showRealTimeStockInPDP) {
              product$ = this.currentProductService.getProduct([
                ProductScope.UNIT,
                ProductScope.DETAILS,
              ]);
            } else {
              product$ = this.currentProductService.getProduct();
            }
          } else if (this.productListItemContext) {
            product$ = this.productListItemContext.product$;
          }
        }
      });

      this.subscription.add(
        product$.pipe(filter(isNotNullable)).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (product: Product): void => {
            this.productCode = product.code ?? '';
            this.setStockInfo(product);
          }
        })
      );
    }
  }

  /**
   * Determines if the current page is a Product Detail Page (PDP).
   *
   * @returns {Observable<boolean>} - An observable that emits true if the current page is a PDP, otherwise false.
   */
  isPDP(): Observable<boolean> {
    return this.cmsService.getCurrentPage().pipe(
      map((page: Page): boolean => page.type === PageType.PRODUCT_PAGE),
    );
  }

  /**
   * Checks if Apple Pay is available and sets the applePay property accordingly.
   *
   * @returns {void}
   */
  showApplePay(): void {
    if (this.windowRef) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ApplePaySession: any = createApplePaySession(this.windowRef);
      this.applePay = !!(ApplePaySession && ApplePaySession.canMakePayments());
    }
  }

  /**
   * Removes the current cart by deleting it using the user ID and cart ID.
   *
   * @returns {void}
   */
  public removeCart(): void {
    getUserIdCartId(this.userIdService, this.activeCartService)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({
          userId,
          cartId
        }: { userId: string, cartId: string }): void => {
          this.multiCartService.deleteCart(cartId, userId);
        },
        error: (err: unknown): void => this.logger.error('getUserIdCartId with errors', { err })
      });
  }

  /**
   * Adds the current product to the cart and loads the payment configuration.
   *
   * @param {boolean} [googlePay] - Optional flag to indicate if Google Pay configuration should be loaded.
   * @returns {void}
   */
  public expressAddToCart(googlePay?: boolean): void {
    let removeCart: boolean = true,
      emptyCart: boolean = true;
    this.quantity = this.addToCartForm.get('quantity').value;
    this.activeCartService
      .getEntries().pipe(
        map((entries: OrderEntry[]): void => {
          if (entries.length === 0 && emptyCart) {
            emptyCart = false;
            removeCart = false;
            this.activeCartService.addEntry(this.productCode, this.quantity);
            this.loadPaymentConfiguration(googlePay);
          } else if (entries.length !== 0 && removeCart) {
            this.removeCart();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

  /**
   * Sets the stock information for the given product and updates the showQuantity property.
   *
   * @param {Product} product - The product for which to set the stock information.
   * @returns {void}
   */
  protected override setStockInfo(product: Product): void {
    super.setStockInfo(product);
    this.showQuantity = this.validateShowQuantity;
  }

  /**
   * Loads the payment configuration for Google Pay or Apple Pay.
   *
   * @param {boolean} [googlePay] - Optional flag to indicate if Google Pay configuration should be loaded.
   * @returns {void}
   */
  protected loadPaymentConfiguration(googlePay?: boolean): void {
    this.activeCartService.isStable().pipe(
      filter((loaded: boolean): boolean => Boolean(loaded)),
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (): void => {
        this.checkoutComApplepayService.requestApplePayPaymentRequest();
        if (googlePay) {
          this.checkoutComGooglePayService.requestMerchantConfiguration();
          this.loadPaymentGoogleConfigurationSuccess = of(true);
          this.cd.markForCheck();
        }
      },
      error: (err: unknown): void => this.logger.error('requesting payment request after add to cart with errors', { err })
    });
  }
}
