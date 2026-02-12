import { ActivatedRouteSnapshot, convertToParamMap, Params, RouterStateSnapshot } from '@angular/router';

export function fakeActivatedRouteSnapshot(options: Partial<ActivatedRouteSnapshot>) {
  return options as ActivatedRouteSnapshot;
}

export function fakeRouterStateSnapshot(options: Partial<RouterStateSnapshot>) {
  return options as RouterStateSnapshot;
}

export function fakeParamMaps(params: Params){
  return convertToParamMap(params);
}