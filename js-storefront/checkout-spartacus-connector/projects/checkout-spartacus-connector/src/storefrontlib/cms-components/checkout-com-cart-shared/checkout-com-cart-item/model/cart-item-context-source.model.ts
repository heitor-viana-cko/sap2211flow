/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
  CartItemComponentOptions,
  CartItemContext,
  OrderEntry,
  PromotionLocation,
} from '@spartacus/cart/base/root';
import { ReplaySubject } from 'rxjs';

/**
 * Context source for `CartItemComponent`.
 *
 * `CartItemContext` should be injected instead in child components.
 */
@Injectable()
export class CartItemContextSource implements CartItemContext {
  readonly compact$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  readonly readonly$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  readonly item$: ReplaySubject<OrderEntry> = new ReplaySubject<OrderEntry>(1);

  readonly quantityControl$: ReplaySubject<UntypedFormControl> = new ReplaySubject<UntypedFormControl>(1);

  readonly location$: ReplaySubject<PromotionLocation> = new ReplaySubject<PromotionLocation>(1);

  readonly options$: ReplaySubject<CartItemComponentOptions> = new ReplaySubject<CartItemComponentOptions>(1);
}
