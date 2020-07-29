import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { getIdentityProvider } from 'ish-core/store/core/configuration';

@Injectable({ providedIn: 'root' })
export class IdentityProviderLoginGuard implements CanActivate {
  constructor(private store: Store, private oauthService: OAuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.pipe(
      select(getIdentityProvider),
      first(),
      map(provider => {
        if (provider) {
          console.log('IdentityProviderLoginGuard', provider);
          this.oauthService.loadDiscoveryDocumentAndLogin().then(_ => {
            const claims = this.oauthService.getIdentityClaims();
            console.log(claims);
          });
          return this.router.parseUrl('/loading');
        }
        return true;
      })
    );
  }
}
