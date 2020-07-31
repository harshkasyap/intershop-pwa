import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { instance, mock } from 'ts-mockito';

import { ServerHtmlDirective } from 'ish-core/directives/server-html.directive';
import { CookieFacade } from 'ish-core/facades/cookie.facade';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';

import { CookieBannerOptions } from '../../../models/cookie-banner-options.model';

import { CookieBannerModalComponent } from './cookie-banner-modal.component';

describe('Cookie Banner Modal Component', () => {
  let fixture: ComponentFixture<CookieBannerModalComponent>;
  let element: HTMLElement;
  let component: CookieBannerModalComponent;
  // tslint:disable-next-line:no-intelligence-in-artifacts
  let cookiesService: CookiesService;
  let cookieFacade: CookieFacade;
  let openCookieDialog$: Subject<boolean>;

  beforeEach(async(() => {
    cookieFacade = mock(cookieFacade);
    openCookieDialog$ = new Subject();
    cookiesService = instance(mock(cookiesService));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [CookieBannerModalComponent, MockDirective(ServerHtmlDirective)],
      providers: [
        {
          provide: CookieFacade,
          useFactory: () => ({ openCookieDialog$, cookiesService } as Partial<CookieFacade>),
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CookieBannerModalComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    component.options = {
      options: [
        {
          id: 'required',
          required: true,
          messageKeyTitle: 'foo.bar',
          messageKeyContent: 'bar.foo',
          whitelistedCookies: ['apiToken'],
        },
      ],
    } as CookieBannerOptions;
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
