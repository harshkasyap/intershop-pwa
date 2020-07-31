import { ChangeDetectionStrategy, Compiler, Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { CookieFacade } from 'ish-core/facades/cookie.facade';

import { CookieBannerCookiedata } from '../../../models/cookie-banner-cookiedata.model';
import { CookieBannerOptions } from '../../../models/cookie-banner-options.model';
import { CookieBannerModalComponent } from '../cookie-banner-modal/cookie-banner-modal.component';

/**
 * Cookie Banner Component
 */
@Component({
  selector: 'ish-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  @Input()
  options: CookieBannerOptions;

  cookieData: CookieBannerCookiedata;

  showBanner = true;

  currentDialog: NgbModalRef;

  private destroy$ = new Subject();

  // tslint:disable-next-line:no-intelligence-in-artifacts
  constructor(
    private modalService: NgbModal,
    private compiler: Compiler,
    private injector: Injector,
    private cookieFacade: CookieFacade
  ) {}

  ngOnInit() {
    this.cookieFacade.openCookieDialog$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.currentDialog) {
        this.currentDialog.dismiss();
      }
      this.showDialog();
    });
    this.cookieData = JSON.parse(this.cookieFacade.cookiesService.get('cookie-consent') || 'null');
    this.showBannerIfNeeded();
    this.initCookieLawSeen();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCookieLawSeen() {
    if (this.cookieData?.enabledCookies.includes('tracking')) {
      this.cookieFacade.cookiesService.cookieLawSeen$.next(true);
    }
  }

  showBannerIfNeeded() {
    if (this.cookieData?.updatedAt) {
      const updatedAtCookie = new Date(this.cookieData.updatedAt).getTime();
      const updatedAtOptions = new Date(this.options.updatedAt).getTime();

      if (updatedAtOptions - updatedAtCookie < 0) {
        this.showBanner = false;
      }
    }
  }

  acceptAll() {
    this.saveAndReload(this.options.options.map(x => x.id));
  }

  showDialog() {
    import('../cookie-banner-modal/cookie-banner-modal.component').then(({ CookieBannerModalModule }) => {
      this.compiler.compileModuleAsync(CookieBannerModalModule).then(moduleFactory => {
        const moduleRef = moduleFactory.create(this.injector);
        const componentRef = moduleRef.instance.resolveCookieBannerModalComponent().create(this.injector);

        this.currentDialog = this.modalService.open(componentRef.componentType, {
          centered: true,
          size: 'md',
          backdrop: 'static',
        });

        const currentDialogInstance = this.currentDialog.componentInstance as CookieBannerModalComponent;
        currentDialogInstance.options = this.options;
        currentDialogInstance.cookieData = this.cookieData;

        currentDialogInstance.onChange.pipe(take(1), takeUntil(this.destroy$)).subscribe(enabledCookies => {
          this.saveAndReload(enabledCookies);
        });

        currentDialogInstance.close.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
          this.currentDialog.dismiss();
        });
      });
    });
  }

  saveAndReload(enabledCookies: string[]) {
    this.deleteAllCookies();
    this.cookieData = { updatedAt: new Date().toISOString(), enabledCookies };
    this.cookieFacade.cookiesService.put('cookie-consent', JSON.stringify(this.cookieData));
    window.location.reload();
  }

  deleteAllCookies() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = (eqPos > -1 ? cookie.substr(0, eqPos) : cookie).trim();
      if (!this.options.options[0].whitelistedCookies.includes(name)) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }
}
