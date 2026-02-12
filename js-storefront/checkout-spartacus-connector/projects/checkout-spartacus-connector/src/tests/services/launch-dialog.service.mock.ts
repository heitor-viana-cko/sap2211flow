import { ElementRef, ViewContainerRef } from '@angular/core';
import { LAUNCH_CALLER, LaunchDialogService } from '@spartacus/storefront';
import { BehaviorSubject, of } from 'rxjs';

let dialogClose$: BehaviorSubject<any | undefined> = new BehaviorSubject(undefined);

export class MockLaunchDialogService implements Partial<LaunchDialogService> {

  get dialogClose() {
    return dialogClose$.asObservable();
  }

  launch() {
  }

  closeDialog(reason: any): void {
    dialogClose$.next(reason);
  }

  openDialog(
    _caller: LAUNCH_CALLER,
    _openElement?: ElementRef,
    _vcr?: ViewContainerRef,
    _data?: any
  ) {
    return of();
  }

  openDialogAndSubscribe(
    _caller: LAUNCH_CALLER,
    _openElement?: ElementRef,
    _data?: any
  ) {
  }

  clear() {
  }
}
