/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveCartFacade, CartOutlets, DeliveryMode, OrderEntry } from '@spartacus/cart/base/root';
import { CheckoutStepService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade, CheckoutDeliveryModesFacade, CheckoutStepType } from '@spartacus/checkout/base/root';
import { Address, FeatureConfigService, QueryState, TranslationService } from '@spartacus/core';
import { deliveryAddressCard, deliveryModeCard } from '@spartacus/order/root';
import { Card, ICON_TYPE } from '@spartacus/storefront';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-checkout-review-shipping',
  templateUrl: './checkout-com-checkout-review-shipping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComCheckoutReviewShippingComponent {
  readonly cartOutlets: typeof CartOutlets = CartOutlets;
  iconTypes: typeof ICON_TYPE = ICON_TYPE;
  deliveryAddressStepRoute: string = this.checkoutStepService.getCheckoutStepRoute(
    CheckoutStepType.DELIVERY_ADDRESS
  );
  deliveryModeStepRoute: string = this.checkoutStepService.getCheckoutStepRoute(
    CheckoutStepType.DELIVERY_MODE
  );
  entries$: Observable<OrderEntry[]> =
    this.activeCartFacade.getDeliveryEntries();
  deliveryAddress$: Observable<Address | undefined> =
    this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      filter((state: QueryState<Address>): boolean => !state.loading && !state.error),
      map((state: QueryState<Address>): Address => state.data)
    );
  deliveryMode$: Observable<DeliveryMode | undefined> =
    this.checkoutDeliveryModesFacade.getSelectedDeliveryModeState().pipe(
      filter((state: QueryState<DeliveryMode>): boolean => !state.loading && !state.error),
      map((state: QueryState<DeliveryMode>): DeliveryMode => state.data)
    );
  protected featureConfig: FeatureConfigService = inject(FeatureConfigService);
  private showDeliveryOptionsTranslation: boolean = this.featureConfig.isEnabled(
    'showDeliveryOptionsTranslation'
  );

  constructor(
    protected activeCartFacade: ActiveCartFacade,
    protected checkoutDeliveryModesFacade: CheckoutDeliveryModesFacade,
    protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected translationService: TranslationService,
    protected checkoutStepService: CheckoutStepService
  ) {
  }

  getDeliveryAddressCard(
    deliveryAddress: Address,
    countryName?: string
  ): Observable<Card> {
    return combineLatest([
      this.translationService.translate('addressCard.shipTo'),
      this.translationService.translate('addressCard.phoneNumber'),
      this.translationService.translate('addressCard.mobileNumber'),
    ]).pipe(
      map(([textTitle, textPhone, textMobile]: [string, string, string]): Card =>
        deliveryAddressCard(
          textTitle,
          textPhone,
          textMobile,
          deliveryAddress,
          countryName
        )
      )
    );
  }

  getDeliveryModeCard(deliveryMode: DeliveryMode): Observable<Card> {
    return combineLatest([
      this.translationService.translate(
        this.showDeliveryOptionsTranslation
          ? 'checkoutMode.deliveryOptions'
          : 'checkoutMode.deliveryMethod'
      ),
    ]).pipe(map(([textTitle]: [string]): Card => deliveryModeCard(textTitle, deliveryMode)));
  }
}
