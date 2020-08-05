import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import { ApiService } from 'ish-core/services/api/api.service';
import { loadUserByAPIToken } from 'ish-core/store/customer/user';

import { IdentityProvider } from './identity-provider.interface';

export interface Auth0Config {
  type: 'auth0';
  domain: string;
  clientID: string;
}

@Injectable({ providedIn: 'root' })
export class Auth0IdentityProvider implements IdentityProvider {
  constructor(private oauthService: OAuthService, private router: Router, private store: Store) {}

  async init(config: Auth0Config) {
    this.oauthService.configure({
      // Your Auth0 app's domain
      // Important: Don't forget to start with https://
      //  AND the trailing slash!
      issuer: `https://${config.domain}/`,

      // The app's clientId configured in Auth0
      clientId: config.clientID,

      // The app's redirectUri configured in Auth0
      redirectUri: window.location.origin,

      // Scopes ("rights") the Angular application wants get delegated
      //  scope: 'openid profile email offline_access',
      scope: 'openid email',

      // Using Authorization Code Flow
      // (PKCE is activated by default for authorization code flow)
      responseType: 'code',

      // Your Auth0 account's logout url
      // Derive it from your application's domain
      logoutUrl: `https://${config.domain}/v2/logout`,

      // customQueryParams: {
      //   // API identifier configured in Auth0
      //   audience: 'http://www.angular.at/api',
      // },
    });
    this.oauthService.setupAutomaticSilentRefresh();
    const loggedIn = await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    if (loggedIn && this.oauthService.getIdToken()) {
      this.store.dispatch(loadUserByAPIToken());
    }
  }

  async triggerLogin() {
    this.router.navigateByUrl('/loading');
    return await this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  triggerLogout() {
    this.oauthService.revokeTokenAndLogout(
      {
        client_id: this.oauthService.clientId,
        returnTo: this.oauthService.redirectUri,
      },
      true
    );
    return this.router.parseUrl('/loading');
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const newRequest = this.oauthService.getIdToken()
      ? req.clone({
          headers: req.headers.set(ApiService.AUTHORIZATION_HEADER_KEY, 'Bearer ' + this.oauthService.getIdToken()),
        })
      : req;
    return next.handle(newRequest);
  }
}
