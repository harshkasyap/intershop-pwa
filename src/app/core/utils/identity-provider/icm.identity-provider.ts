import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store, select } from '@ngrx/store';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, concatMap, filter, first, map, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';

import { ApiService } from 'ish-core/services/api/api.service';
import { getDeviceType } from 'ish-core/store/core/configuration';
import { selectQueryParam } from 'ish-core/store/core/router';
import { loadBasketByAPIToken } from 'ish-core/store/customer/basket';
import { loadOrderByAPIToken } from 'ish-core/store/customer/orders';
import { getPGID, getUserAuthorized, loadUserByAPIToken, logoutUser } from 'ish-core/store/customer/user';
import { ApiTokenService } from 'ish-core/utils/api-token/api-token.service';
import { whenTruthy } from 'ish-core/utils/operators';
import { LoginModalComponent } from 'ish-shared/components/login/login-modal/login-modal.component';

import { IdentityProvider } from './identity-provider.interface';

@Injectable({ providedIn: 'root' })
export class ICMIdentityProvider implements IdentityProvider {
  private currentDialog: NgbModalRef;
  private isMobile: boolean;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private store: Store,
    private apiTokenService: ApiTokenService
  ) {
    store.pipe(select(getDeviceType), first()).subscribe(type => (this.isMobile = type === 'mobile'));
  }

  private appendAuthentication(req: HttpRequest<unknown>): Observable<HttpRequest<unknown>> {
    return this.apiTokenService.apiToken$.pipe(
      map(apiToken =>
        apiToken && !req.headers?.has(ApiService.AUTHORIZATION_HEADER_KEY)
          ? req.clone({ headers: req.headers.set(ApiService.TOKEN_HEADER_KEY, apiToken) })
          : req
      ),
      // TODO: workaround removing auth token for cms if pgid is not available
      withLatestFrom(this.store.pipe(select(getPGID))),
      map(([newRequest, pgid]) =>
        !pgid && newRequest.url.includes('/cms/')
          ? newRequest.clone({ headers: newRequest.headers.delete(ApiService.TOKEN_HEADER_KEY) })
          : newRequest
      ),
      first()
    );
  }

  init() {
    timer(500, 200)
      .pipe(
        filter(() => this.router.navigated),
        first(),
        switchMap(() => this.apiTokenService.initialCookie$.pipe(whenTruthy()))
      )
      .subscribe(cookie => {
        switch (cookie.type) {
          case 'user': {
            this.store.dispatch(loadUserByAPIToken());
            break;
          }
          case 'basket': {
            this.store.dispatch(loadBasketByAPIToken({ apiToken: cookie.apiToken }));
            break;
          }
          case 'order': {
            this.store.dispatch(loadOrderByAPIToken({ orderId: cookie.orderId, apiToken: cookie.apiToken }));
            break;
          }
        }
      });

    this.apiTokenService.cookieVanishes$.subscribe(type => {
      this.store.dispatch(logoutUser());
      if (type === 'user') {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url, messageKey: 'session_timeout' },
        });
      }
    });
  }

  async triggerLogin(route: ActivatedRouteSnapshot) {
    // first request should go to page
    if (!this.router.navigated) {
      return true;
    }

    // mobile view should not use modal
    if (this.isMobile) {
      return true;
    }

    // force page view by queryParam
    if (route.queryParams.forcePageView) {
      return true;
    }

    const returnUrl = route.queryParams.returnUrl || '/home';

    const component = (await import('../../../shared/components/login/login-modal/login-modal.component'))
      .LoginModalComponent;

    this.currentDialog = this.modalService.open(component, { centered: true, size: 'sm' });

    const loginModalComponent = this.currentDialog.componentInstance as LoginModalComponent;
    loginModalComponent.loginMessageKey = route.queryParamMap.get('messageKey');

    // dialog closed
    loginModalComponent.close.pipe(first()).subscribe(() => {
      this.currentDialog.dismiss();
    });

    // navigated away with link on dialog
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        first()
      )
      .subscribe(() => {
        this.currentDialog.dismiss();
      });

    // login successful
    this.store.pipe(select(getUserAuthorized), whenTruthy(), first()).subscribe(() => {
      this.currentDialog.dismiss();
      this.router.navigateByUrl(returnUrl);
    });

    return false;
  }

  triggerLogout() {
    this.store.dispatch(logoutUser());
    this.apiTokenService.removeApiToken();
    return this.store.pipe(
      select(selectQueryParam('returnUrl')),
      map(returnUrl => returnUrl || '/home'),
      map(returnUrl => this.router.parseUrl(returnUrl))
    );
  }

  private isAuthTokenError(err: unknown) {
    return (
      err instanceof HttpErrorResponse && typeof err.error === 'string' && err.error.includes('AuthenticationToken')
    );
  }

  private setTokenFromResponse(event: HttpEvent<unknown>) {
    if (event instanceof HttpResponse) {
      const apiToken = event.headers.get(ApiService.TOKEN_HEADER_KEY);
      if (apiToken) {
        if (apiToken.startsWith('AuthenticationTokenOutdated') || apiToken.startsWith('AuthenticationTokenInvalid')) {
          this.apiTokenService.invalidateApiToken();
        } else if (!event.url.endsWith('/configurations')) {
          this.apiTokenService.setApiToken(apiToken);
        }
      }
    }
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.appendAuthentication(req).pipe(
      concatMap(request =>
        next.handle(request).pipe(
          catchError(err => {
            if (this.isAuthTokenError(err)) {
              this.apiTokenService.invalidateApiToken();

              // retry request without auth token
              const retryRequest = request.clone({ headers: request.headers.delete(ApiService.TOKEN_HEADER_KEY) });
              // timer introduced for testability
              return timer(500).pipe(switchMapTo(next.handle(retryRequest)));
            }
            return throwError(err);
          }),
          tap(event => this.setTokenFromResponse(event))
        )
      )
    );
  }
}
