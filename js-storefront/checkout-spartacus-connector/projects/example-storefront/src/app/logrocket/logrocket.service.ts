import { Injectable } from '@angular/core';
import { ActiveCartFacade, Cart } from '@spartacus/cart/base/root';
import LogRocket from 'logrocket';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogrocketService {

  constructor(public activeCartFacade: ActiveCartFacade) {
  }

  identify(): void {
    this.activeCartFacade.getActive()
      .pipe(
        filter((c: Cart): boolean => !!c && Object.keys(c).length > 0)
      ).subscribe({
        next: ({
          guid,
          user
        }: Cart): void => {
          try {
            LogRocket.identify(user.uid, {
              cart: guid,
              name: user.name,
            });
          } catch (error) {
            console.error('Failed to identify logrocket error tracking', error);
          }
        },
        error: (error: unknown): void => console.error('getActive with errors', { error })
      });
  }
}
