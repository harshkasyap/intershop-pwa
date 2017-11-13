import { Component } from '@angular/core';
import { UserDetail } from '../../../services/account-login/account-login.model';
import { AccountLoginService } from '../../../services/account-login/account-login.service';
import { LocalizeRouterService } from '../../../services/routes-parser-locale-currency/localize-router.service';

@Component({
  selector: 'is-login-status',
  templateUrl: './login-status.component.html'
})

export class LoginStatusComponent {

  userDetail: UserDetail = null;

  constructor(
    private accountLoginService: AccountLoginService,
    public localizeRouter: LocalizeRouterService
  ) {
    accountLoginService.subscribe(userDetail => this.userDetail = userDetail);
  }

  get isLoggedIn() {
    return this.accountLoginService.isAuthorized();
  }

  /**
   * navigates to login page
   * @returns void
   */
  logout() {
    this.accountLoginService.logout();
    this.localizeRouter.navigateToRoute('/home');
  }
}