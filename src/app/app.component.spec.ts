import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { instance, mock } from 'ts-mockito';

import { ServerHtmlDirective } from 'ish-core/directives/server-html.directive';
import { AppFacade } from 'ish-core/facades/app.facade';
import { CookieFacade } from 'ish-core/facades/cookie.facade';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';
import { findAllIshElements } from 'ish-core/utils/dev/html-query-utils';

import { AppComponent } from './app.component';
import { CookieBannerComponent } from './extensions/cookie-consent/shared/components/cookie-banner/cookie-banner.component';
import { FooterComponent } from './shell/footer/footer/footer.component';
import { HeaderComponent } from './shell/header/header/header.component';

let translate: TranslateService;

describe('App Component', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let element: HTMLElement;
  // tslint:disable-next-line:no-intelligence-in-artifacts
  let cookiesService: CookiesService;
  let cookieFacade: CookieFacade;
  let openCookieDialog$: Subject<boolean>;

  beforeEach(async(() => {
    cookieFacade = mock(cookieFacade);
    openCookieDialog$ = new Subject();
    cookiesService = instance(mock(cookiesService));

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        CookieBannerComponent,
        MockComponent(FooterComponent),
        MockComponent(HeaderComponent),
        MockDirective(ServerHtmlDirective),
      ],
      imports: [NoopAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AppFacade, useFactory: () => instance(mock(AppFacade)) },
        {
          provide: CookieFacade,
          useFactory: () => ({ openCookieDialog$, cookiesService } as Partial<CookieFacade>),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render header component on page', async(() => {
    expect(findAllIshElements(element)).toContain('ish-header');
  }));
});
