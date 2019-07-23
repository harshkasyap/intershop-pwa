import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { combineLatest, interval } from 'rxjs';
import { filter, map, mapTo, switchMap, take, takeWhile, tap, withLatestFrom } from 'rxjs/operators';

import { CookiesService } from 'ish-core/services/cookies/cookies.service';
import { whenTruthy } from 'ish-core/utils/operators';
import { LoadBasketByAPIToken, getCurrentBasket } from '../checkout/basket';
import { LoadUserByAPIToken, LogoutUser, UserActionTypes, getAPIToken, getLoggedInUser } from '../user';

export class RestoreEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<{}>,
    private router: Router,
    private cookieService: CookiesService,
    @Inject(PLATFORM_ID) private platformId: string,
    private appRef: ApplicationRef
  ) {}

  @Effect({ dispatch: false })
  saveAPITokenToCookie$ = combineLatest([
    this.store$.pipe(select(getLoggedInUser)),
    this.store$.pipe(select(getCurrentBasket)),
    this.store$.pipe(select(getAPIToken)),
    this.cookieService.cookieLawSeen$,
  ]).pipe(
    filter(([user, basket]) => !!user || !!basket),
    map(([user, , apiToken]) => this.makeCookie(apiToken, user ? 'user' : 'basket')),
    tap(cookie => {
      const options = { expires: new Date(Date.now() + 3600000) };
      this.cookieService.put('apiToken', cookie, options);
    })
  );

  @Effect({ dispatch: false })
  destroyTokenInCookieOnLogout$ = this.actions$.pipe(
    ofType(UserActionTypes.LogoutUser),
    tap(() => {
      this.cookieService.remove('apiToken');
    })
  );

  @Effect()
  restoreUserOrBasketByToken$ = this.router.events.pipe(
    filter(event => event instanceof NavigationStart),
    take(1),
    map(() => this.cookieService.get('apiToken')),
    whenTruthy(),
    map(c => this.parseCookie(c)),
    map(cookie =>
      cookie.type === 'basket'
        ? new LoadBasketByAPIToken({ apiToken: cookie.apiToken })
        : new LoadUserByAPIToken({ apiToken: cookie.apiToken })
    )
  );

  @Effect()
  logOutUserIfTokenVanishes$ = this.appRef.isStable.pipe(
    whenTruthy(),
    take(1),
    switchMap(() =>
      interval(1000).pipe(
        takeWhile(() => isPlatformBrowser(this.platformId)),
        withLatestFrom(this.store$.pipe(select(getLoggedInUser)), this.cookieService.cookieLawSeen$),
        filter(([, , cookieLawAccepted]) => cookieLawAccepted),
        map(([, user]) => ({ user, apiToken: this.cookieService.get('apiToken') })),
        filter(({ user, apiToken }) => user && !apiToken),
        mapTo(new LogoutUser())
      )
    )
  );

  private makeCookie(apiToken: string, type: 'user' | 'basket'): string {
    return apiToken ? JSON.stringify({ apiToken, type }) : undefined;
  }

  private parseCookie(cookie: string) {
    return JSON.parse(cookie) as { apiToken: string; type: 'user' | 'basket' };
  }
}
