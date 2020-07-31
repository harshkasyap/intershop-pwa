import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { instance, mock } from 'ts-mockito';

import { ServerHtmlDirective } from 'ish-core/directives/server-html.directive';
import { CookieFacade } from 'ish-core/facades/cookie.facade';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';

import { CookieBannerComponent } from './cookie-banner.component';

describe('Cookie Banner Component', () => {
  let fixture: ComponentFixture<CookieBannerComponent>;
  let element: HTMLElement;
  let component: CookieBannerComponent;
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
      declarations: [CookieBannerComponent, MockDirective(ServerHtmlDirective)],
      providers: [
        {
          provide: CookieFacade,
          useFactory: () => ({ openCookieDialog$, cookiesService } as Partial<CookieFacade>),
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CookieBannerComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
