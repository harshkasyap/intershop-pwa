import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class IdentityProviderLogoutGuard implements CanActivate {
  constructor(private oauthService: OAuthService, private router: Router) {}

  canActivate(): UrlTree {
    this.oauthService.revokeTokenAndLogout(
      {
        client_id: this.oauthService.clientId,
        returnTo: this.oauthService.redirectUri,
      },
      true
    );
    return this.router.parseUrl('/loading');
  }
}
